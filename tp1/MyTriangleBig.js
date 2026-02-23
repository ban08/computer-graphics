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

	initBuffers() {
		// Isoceles right triangle (right angle at apex), scaled 2x
		// Base: 4 units wide, height: 2 units
		// Origin at base midpoint (0,0,0)
		this.vertices = [
			-2, 0, 0,	//0 bottom-left
			 2, 0, 0,	//1 bottom-right
			 0, 2, 0	//2 apex (right angle here)
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