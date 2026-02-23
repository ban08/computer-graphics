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
		// Vertices duplicated: indices 0-3 for front face, 4-7 for back face
		this.vertices = [
			// Front face vertices (normal +Z)
			0, 0, 0,	//0 bottom-left (origin)
			2, 0, 0,	//1 bottom-right
			1, 1, 0,	//2 top-left
			3, 1, 0,	//3 top-right
			// Back face vertices (normal -Z)
			0, 0, 0,	//4 bottom-left (origin)
			2, 0, 0,	//5 bottom-right
			1, 1, 0,	//6 top-left
			3, 1, 0		//7 top-right
		];

		this.indices = [
			// Front face (CCW, normal +Z)
			0, 1, 2,
			1, 3, 2,
			// Back face (CW from front = CCW from back, normal -Z)
			4, 6, 5,
			5, 6, 7
		];

		this.normals = [
			// Front face normals
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			// Back face normals
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}