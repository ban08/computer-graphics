import { CGFobject, CGFshader } from '../../../lib/CGF.js';
import { MyPlane } from '../../primitives/MyPlane.js';

/**
 * MyTerrain
 * @constructor
 * @param scene - Reference to MyScene object
 * @param seed - Procedural noise seed
 * @param size - Side length of the terrain plane
 * @param divisions - Number of terrain plane subdivisions
 * @param heightScale - Vertical scale applied to the generated height
 * @param frequency - Frequency used to sample the procedural noise
 * @param hazeStrength - Amount of distance haze applied by the fragment shader
 * @param maxRadius - Visible circular terrain radius
 */
export class MyTerrain extends CGFobject {
    constructor(scene, seed, size, divisions, heightScale, frequency, hazeStrength, maxRadius) {
        super(scene);

        this.seed = seed ?? Math.random() * 1000;
        this.size = size ?? 64;
        this.divisions = divisions ?? 128;
        this.heightScale = heightScale ?? 5.2;
        this.frequency = frequency ?? 0.045;
        this.hazeStrength = hazeStrength ?? 0.22;
        this.maxRadius = maxRadius ?? 30.0;

        this.proceduralHeights = [];
        this.proceduralStep = this.size / this.divisions;
        
        this.plane = new MyPlane(scene, this.divisions, 0, 1, 0, 1);

        this.shader = new CGFshader(
            scene.gl,
            "shaders/terrain/terrain.vert",
            "shaders/terrain/terrain.frag"
        );

        this.shader.setUniformsValues({
            heightScale: this.heightScale,
            maxRadius: this.maxRadius,
            hazeStrength: this.hazeStrength,
            lowColor: [0.12, 0.34, 0.12],
            midColor: [0.30, 0.49, 0.20],
            highColor: [0.66, 0.62, 0.36],
            sunDir: [0.4, 0.4, 0.85],
            ambient: 0.42,
            hazeColor: [0.74, 0.82, 0.84],
        });

        this.buildProceduralTerrain();
    }

    updateSunDir(x, y, z) {
        const ox = x;
        const oy = z;
        const oz = y;

        const len = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
        const dir = [ox/len, oy/len, oz/len];

        this.shader.setUniformsValues({ sunDir: dir });
    }

    // To allow for fetching of terrain height at certain points,
    // which enables the correct placements of elements along the
    // generated procedural terrain, we build the terrain in JS,
    // having ported multiple GLSL built-ins and our own functions
    // which were how we previously built the terrain

    // JS versions of GLSL built-ins
    fract(x) {
        return x - Math.floor(x);
    }

    mix(a, b, t) {
        return a * (1 - t) + b * t;
    }

    clamp(x, min, max) {
        return Math.max(min, Math.min(max, x));
    }

    smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }

    // ported hash22(vec2 p) from the old procedural.vert shader
    hash22(x, y) {
        const f = Math.fround;
        const qx = f(f(f(x) * f(127.1)) + f(f(y) * f(311.7)));
        const qy = f(f(f(x) * f(269.5)) + f(f(y) * f(183.3)));

        return [
            f(-1.0 + f(2.0 * this.fract(f(Math.sin(qx) * f(43758.5453))))),
            f(-1.0 + f(2.0 * this.fract(f(Math.sin(qy) * f(43758.5453))))),
        ];
    }

    // ported gnoise(vec2 p) from the old procedural.vert shader
    gnoise(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = this.fract(x);
        const fy = this.fract(y);

        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uy = fy * fy * (3.0 - 2.0 * fy);

        const h00 = this.hash22(ix, iy);
        const h10 = this.hash22(ix + 1, iy);
        const h01 = this.hash22(ix, iy + 1);
        const h11 = this.hash22(ix + 1, iy + 1);

        const n00 = h00[0] * fx + h00[1] * fy;
        const n10 = h10[0] * (fx - 1.0) + h10[1] * fy;
        const n01 = h01[0] * fx + h01[1] * (fy - 1.0);
        const n11 = h11[0] * (fx - 1.0) + h11[1] * (fy - 1.0);

        return this.mix(
            this.mix(n00, n10, ux),
            this.mix(n01, n11, ux),
            uy
        );
    }

    // ported fbm4(vec2 p) from the old procedural.vert shader
    fbm4(x, y) {
        let v = 0.0;
        let a = 0.5;

        for (let i = 0; i < 4; i++) {
            v += a * this.gnoise(x, y);
            x *= 2.0;
            y *= 2.0;
            a *= 0.5;
        }

        return v;
    }

    // converts grid coordinates into the flat vertex height array index
    heightIndex(i, j) {
        return j * (this.divisions + 1) + i;
    }

    // ported terrainHeight(vec2 worldXY) from the old procedural.vert shader
    buildProceduralTerrainHeightAt(x, y) {
        const qx = x * this.frequency + this.seed;
        const qy = y * this.frequency + this.seed * 1.61803398875 + 56.78;

        const warpX = this.gnoise(qx * 0.36, qy * 0.36);
        const warpY = this.gnoise(qx * 0.36 + 5.2, qy * 0.36 + 1.3);

        const macroHills = this.fbm4(
            qx * 0.42 + 0.65 * warpX,
            qy * 0.42 + 0.65 * warpY
        );

        const rolling = this.fbm4(
            qx * 1.05 + 0.35 * warpX + 9.1,
            qy * 1.05 + 0.35 * warpY + 4.7
        );

        const surfaceDetail = this.fbm4(
            qx * 3.20 + 21.4,
            qy * 3.20 + 8.6
        );

        let h = 0.5 + macroHills * 0.62 + rolling * 0.28 + surfaceDetail * 0.07;
        h = this.smoothstep(0.10, 0.90, this.clamp(h, 0.0, 1.0));
        h = h * h * (3.0 - 2.0 * h);

        return h * this.heightScale;
    }

    // builds the actual terrain mesh and normals from the height field
    buildProceduralTerrain() {
        const divs = this.divisions;
        const verticesPerSide = divs + 1;
        const step = this.proceduralStep;
        const halfSize = this.size / 2.0;
        const vertices = this.plane.vertices;
        const normals = this.plane.normals;

        this.proceduralHeights = new Array(verticesPerSide * verticesPerSide);

        for (let j = 0; j <= divs; j++) {
            const y = halfSize - j * step;

            for (let i = 0; i <= divs; i++) {
                const x = -halfSize + i * step;
                const h = this.buildProceduralTerrainHeightAt(x, y);
                const index = this.heightIndex(i, j);

                vertices[index * 3] = x;
                vertices[index * 3 + 1] = y;
                vertices[index * 3 + 2] = h;
                this.proceduralHeights[index] = h;
            }
        }

        for (let j = 0; j <= divs; j++) {
            for (let i = 0; i <= divs; i++) {
                const left = Math.max(i - 1, 0);
                const right = Math.min(i + 1, divs);
                const up = Math.max(j - 1, 0);
                const down = Math.min(j + 1, divs);

                const hL = this.proceduralHeights[this.heightIndex(left, j)];
                const hR = this.proceduralHeights[this.heightIndex(right, j)];
                const hU = this.proceduralHeights[this.heightIndex(i, up)];
                const hD = this.proceduralHeights[this.heightIndex(i, down)];

                const xStep = (right - left) * step || step;
                const yStep = (down - up) * step || step;
                const dx = hR - hL;
                const dy = hU - hD;

                const nx = -dx * yStep;
                const ny = -xStep * dy;
                const nz = xStep * yStep;
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
                const index = this.heightIndex(i, j);

                normals[index * 3] = nx / len;
                normals[index * 3 + 1] = ny / len;
                normals[index * 3 + 2] = nz / len;
            }
        }

        this.plane.initGLBuffers();
    }

    // samples the generated mesh height at world coordinates
    // using interpolation that matches the mesh triangles
    getProceduralTerrainHeightAt(x, z) {
        const divs = this.divisions;
        const step = this.proceduralStep;
        const halfSize = this.size / 2.0;
        const worldX = this.clamp(x, -halfSize, halfSize);
        const worldY = this.clamp(-z, -halfSize, halfSize);
        const gridX = this.clamp((worldX + halfSize) / step, 0, divs);
        const gridY = this.clamp((halfSize - worldY) / step, 0, divs);
        const i = Math.min(Math.floor(gridX), divs - 1);
        const j = Math.min(Math.floor(gridY), divs - 1);
        const u = gridX - i;
        const v = gridY - j;

        const h00 = this.proceduralHeights[this.heightIndex(i, j)];
        const h10 = this.proceduralHeights[this.heightIndex(i + 1, j)];
        const h01 = this.proceduralHeights[this.heightIndex(i, j + 1)];
        const h11 = this.proceduralHeights[this.heightIndex(i + 1, j + 1)];

        if (u + v <= 1.0) {
            return h00 + u * (h10 - h00) + v * (h01 - h00);
        }

        return h11 + (1.0 - u) * (h01 - h11) + (1.0 - v) * (h10 - h11);
    }

    // public getter to be used by elements when generating positions
    getHeightAt(x, z) {
        if (Math.sqrt(x * x + z * z) > this.maxRadius) return 0;

        return this.getProceduralTerrainHeightAt(x, z);
    }

    display() {
        this.scene.setActiveShader(this.shader);

        this.scene.pushMatrix();

        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.plane.display();
        
        this.scene.popMatrix();

        this.scene.setActiveShader(this.scene.defaultShader);
    }
}
