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
		// Parallelogram in XY plane
		// Origin (0,0,0) is the leftmost vertex
		// Height: 1 unit, total width: 3 units
		this.vertices = [
			0, 0, 0,	//0 bottom-left (origin)
			2, 0, 0,	//1 bottom-right
			1, 1, 0,	//2 top-left
			3, 1, 0		//3 top-right
		];

		// Two triangles for front face (CCW) + same two reversed for back face (CW)
		this.indices = [
			// Front face (normal +Z)
			0, 1, 2,
			1, 3, 2,
			// Back face (normal -Z)
			2, 1, 0,
			2, 3, 1
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}