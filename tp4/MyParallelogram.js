import {CGFobject} from '../lib/CGF.js';

/**
 * MyParallelogram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyParallelogram extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			// front
			1, 1, 0,
			3, 1, 0,
			2, 0, 0,
			0, 0, 0,

			// back
			1, 1, 0,
			3, 1, 0,
			2, 0, 0,
			0, 0, 0
		];

		this.indices = [
			// front
			0, 3, 2,
			0, 2, 1,

			// back
			4, 6, 7,
			4, 5, 6
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
			// front (A,B,C,D)
			0.25, 0.75,
			0.75, 0.75,
			1.00, 1.00,
			0.50, 1.00,

			// back
			0.25, 0.75,
			0.75, 0.75,
			1.00, 1.00,
			0.50, 1.00
		];

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
