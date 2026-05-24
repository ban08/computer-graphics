import { CGFobject, CGFshader } from '../../../lib/CGF.js';
import { MyGrassBlade } from '../../primitives/MyGrassBlade.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';

/**
 * Internal sub-mesh - one VBO worth of grass triangles. Multiple of these
 * are chained under a single shader bind so the field can hold more than
 * the WebGL 1 Uint16 index ceiling (~65k) allows in a single buffer.
 */
class GrassMeshChunk extends CGFobject {
    constructor(scene, data) {
        super(scene);
        this.vertices = data.vertices;
        this.normals = data.normals;
        this.texCoords = data.texCoords;
        this.indices = data.indices;
        this.primitiveType = scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display() {
        const gl = this.scene.gl;
        const shader = this.scene.activeShader;

        gl.uniformMatrix4fv(shader.uniforms.uMVMatrix, false, this.scene.activeMatrix);

        if (shader.attributes.aVertexPosition !== undefined && shader.attributes.aVertexPosition >= 0) {
            gl.enableVertexAttribArray(shader.attributes.aVertexPosition);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        }

        if (shader.attributes.aVertexNormal !== undefined && shader.attributes.aVertexNormal >= 0) {
            gl.enableVertexAttribArray(shader.attributes.aVertexNormal);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normsBuffer);
            gl.vertexAttribPointer(shader.attributes.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
        }

        if (shader.attributes.aTextureCoord !== undefined && shader.attributes.aTextureCoord >= 0) {
            gl.enableVertexAttribArray(shader.attributes.aTextureCoord);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
            gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.drawElements(this.primitiveType, this.indicesBuffer.numValues, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}

/**
 * MyGrass
 *
 * Irregular prairie grass built from one Poisson-disc candidate field.
 * A cheap CPU-side density mask turns candidates into dense green patches,
 * open dirt gaps, and short dead tufts without stamping visible circular
 * patch meshes onto the terrain. Wind animation lives in the vertex shader
 * and scales with blade height so the slider units are intuitive.
 *
 * @constructor
 * @param scene   - Reference to MyScene object
 * @param terrain - Terrain used for blade height snapping and dryness sampling
 * @param opts    - Optional override map
 */
export class MyGrass {
    constructor(scene, terrain, opts = {}) {
        this.scene = scene;
        this.terrain = terrain;

        // Poisson points are tuft anchors, not individual blades. Each
        // accepted anchor expands into a compact clump, which avoids the
        // "random spike" look while keeping polygon count predictable.
        this.tuftSpacing = opts.tuftSpacing ?? 0.24;
        this.bladeWidth = opts.bladeWidth ?? 0.014;
        this.bladeHeight = opts.bladeHeight ?? 0.085;
        this.densityFactor = opts.densityFactor ?? 10.0;
        this.bladeScale = opts.bladeScale ?? 1.0;
        this.colorVariation = opts.colorVariation ?? 1.0;
        this.excludePathRadius = opts.excludePathRadius ?? 1.2;
        this.fieldRadius = (opts.fieldRadius ?? terrain.maxRadius) * 0.97;
        this.maxBlades = opts.maxBlades ?? 125000;

        this.visible = true;
        // windStrength is dimensionless: multiplied by blade height in the
        // vertex shader, so 0.3 means "tip moves 30% of blade height".
        this.windStrength = 0.65;
        this.windSpeed = 1.6;
        this.windAngleDeg = 35;

        this.blade = new MyGrassBlade(this.bladeWidth, this.bladeHeight);

        this.shader = new CGFshader(
            scene.gl,
            "shaders/grass/grass.vert",
            "shaders/grass/grass.frag"
        );

        const windRad = this.windAngleDeg * Math.PI / 180.0;
        this.shader.setUniformsValues({
            timeFactor: 0.0,
            windDir: [Math.cos(windRad), Math.sin(windRad)],
            windStrength: this.windStrength,
            windSpeed: this.windSpeed,
            uBladeHeight: this.bladeHeight * this.bladeScale,
            // Two alive shades: fragment shader picks per blade via shader-
            // side noise on world XZ for natural hue drift.
            aliveBaseCool: [0.09, 0.30, 0.10],
            aliveTipCool:  [0.44, 0.72, 0.24],
            aliveBaseWarm: [0.21, 0.34, 0.08],
            aliveTipWarm:  [0.74, 0.78, 0.24],
            dryBase:   [0.46, 0.33, 0.11],
            dryTip:    [0.92, 0.74, 0.28],
            colorVariation: this.colorVariation,
            skyAmbient:    [0.66, 0.78, 0.88],
            groundAmbient: [0.55, 0.48, 0.32],
            sunDir:    [0.4, 0.85, 0.4],
            ambient:   0.72,
            maxRadius: terrain.maxRadius,
            hazeColor: [0.74, 0.82, 0.84],
            hazeStrength: 0.22,
        });

        this.chunks = [];
        this.bladeCount = 0;
        this.buildField();
    }

    buildField() {
        // Density acts on two knobs at once: Poisson anchor spacing (sqrt so
        // it scales with 2D area), and the blade budget cap. tuftChance also
        // scales via amountScale in samplePatchProfile, but that alone saturates
        // because the anchor field is finite — spacing is what lets the slider
        // push past the default look.
        const densityRatio = Math.max(this.densityFactor / 10.0, 0.05);
        const effectiveSpacing = Math.max(0.075, this.tuftSpacing / Math.sqrt(densityRatio));
        const effectiveMaxBlades = Math.min(400000, Math.floor(this.maxBlades * densityRatio));

        const generator = new PlacementGenerator(
            0, 0, this.fieldRadius
        );

            const keepAwayFromCenter = (x, z) => {
            return Math.sqrt(x * x + z * z) > this.excludePathRadius && !this.terrain.isPointOnPath(x, z);
        };

        const tuftAnchors = generator.generatePoints(effectiveSpacing, 20);
        this.shuffleTuftAnchors(tuftAnchors);

        const VERTEX_LIMIT = 64000;
        const VERTS_PER_BLADE = 4;

        let current = this.makeEmptyChunkData();

        const flush = () => {
            if (current.vertices.length === 0) return;
            this.chunks.push(new GrassMeshChunk(this.scene, current));
            current = this.makeEmptyChunkData();
        };

        for (let i = 0; i < tuftAnchors.length; i++) {
            const p = tuftAnchors[i];
            if (!keepAwayFromCenter(p.x, p.z)) continue;

            const dryness = this.terrain.getDrynessAt
                ? this.terrain.getDrynessAt(p.x, p.z)
                : 0.0;

            const profile = this.samplePatchProfile(p.x, p.z, dryness);
            if (Math.random() > profile.tuftChance) continue;

            const bladesHere = Math.floor(
                profile.bladeMin + Math.random() * (profile.bladeMax - profile.bladeMin + 1)
            );
            const tuftRadius = 0.055 + profile.greenPatch * 0.105 + profile.dryPatch * 0.045;
            const tuftLean = Math.random() * Math.PI * 2;

            for (let b = 0; b < bladesHere; b++) {
                if (this.bladeCount >= effectiveMaxBlades) break;

                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetRadius = Math.sqrt(Math.random()) * tuftRadius;
                const x = p.x + Math.cos(offsetAngle) * offsetRadius;
                const z = p.z + Math.sin(offsetAngle) * offsetRadius;

                if (!keepAwayFromCenter(x, z)) continue;
                if (x * x + z * z > this.fieldRadius * this.fieldRadius) continue;

                const localDryness = this.clamp(
                    profile.bladeDryness + (Math.random() - 0.5) * 0.08,
                    0.0,
                    1.0
                );
                const dryFactor = 1.0 - 0.50 * localDryness;
                const patchHeight = 0.56 + profile.greenPatch * 0.34;
                const centerBoost = 1.0 - 0.28 * (offsetRadius / Math.max(tuftRadius, 0.001));
                const heightScale = (patchHeight + Math.random() * 0.24) * dryFactor * centerBoost * this.bladeScale;
                const widthScale = 0.62 + Math.random() * 0.44;
                const bladeRotY = offsetAngle * 0.55 + tuftLean * 0.45 + (Math.random() - 0.5) * 0.75;
                const toneSeed = this.hash2(x * 11.3 + b * 17.1, z * 13.7 + this.bladeCount * 0.013);
                const y = this.terrain.getHeightAt(x, z);

                if ((current.vertices.length / 3) + VERTS_PER_BLADE > VERTEX_LIMIT) {
                    flush();
                }

                this.blade.build(
                    x, y, z,
                    bladeRotY, widthScale, heightScale, localDryness, toneSeed,
                    current
                );

                this.bladeCount++;
            }

            if (this.bladeCount >= effectiveMaxBlades) break;
        }

        flush();
    }

    makeEmptyChunkData() {
        return {
            vertices: [],
            normals: [],
            texCoords: [],
            indices: [],
        };
    }

    updateSunDir(x, y, z) {
        const len = Math.sqrt(x * x + y * y + z * z) || 1.0;
        this.shader.setUniformsValues({ sunDir: [x / len, y / len, z / len] });
    }

    update(t, windSource = null) {
        if (windSource) {
            this.windAngleDeg = windSource.windAngleDeg;
            this.windSpeed = 0.55 + windSource.driftSpeed * 55.0;
            this.windStrength = this.clamp(0.36 + windSource.driftSpeed * 14.5, 0.34, 1.15);
        }

        const windRad = this.windAngleDeg * Math.PI / 180.0;
        this.shader.setUniformsValues({
            timeFactor: (t / 1000.0) % 10000.0,
            windDir: [Math.cos(windRad), Math.sin(windRad)],
            windStrength: this.windStrength,
            windSpeed: this.windSpeed,
            colorVariation: this.colorVariation,
        });
    }

    rebuild() {
        this.blade = new MyGrassBlade(this.bladeWidth, this.bladeHeight);
        this.chunks = [];
        this.bladeCount = 0;
        this.shader.setUniformsValues({
            uBladeHeight: this.bladeHeight * this.bladeScale,
            colorVariation: this.colorVariation,
        });
        this.buildField();
    }

    clamp(x, min, max) {
        return Math.max(min, Math.min(max, x));
    }

    smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }

    hash2(x, z) {
        const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
        return n - Math.floor(n);
    }

    vnoise(x, z) {
        const ix = Math.floor(x);
        const iz = Math.floor(z);
        const fx = x - ix;
        const fz = z - iz;
        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uz = fz * fz * (3.0 - 2.0 * fz);

        const a = this.hash2(ix, iz);
        const b = this.hash2(ix + 1, iz);
        const c = this.hash2(ix, iz + 1);
        const d = this.hash2(ix + 1, iz + 1);
        const x1 = a * (1.0 - ux) + b * ux;
        const x2 = c * (1.0 - ux) + d * ux;

        return x1 * (1.0 - uz) + x2 * uz;
    }

    fbm(x, z) {
        let value = 0.0;
        let amplitude = 0.5;

        for (let i = 0; i < 4; i++) {
            value += this.vnoise(x, z) * amplitude;
            x = x * 2.03 + 11.7;
            z = z * 2.01 + 6.3;
            amplitude *= 0.5;
        }

        return value;
    }

    samplePatchProfile(x, z, terrainDryness) {
        const macro = this.fbm(x * 0.070 + 8.2, z * 0.070 - 3.9);
        const medium = this.vnoise(x * 0.22 + 4.1, z * 0.22 + 9.4);
        const fine = this.vnoise(x * 0.72 - 2.8, z * 0.72 + 5.6);

        // Patch type is driven by terrain dryness. Noise only nudges the
        // boundary so the transition looks organic — it must not be strong
        // enough to flip a wet cell to dry or vice-versa.
        const dryBias = this.smoothstep(0.10, 0.85, terrainDryness + (fine - 0.5) * 0.08);
        const greenBias = 1.0 - dryBias;

        // Macro/medium noise still introduces patchy lushness inside the
        // green zone, but it cannot bleed into dry terrain.
        const greenPatch = this.smoothstep(0.30, 0.72, macro + (medium - 0.5) * 0.20) * greenBias;
        const dryPatch = dryBias;

        const liveMass = this.smoothstep(0.32, 0.84, greenPatch);
        const dryMass = this.smoothstep(0.30, 0.82, dryPatch);
        const tuftMass = Math.max(liveMass, dryMass * 0.86);
        const prairieBase = 0.48;
        const amountScale = this.densityFactor / 10.0;
        const tuftChance = this.clamp((prairieBase + tuftMass * 0.38) * amountScale, 0.0, 1.0);
        // Blade dryness mirrors terrain dryness almost 1:1, with only a tiny
        // jitter so a single patch doesn't read as flat-colored.
        const bladeDryness = this.clamp(terrainDryness * 0.95 + (fine - 0.5) * 0.06, 0.0, 1.0);
        const bladeMin = dryMass > liveMass ? 5 : 8;
        const bladeMax = Math.floor((dryMass > liveMass ? 11 : 17) + tuftMass * 6);

        return { tuftChance, greenPatch, dryPatch, bladeDryness, bladeMin, bladeMax };
    }

    shuffleTuftAnchors(anchors) {
        for (let i = anchors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = anchors[i];
            anchors[i] = anchors[j];
            anchors[j] = tmp;
        }
    }

    display() {
        if (!this.visible) return;
        if (this.chunks.length === 0) return;

        const gl = this.scene.gl;
        const cullWasEnabled = gl.isEnabled(gl.CULL_FACE);
        // Blade quads are one-sided; without this, half of each blade would
        // be invisible depending on rotY.
        gl.disable(gl.CULL_FACE);

        this.scene.setActiveShader(this.shader);
        for (let i = 0; i < this.chunks.length; i++) {
            this.chunks[i].display();
        }
        this.scene.setActiveShader(this.scene.defaultShader);

        if (cullWasEnabled) gl.enable(gl.CULL_FACE);
    }
}
