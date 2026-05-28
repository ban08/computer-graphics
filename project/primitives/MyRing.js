import { CGFobject } from '../../lib/CGF.js';

export class MyRing extends CGFobject {
    constructor(scene, slices, innerRadius = 0.9, outerRadius = 1.0) {
        super(scene);
        this.slices = slices;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let alphaAng = (2 * Math.PI) / this.slices;

        for (let i = 0; i <= this.slices; i++) {
            let ang = i * alphaAng;
            let cosA = Math.cos(ang);
            let sinA = Math.sin(ang);

            this.vertices.push(cosA * this.innerRadius, 0, -sinA * this.innerRadius);
            this.normals.push(0, 1, 0);
            this.texCoords.push(0.5 + (cosA * 0.5 * this.innerRadius), 0.5 - (sinA * 0.5 * this.innerRadius));

            this.vertices.push(cosA * this.outerRadius, 0, -sinA * this.outerRadius);
            this.normals.push(0, 1, 0);
            this.texCoords.push(0.5 + (cosA * 0.5 * this.outerRadius), 0.5 - (sinA * 0.5 * this.outerRadius));
        }

        for (let i = 0; i < this.slices; i++) {
            let inner1 = i * 2;
            let outer1 = i * 2 + 1;
            let inner2 = (i + 1) * 2;
            let outer2 = (i + 1) * 2 + 1;

            this.indices.push(inner1, outer1, outer2);
            this.indices.push(inner1, outer2, inner2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}