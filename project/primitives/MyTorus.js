import { CGFobject } from '../../lib/CGF.js';

/**
 * Torus centered at the origin with its hole axis along X.
 */
export class MyTorus extends CGFobject {
    constructor(scene, majorRadius = 1, tubeRadius = 0.1, radialSegments = 36, tubeSegments = 8) {
        super(scene);
        this.majorRadius = majorRadius;
        this.tubeRadius = tubeRadius;
        this.radialSegments = radialSegments;
        this.tubeSegments = tubeSegments;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        for (let i = 0; i <= this.radialSegments; i++) {
            const a = (i / this.radialSegments) * Math.PI * 2;
            const ca = Math.cos(a);
            const sa = Math.sin(a);

            for (let j = 0; j <= this.tubeSegments; j++) {
                const b = (j / this.tubeSegments) * Math.PI * 2;
                const cb = Math.cos(b);
                const sb = Math.sin(b);
                const ringRadius = this.majorRadius + this.tubeRadius * cb;

                this.vertices.push(
                    this.tubeRadius * sb,
                    ringRadius * ca,
                    ringRadius * sa
                );
                this.normals.push(sb, cb * ca, cb * sa);
                this.texCoords.push(i / this.radialSegments, j / this.tubeSegments);
            }
        }

        const row = this.tubeSegments + 1;
        for (let i = 0; i < this.radialSegments; i++) {
            for (let j = 0; j < this.tubeSegments; j++) {
                const current = i * row + j;
                const next = (i + 1) * row + j;
                this.indices.push(current, next, current + 1);
                this.indices.push(current + 1, next, next + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
