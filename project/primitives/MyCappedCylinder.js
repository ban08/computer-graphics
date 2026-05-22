import { CGFobject } from '../../lib/CGF.js';

/**
 * Capped cylinder aligned with the X axis and centered at the origin.
 */
export class MyCappedCylinder extends CGFobject {
    constructor(scene, radius = 1, length = 1, slices = 32, stacks = 1) {
        super(scene);
        this.radius = radius;
        this.length = length;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        const half = this.length / 2;

        for (let i = 0; i <= this.slices; i++) {
            const a = (i / this.slices) * Math.PI * 2;
            const y = Math.cos(a) * this.radius;
            const z = Math.sin(a) * this.radius;

            for (let j = 0; j <= this.stacks; j++) {
                const x = -half + (j / this.stacks) * this.length;
                this.vertices.push(x, y, z);
                this.normals.push(0, Math.cos(a), Math.sin(a));
                this.texCoords.push(i / this.slices, j / this.stacks);
            }
        }

        for (let i = 0; i < this.slices; i++) {
            for (let j = 0; j < this.stacks; j++) {
                const row = this.stacks + 1;
                const current = i * row + j;
                const next = (i + 1) * row + j;
                this.indices.push(current, current + 1, next);
                this.indices.push(current + 1, next + 1, next);
            }
        }

        this.addCap(-half, -1);
        this.addCap(half, 1);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    addCap(x, normalX) {
        const center = this.vertices.length / 3;
        this.vertices.push(x, 0, 0);
        this.normals.push(normalX, 0, 0);
        this.texCoords.push(0.5, 0.5);

        for (let i = 0; i <= this.slices; i++) {
            const a = (i / this.slices) * Math.PI * 2;
            const y = Math.cos(a) * this.radius;
            const z = Math.sin(a) * this.radius;
            this.vertices.push(x, y, z);
            this.normals.push(normalX, 0, 0);
            this.texCoords.push(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5);
        }

        for (let i = 0; i < this.slices; i++) {
            if (normalX > 0) this.indices.push(center, center + i + 1, center + i + 2);
            else this.indices.push(center, center + i + 2, center + i + 1);
        }
    }
}
