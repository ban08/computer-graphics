import { CGFobject } from '../../../lib/CGF.js';

export class MyRoofGable extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
    
        this.vertices = [
            -0.5, 0, 0,    
             0.5, 0, 0,    
             0.5, 0.1, 0, 
             0.15, 0.3, 0, 
            -0.15, 0.3, 0, 
            -0.5, 0.1, 0   
        ];

        this.indices = [
            0, 1, 2,
            0, 2, 5, 
            2, 3, 5,
            3, 4, 5  
        ];

        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        this.texCoords = [
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.66,
            0.65, 0.0,
            0.35, 0.0,
            0.0, 0.66
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}