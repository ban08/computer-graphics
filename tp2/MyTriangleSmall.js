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
		// Isoceles right triangle (right angle at apex)
		// Base: 2 units wide, height: 1 unit
		// Origin at base midpoint (0,0,0)
		this.vertices = [
			-1, 0, 0,	//0 bottom-left
			 1, 0, 0,	//1 bottom-right
			 0, 1, 0	//2 apex (right angle here)
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