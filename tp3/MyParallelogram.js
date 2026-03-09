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

	/**

		A____________B
       /             /
      /             /
     /             /
    D_____________C

	**/

	initBuffers() {
		this.vertices = [
			// front
			1, 1, 0, // A 0
			3, 1, 0, // B 1
			2, 0, 0, // C 2
			0, 0, 0, // D 3

			// back
			1, 1, 0, // A 4
			3, 1, 0, // B 5
			2, 0, 0, // C 6
			0, 0, 0 // D 7
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

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
