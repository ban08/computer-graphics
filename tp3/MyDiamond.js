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
	
	/**

      A
     / \
    /   \
   D     B
    \   /
     \ /
      C

	**/

	initBuffers() {
		this.vertices = [
			// front
			0, 1, 0, // A 0
			1, 0, 0, // B 1
			0, -1, 0, // C 2
			-1, 0, 0, // D 3

			// back
			0, 1, 0, // A 4
			1, 0, 0, // B 5
			0, -1, 0, // C 6
			-1, 0, 0 // D 7
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

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
