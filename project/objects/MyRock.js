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
 */
export class MyRock extends CGFobject {
    constructor(scene, seed, color, roughness, scale, radius, slices, stacks) {
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
        this.material.setAmbient(this.color[0] * 0.45, this.color[1] * 0.45, this.color[2] * 0.45, this.color[3]);
        this.material.setDiffuse(this.color[0], this.color[1], this.color[2], this.color[3]);
        this.material.setSpecular(0.08, 0.08, 0.08, 1.0);
        this.material.setShininess(8.0);

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
            const len = Math.sqrt(x * x + y * y + z * z);
            const offset = (this.random(index) * 2 - 1) * this.roughness;

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
            let y = Math.max(v[i + 1], floorY);
            let z = v[i + 2];

            const len = Math.sqrt(x * x + y * y + z * z);

            v[i + 1] = y;

            n[i] = x / len;
            n[i + 1] = y / len;
            n[i + 2] = z / len;
        }

        this.sphere.initGLBuffers();
    }

    display() {
        this.material.apply();
        this.sphere.display();
        this.scene.setDefaultAppearance();
    }
}
