import { CGFobject } from '../../lib/CGF.js';

/**
 * Tall covered-wagon cloth shell: vertical sides plus a rounded top.
 * The section is intentionally squarer than a pure half-cylinder.
 */
export class MyRoundedCoverShell extends CGFobject {
    constructor(scene, halfWidth = 1, sideHeight = 0.65, archHeight = 0.78, length = 1, slices = 18, stacks = 6, doubleSided = true) {
        super(scene);
        this.halfWidth = halfWidth;
        this.sideHeight = sideHeight;
        this.archHeight = archHeight;
        this.length = length;
        this.slices = slices;
        this.stacks = stacks;
        this.doubleSided = doubleSided;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        this.addSurface(false);
        if (this.doubleSided) this.addSurface(true);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    buildProfile() {
        const profile = [
            { x: -this.halfWidth, y: 0, nx: -1, ny: 0 },
            { x: -this.halfWidth, y: this.sideHeight * 0.5, nx: -1, ny: 0 },
            { x: -this.halfWidth, y: this.sideHeight, nx: -1, ny: 0 },
        ];

        for (let i = 1; i < this.slices; i++) {
            const theta = Math.PI - (i / this.slices) * Math.PI;
            const x = Math.cos(theta) * this.halfWidth;
            const y = this.sideHeight + Math.sin(theta) * this.archHeight;
            const [nx, ny] = this.normal2(Math.cos(theta) / this.halfWidth, Math.sin(theta) / this.archHeight);
            profile.push({ x, y, nx, ny });
        }

        profile.push(
            { x: this.halfWidth, y: this.sideHeight, nx: 1, ny: 0 },
            { x: this.halfWidth, y: this.sideHeight * 0.5, nx: 1, ny: 0 },
            { x: this.halfWidth, y: 0, nx: 1, ny: 0 }
        );

        return profile;
    }

    addSurface(inward) {
        const base = this.vertices.length / 3;
        const profile = this.buildProfile();
        const halfLength = this.length / 2;
        const sign = inward ? -1 : 1;
        const height = this.sideHeight + this.archHeight;

        for (let i = 0; i < profile.length; i++) {
            const p = profile[i];
            for (let j = 0; j <= this.stacks; j++) {
                const z = -halfLength + (j / this.stacks) * this.length;
                this.vertices.push(p.x, p.y, z);
                this.normals.push(p.nx * sign, p.ny * sign, 0);
                this.texCoords.push(j / this.stacks, 1 - p.y / height);
            }
        }

        const row = this.stacks + 1;
        for (let i = 0; i < profile.length - 1; i++) {
            for (let j = 0; j < this.stacks; j++) {
                const current = base + i * row + j;
                const next = base + (i + 1) * row + j;
                if (inward) {
                    this.indices.push(current, current + 1, next);
                    this.indices.push(current + 1, next + 1, next);
                } else {
                    this.indices.push(current, next, current + 1);
                    this.indices.push(current + 1, next, next + 1);
                }
            }
        }
    }

    normal2(x, y) {
        const length = Math.sqrt(x * x + y * y) || 1;
        return [x / length, y / length];
    }
}
