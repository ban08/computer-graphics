import { CGFobject } from '../../lib/CGF.js';

/**
 * Flat triangular arrow head aligned with the Y axis.
 * The point faces -Y and the straight base sits at +Y.
 */
export class MyArrowHead extends CGFobject {
    constructor(scene, width = 1, height = 1, thickness = 0.12) {
        super(scene);
        this.width = width;
        this.height = height;
        this.thickness = thickness;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        const halfWidth = this.width * 0.5;
        const halfHeight = this.height * 0.5;
        const halfThickness = this.thickness * 0.5;

        const tipFront = [0, -halfHeight, halfThickness];
        const leftFront = [-halfWidth, halfHeight, halfThickness];
        const rightFront = [halfWidth, halfHeight, halfThickness];
        const tipBack = [0, -halfHeight, -halfThickness];
        const leftBack = [-halfWidth, halfHeight, -halfThickness];
        const rightBack = [halfWidth, halfHeight, -halfThickness];

        this.addFace([leftFront, tipFront, rightFront], [0, 0, 1]);
        this.addFace([leftBack, rightBack, tipBack], [0, 0, -1]);
        this.addFace([leftFront, rightFront, rightBack, leftBack], [0, 1, 0]);

        const sideY = -halfWidth / Math.sqrt(halfHeight * halfHeight + halfWidth * halfWidth);
        const sideX = halfHeight / Math.sqrt(halfHeight * halfHeight + halfWidth * halfWidth);

        this.addFace([tipFront, leftFront, leftBack, tipBack], [-sideX, sideY, 0]);
        this.addFace([rightFront, tipFront, tipBack, rightBack], [sideX, sideY, 0]);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    addFace(points, normal) {
        const start = this.vertices.length / 3;

        for (const point of points) {
            this.vertices.push(point[0], point[1], point[2]);
            this.normals.push(normal[0], normal[1], normal[2]);
            this.texCoords.push(point[0] / this.width + 0.5, 1.0 - (point[1] / this.height + 0.5));
        }

        if (points.length === 3) {
            this.indices.push(start, start + 1, start + 2);
        } else {
            this.indices.push(start, start + 1, start + 2);
            this.indices.push(start, start + 2, start + 3);
        }
    }
}
