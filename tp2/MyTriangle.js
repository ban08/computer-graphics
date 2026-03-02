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
		// Right triangle in XY plane, legs of 2 units
		// Origin (0,0,0) is the midpoint of the hypotenuse
		this.vertices = [
			-1,  1, 0,	//0 top-left
			-1, -1, 0,	//1 bottom-left (right angle)
			 1, -1, 0	//2 bottom-right
		];

		// Counter-clockwise (normal pointing +Z)
		this.indices = [
			0, 1, 2
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}
