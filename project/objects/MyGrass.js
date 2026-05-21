import { CGFobject, CGFtexture } from '../../lib/CGF.js';

export class MyGrass extends CGFobject {
    constructor(scene) {
        super(scene);

        this.initBuffers();

        this.texture = new CGFtexture(scene, 'textures/grasstexture.png');
    }

    initBuffers() {

        this.vertices = [
            
            -0.05, 0, 0,
             0.05, 0, 0,
             0.00, 0.5, 0,

            
            -0.03, 0, 0,
             0.03, 0, 0,
            -0.02, 0.8, 0,

        
             0.02, 0, 0,
             0.06, 0, 0,
             0.01, 1.0, 0,
        ];

        this.indices = [0,1,2, 3,4,5, 6,7,8];

        this.normals = new Array(this.vertices.length).fill(0).map((_, i) =>
            i % 3 === 2 ? 1 : 0
        );

        this.texCoords = [
            0,1, 1,1, 0.5,0,
            0,1, 1,1, 0.5,0,
            0,1, 1,1, 0.5,0
        ];

        this.initGLBuffers();
    }

    display() {
        this.texture.bind();
        super.display();
    }
}