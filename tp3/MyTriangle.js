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

	/**

	A
	|\
	| \
	|  \
	|   \
	|    \
	B-----C

	**/

	initBuffers() {
		this.vertices = [
			// front
			-1, 1, 0, // A 0
			-1, -1, 0, // B 1
			1, -1, 0, // C 2

			// back
			-1, 1, 0, // A 3
			-1, -1, 0, // B 4
			1, -1, 0 // C 5
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

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
