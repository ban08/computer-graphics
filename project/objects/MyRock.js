import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MySphere } from '../primitives/MySphere.js';

/**
 * MyRock
 * @constructor
 * @param scene - Reference to MyScene object
 * @param seed - Seed used for deterministic pseudo-random deformation
 * @param color - Rock color as [r, g, b, a]
 * @param roughness - Maximum deformation intensity
 * @param scale - Non-uniform scaling factors as [sx, sy, sz]
 * @param radius - Radius of the baseline sphere
 * @param slices - Number of horizontal baseline sphere subdivisions
 * @param stacks - Number of vertical baseline sphere subdivisions
 * @param texture - Optional texture applied to the rock material
 */
export class MyRock extends CGFobject {
    constructor(scene, seed, color, roughness, scale, radius, slices, stacks, texture) {
        super(scene);

        this.seed = seed ?? Math.random() * 1000;
        this.color = color ?? [0.35, 0.33, 0.30, 1.0];
        this.roughness = roughness ?? 0.25;
        this.scale = scale ?? [1.0, 0.55, 0.8];
        this.radius = radius ?? 1.0;
        this.slices = slices ?? 14;
        this.stacks = stacks ?? 8;

        this.sphere = new MySphere(scene, this.radius, this.slices, this.stacks);

        this.material = new CGFappearance(scene);
        this.material.setAmbient(0.95, 0.93, 0.88, this.color[3]);
        this.material.setDiffuse(1.0, 0.96, 0.90, this.color[3]);
        this.material.setEmission(0.05, 0.055, 0.06, 1.0);
        this.material.setSpecular(0.16, 0.15, 0.13, 1.0);
        this.material.setShininess(18.0);
        if (texture) {
            this.material.setTexture(texture);
            this.material.setTextureWrap('REPEAT', 'REPEAT');
        }

        this.deform();
    }

    random(i) {
        const x = Math.sin(i * 12.34 + this.seed * 56.78) * 91011.12131;
        return x - Math.floor(x);
    }

    deform() {
        const v = this.sphere.vertices;
        const n = this.sphere.normals;
        const [sx, sy, sz] = this.scale;

        let minY = Infinity;

        for (let i = 0; i < v.length; i += 3) {
            let x = v[i];
            let y = v[i + 1];
            let z = v[i + 2];

            const index = i / 3;
            const column = Math.floor(index / (this.stacks + 1));
            const row = index % (this.stacks + 1);
            const deformationIndex = (column % this.slices) * (this.stacks + 1) + row;
            const len = Math.sqrt(x * x + y * y + z * z);
            const offset = (this.random(deformationIndex) * 2 - 1) * this.roughness;

            x = (x + (x / len) * offset) * sx;
            y = (y + (y / len) * offset) * sy;
            z = (z + (z / len) * offset) * sz;

            v[i] = x;
            v[i + 1] = y;
            v[i + 2] = z;

            if (y < minY) minY = y;
        }

        const floorY = minY * 0.75;

        for (let i = 0; i < v.length; i += 3) {
            let x = v[i];
            let y = Math.max(v[i + 1], floorY) - floorY;
            let z = v[i + 2];

            const len = Math.sqrt(x * x + y * y + z * z);
            if (len < 0.0001) {
                n[i] = 0;
                n[i + 1] = 1;
                n[i + 2] = 0;
            } else {
                v[i + 1] = y;

                n[i] = x / len;
                n[i + 1] = y / len;
                n[i + 2] = z / len;
            }
        }

        this.sphere.initGLBuffers();
    }

    display() {
        this.material.apply();
        this.sphere.display();
    }
}
