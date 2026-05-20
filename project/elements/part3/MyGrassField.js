import { CGFobject, CGFshader } from '../../../lib/CGF.js';
import { MyGrassBlade } from '../../primitives/MyGrassBlade.js';
import { GrassPatchLayout } from '../../utils/GrassPatchLayout.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';

/**
 * MyGrassField
 *
 * Dense grass + dry-patch system. Scatters patches across the terrain disc
 * using Poisson sampling, expands each patch with a reusable blade-offset
 * layout, and bakes every blade triangle into one big VBO so the whole
 * field renders in a single draw call (no per-blade or per-patch state
 * changes). Wind is animated entirely in the vertex shader.
 *
 * @constructor
 * @param scene   - Reference to MyScene object
 * @param terrain - Terrain used for blade height snapping and dryness sampling
 * @param opts    - Optional override map (patchSpacing, bladeMinDist, etc.)
 */
export class MyGrassField extends CGFobject {
    constructor(scene, terrain, opts = {}) {
        super(scene);

        this.terrain = terrain;
        this.patchSpacing = opts.patchSpacing ?? 2.5;
        this.patchRadius = opts.patchRadius ?? 0.7;
        this.bladeMinDist = opts.bladeMinDist ?? 0.15;
        this.bladeWidth = opts.bladeWidth ?? 0.08;
        this.bladeHeight = opts.bladeHeight ?? 0.40;
        this.excludePathRadius = opts.excludePathRadius ?? 3.0;
        this.fieldRadius = (opts.fieldRadius ?? terrain.maxRadius) * 0.97;

        this.visible = true;
        this.windStrength = 0.15;
        this.windSpeed = 1.0;
        this.windAngleDeg = 35;

        this.blade = new MyGrassBlade(this.bladeWidth, this.bladeHeight);
        this.layout = new GrassPatchLayout(this.patchRadius, this.bladeMinDist);

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
            aliveBase: [0.08, 0.26, 0.10],
            aliveTip:  [0.55, 0.72, 0.30],
            dryBase:   [0.36, 0.31, 0.16],
            dryTip:    [0.76, 0.68, 0.36],
            sunDir:    [0.4, 0.85, 0.4],
            ambient:   0.38,
            maxRadius: terrain.maxRadius,
            hazeColor: [0.74, 0.82, 0.84],
            hazeStrength: 0.22,
        });

        this.initBuffers();
    }

    initBuffers() {
        const out = {
            vertices: [],
            normals: [],
            texCoords: [],
            indices: [],
        };

        const generator = new PlacementGenerator(
            0, 0, this.fieldRadius,
            (x, z) => this.terrain.getHeightAt(x, z)
        );

        const keepAwayFromCenter = (x, z) =>
            Math.sqrt(x * x + z * z) > this.excludePathRadius;

        const patchCenters = generator.generatePlacements(
            this.patchSpacing, 20, keepAwayFromCenter
        );

        const offsets = this.layout.offsets;
        const bladesInLayout = this.layout.bladeCount;

        // Uint16 index ceiling — stop early if we'd overflow the index buffer.
        const VERTEX_LIMIT = 64000;

        let totalBlades = 0;

        for (let pi = 0; pi < patchCenters.length; pi++) {
            if ((out.vertices.length / 3) + bladesInLayout * 3 > VERTEX_LIMIT) break;

            const center = patchCenters[pi];
            const patchRot = Math.random() * Math.PI * 2;
            const cPatch = Math.cos(patchRot);
            const sPatch = Math.sin(patchRot);

            for (let bi = 0; bi < bladesInLayout; bi++) {
                const ox = offsets[bi * 2];
                const oz = offsets[bi * 2 + 1];

                const wx = center.x + ox * cPatch + oz * sPatch;
                const wz = center.z - ox * sPatch + oz * cPatch;

                if (wx * wx + wz * wz > this.fieldRadius * this.fieldRadius) continue;

                const wy = this.terrain.getHeightAt(wx, wz);
                const dryness = this.terrain.getDrynessAt
                    ? this.terrain.getDrynessAt(wx, wz)
                    : 0.0;

                // Dry blades sit shorter and tilt a bit more often — visual cue.
                const dryFactor = 1.0 - 0.35 * dryness;

                const bladeRotY = Math.random() * Math.PI * 2;
                const heightScale = (0.7 + Math.random() * 0.45) * dryFactor;
                const widthScale = 0.85 + Math.random() * 0.30;

                this.blade.build(
                    wx, wy, wz,
                    bladeRotY, widthScale, heightScale, dryness,
                    out
                );

                totalBlades++;
            }
        }

        this.vertices = out.vertices;
        this.normals = out.normals;
        this.texCoords = out.texCoords;
        this.indices = out.indices;

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();

        this.bladeCount = totalBlades;
    }

    updateSunDir(x, y, z) {
        const len = Math.sqrt(x * x + y * y + z * z) || 1.0;
        this.shader.setUniformsValues({ sunDir: [x / len, y / len, z / len] });
    }

    update(t) {
        const windRad = this.windAngleDeg * Math.PI / 180.0;
        // Keep timeFactor bounded so single-precision sin() doesn't drift.
        this.shader.setUniformsValues({
            timeFactor: (t / 1000.0) % 10000.0,
            windDir: [Math.cos(windRad), Math.sin(windRad)],
            windStrength: this.windStrength,
            windSpeed: this.windSpeed,
        });
    }

    display() {
        if (!this.visible) return;

        const gl = this.scene.gl;
        // Blade triangles are one-sided; without this, half of every blade
        // would be invisible depending on rotY.
        gl.disable(gl.CULL_FACE);

        this.scene.setActiveShader(this.shader);
        super.display();
        this.scene.setActiveShader(this.scene.defaultShader);

        gl.enable(gl.CULL_FACE);
    }
}
