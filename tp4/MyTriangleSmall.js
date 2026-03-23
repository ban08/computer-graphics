import {CGFobject} from '../lib/CGF.js';

/**
 * MyTriangleSmall
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangleSmall extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			// front
			0, 1, 0,
			-1, 0, 0,
			1, 0, 0,

			// back
			0, 1, 0,
			-1, 0, 0,
			1, 0, 0
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
			0.25, 0.25,
			0.00, 0.00,
			0.00, 0.50,
			0.25, 0.25,
			0.00, 0.00,
			0.00, 0.50
		];

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}

	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}
