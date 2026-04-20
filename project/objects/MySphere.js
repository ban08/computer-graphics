import { CGFobject } from '../../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MySphere extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
        this.normals = [];

        // for now, unit sphere
        // this.radius = 1;
        this.slices = 10;
        this.stacks = 10;

        var alphaAng = (360 * Math.PI / 180);
        var betaAng = (180 * Math.PI / 180);

        var deltaAlpha = alphaAng / this.slices;
        var deltaBeta = betaAng / this.stacks;

        for (var alpha = 0; alpha < alphaAng; alpha += deltaAlpha) {
            var alpha2 = alpha + deltaAlpha;

            for (var beta = 0; beta < betaAng; beta += deltaBeta) {
                var beta2 = beta + deltaBeta;

                var r1 = Math.sin(beta);
                var r2 = Math.sin(beta2);

                var x1 = r1 * Math.cos(alpha);
                var y1 = r1 * Math.sin(alpha);
                var z1 = Math.cos(beta);

                var x2 = r2 * Math.cos(alpha);
                var y2 = r2 * Math.sin(alpha);
                var z2 = Math.cos(beta2);

                var x3 = r1 * Math.cos(alpha2);
                var y3 = r1 * Math.sin(alpha2);
                var z3 = Math.cos(beta);

                var x4 = r2 * Math.cos(alpha2);
                var y4 = r2 * Math.sin(alpha2);
                var z4 = Math.cos(beta2);

                var index = this.vertices.length / 3;

                this.vertices.push(x1, y1, z1);
                this.vertices.push(x2, y2, z2);
                this.vertices.push(x3, y3, z3);
                this.vertices.push(x4, y4, z4);

                this.indices.push(index, index + 1, index + 2);
                this.indices.push(index + 1, index + 3, index + 2);

                this.normals.push(x1, y1, z1);
                this.normals.push(x2, y2, z2);
                this.normals.push(x3, y3, z3);
                this.normals.push(x4, y4, z4);
            }
        }

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}
