import { CGFobject } from '../../lib/CGF.js';

/**
 * Filled end panel matching MyRoundedCoverShell.
 */
export class MyRoundedCoverEndPanel extends CGFobject {
    constructor(scene, halfWidth = 1, sideHeight = 0.65, archHeight = 0.78, slices = 18, doubleSided = true) {
        super(scene);
        this.halfWidth = halfWidth;
        this.sideHeight = sideHeight;
        this.archHeight = archHeight;
        this.slices = slices;
        this.doubleSided = doubleSided;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        const height = this.sideHeight + this.archHeight;
        this.addVertex(0, height * 0.46, 0, 0.5, 0.54);

        const profile = this.buildProfile();
        for (const p of profile) {
            this.addVertex(p.x, p.y, 0, (p.x / this.halfWidth + 1) * 0.5, 1 - p.y / height);
        }

        for (let i = 1; i < profile.length; i++) {
            this.indices.push(0, i, i + 1);
            if (this.doubleSided) this.indices.push(0, i + 1, i);
        }
        this.indices.push(0, profile.length, 1);
        if (this.doubleSided) this.indices.push(0, 1, profile.length);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    buildProfile() {
        const profile = [
            { x: -this.halfWidth, y: 0 },
            { x: -this.halfWidth, y: this.sideHeight },
        ];

        for (let i = 1; i < this.slices; i++) {
            const theta = Math.PI - (i / this.slices) * Math.PI;
            profile.push({
                x: Math.cos(theta) * this.halfWidth,
                y: this.sideHeight + Math.sin(theta) * this.archHeight,
            });
        }

        profile.push(
            { x: this.halfWidth, y: this.sideHeight },
            { x: this.halfWidth, y: 0 }
        );

        return profile;
    }

    addVertex(x, y, z, u, v) {
        this.vertices.push(x, y, z);
        this.normals.push(0, 0, 1);
        this.texCoords.push(u, v);
    }
}
