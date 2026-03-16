import { CGFobject } from '../lib/CGF.js';

export class MyCylinder extends CGFobject {
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

        var alphaAng = 2 * Math.PI / this.slices;

        for (var i = 0; i < this.slices; i++) {

            // Vertices coordinates
            var angle = i * alphaAng;
            var x = Math.cos(angle);
            var y = Math.sin(angle);

            for (var j = 0; j <= this.stacks; j++) {
                var z = j / this.stacks;
                
                this.vertices.push(x, y, z);
                this.normals.push(x, y, 0);
            }

            // Indices
            var baseIndex = i * (this.stacks + 1);
            for(var j = 0; j < this.stacks; j++){
               var current = baseIndex + j;
                var next =  ((i + 1) % this.slices) * (this.stacks + 1) + j;
                this.indices.push(current, next, current+1);
                this.indices.push(current+1, next, next+1);
            }

        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity){
    }
}
