import { CGFobject } from '../../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius of the sphere
 * @param slices - Number of horizontal sphere subdivisions
 * @param stacks - Number of vertical sphere subdivisions
 */
export class MySphere extends CGFobject {
	constructor(scene, radius, slices, stacks) {
		super(scene);

        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
        this.normals = [];

        var alphaAng = (360 * Math.PI / 180);
        var betaAng = (180 * Math.PI / 180);

        var deltaAlpha = alphaAng / this.slices;
        var deltaBeta = betaAng / this.stacks;

        for (var i = 0; i < this.slices; i++) {
            var alpha = i * deltaAlpha;

            for (var j = 0; j <= this.stacks; j++) {
                var beta = j * deltaBeta;

                var r = Math.sin(beta);
                var x = r * Math.cos(alpha);
                var y = r * Math.sin(alpha);
                var z = Math.cos(beta);
                
                this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
                this.normals.push(x, y, z);
            }
        }

        for (var i = 0; i < this.slices; i++) {
            var nextI = (i + 1) % this.slices;

            for (var j = 0; j < this.stacks; j++) {
                var current = i * (this.stacks + 1) + j;
                var next = nextI * (this.stacks + 1) + j;

                this.indices.push(current, current + 1, next);
                this.indices.push(current + 1, next + 1, next);
            }
        }

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
