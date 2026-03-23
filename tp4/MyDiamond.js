import {CGFobject} from '../lib/CGF.js';

/**
 * MyDiamond
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyDiamond extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			// front
			0, 1, 0,
			1, 0, 0,
			0, -1, 0,
			-1, 0, 0,

			// back
			0, 1, 0,
			1, 0, 0,
			0, -1, 0,
			-1, 0, 0
		];

		this.indices = [
			// front
			0, 3, 1,
			2, 1, 3,

			// back
			4, 5, 7,
			5, 6, 7
		];

		this.normals = [
			// front
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			// back
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1
		];

		this.texCoords = [
			// front (left, top, right, bottom)
			0.25, 0.25,
			0.50, 0.50,
			0.25, 0.75,
			0.00, 0.50,

			// back
			0.25, 0.25,
			0.50, 0.50,
			0.25, 0.75,
			0.00, 0.50
		];

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
