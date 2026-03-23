import {CGFobject} from '../lib/CGF.js';

/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangle extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			// front
			-1, 1, 0,
			-1, -1, 0,
			1, -1, 0,

			// back
			-1, 1, 0,
			-1, -1, 0,
			1, -1, 0
		];

		this.indices = [
			// front
			0, 1, 2,

			// back
			3, 5, 4
		];

		this.normals = [
			// front
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			// back
			0, 0, -1,
			0, 0, -1,
			0, 0, -1
		];

		this.texCoords = [
			// front (A,B,C)
			0.00, 0.50,
			0.00, 1.00,
			0.50, 1.00,

			// back
			0.00, 0.50,
			0.00, 1.00,
			0.50, 1.00
		];

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
