import { CGFobject } from '../lib/CGF.js';

export class MyPrism extends CGFobject {
	/**
	 * @method constructor
	 * @param  {CGFscene} scene - MyScene object
	 * @param  {integer} slices - number of slices around Y axis
	 * @param  {integer} stacks - number of stacks along Y axis
	 */
	constructor(scene, slices, stacks) {
		super(scene);
		this.slices = slices;
		this.stacks = stacks;
		this.initBuffers();
	}

	/**
	 * @method initBuffers
	 * Initializes the prism buffers
	 */
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];

		var angle = 0;
		var alphaAng = 2 * Math.PI / this.slices;

		for (var i = 0; i < this.slices; i++) {

            // Normal angle is the center of the face
            var normalAngle = angle + alphaAng / 2;
            var nx = Math.cos(normalAngle);
            var ny = Math.sin(normalAngle);
            var nz = 0;

            // Vertices coordinates
			var x1 = Math.cos(angle);
            var y1 = Math.sin(angle);
            var x2 = Math.cos(angle + alphaAng);
            var y2 = Math.sin(angle + alphaAng);

			for (var j = 0; j <= this.stacks; j++) {
                var z = j / this.stacks;
                
                // Add vertices (2 per stack level)
				this.vertices.push(x1, y1, z);
                this.normals.push(nx, ny, nz);

                this.vertices.push(x2, y2, z);
                this.normals.push(nx, ny, nz);
			}

            // Indices
            var baseIndex = i * 2 * (this.stacks + 1);
            for(var j = 0; j < this.stacks; j++){
                var current = baseIndex + 2 * j;
                var next = current + 2;

                this.indices.push(current, current+1, next);
                this.indices.push(current+1, next+1, next);
            }

			angle += alphaAng;
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

    updateBuffers(complexity){
    }
}