import { CGFobject } from '../../lib/CGF.js';

/**
 * MyTexturedBox
 * @constructor
 * @param scene - Reference to MyScene object
 * @param width - Box width
 * @param height - Box height
 * @param depth - Box depth
 * @param tileSize - Texture tile size
 */
export class MyTexturedBox extends CGFobject {
    constructor(scene, width = 1, height = 1, depth = 1, tileSize = 1) {
        super(scene);
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.tileSize = tileSize;
        this.initBuffers();
    }

    addFace(corners, normal, sRepeat, tRepeat) {
        const base = this.vertices.length / 3;

        for (const p of corners) {
            this.vertices.push(p[0], p[1], p[2]);
            this.normals.push(normal[0], normal[1], normal[2]);
        }

        this.texCoords.push(
            0, tRepeat,
            sRepeat, tRepeat,
            0, 0,
            sRepeat, 0
        );

        this.indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }

    initBuffers() {
        const x = this.width / 2;
        const y = this.height / 2;
        const z = this.depth / 2;
        const tx = Math.max(this.width / this.tileSize, 1);
        const ty = Math.max(this.height / this.tileSize, 1);
        const tz = Math.max(this.depth / this.tileSize, 1);

        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        this.addFace([[-x, -y, z], [x, -y, z], [-x, y, z], [x, y, z]], [0, 0, 1], tx, ty);
        this.addFace([[x, -y, -z], [-x, -y, -z], [x, y, -z], [-x, y, -z]], [0, 0, -1], tx, ty);
        this.addFace([[x, -y, z], [x, -y, -z], [x, y, z], [x, y, -z]], [1, 0, 0], tz, ty);
        this.addFace([[-x, -y, -z], [-x, -y, z], [-x, y, -z], [-x, y, z]], [-1, 0, 0], tz, ty);
        this.addFace([[-x, y, z], [x, y, z], [-x, y, -z], [x, y, -z]], [0, 1, 0], tx, tz);
        this.addFace([[-x, -y, -z], [x, -y, -z], [-x, -y, z], [x, -y, z]], [0, -1, 0], tx, tz);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
