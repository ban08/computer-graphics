import {CGFobject} from '../lib/CGF.js';

/**
 * MyTriangleBig
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangleBig extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}

	/**

	    A
       / \
      /   \
     /     \
    B-------C
 
	**/

	initBuffers() {
		this.vertices = [
			// front
			0, 2, 0, // A 0
			-2, 0, 0, // B 1
			2, 0, 0, // C 2

			// back
			0, 2, 0, // A 3
			-2, 0, 0, // B 4
			2, 0, 0 // C 5
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
