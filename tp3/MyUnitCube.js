import {CGFobject} from '../lib/CGF.js';

/**
 * MyUnitCube
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitCube extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }
    
    /**

       E--------F
      /|       /|
     / |      / |
    A--------B  |
    |  |     |  |
    |  G-----|--H
    | /      | /
    |/       |/
    C--------D

    **/

    initBuffers() {
        this.vertices = [
            // front
            -0.5, 0.5, 0.5, // A 0
            0.5, 0.5, 0.5, // B 1
            -0.5, -0.5, 0.5, // C 2
            0.5, -0.5, 0.5, // D 3

            // back
            -0.5, 0.5, -0.5, // E 4
            0.5, 0.5, -0.5, // F 5
            -0.5, -0.5, -0.5, // G 6
            0.5, -0.5, -0.5, // H 7

            // bottom
            -0.5, -0.5, -0.5, // G 8
            0.5, -0.5, -0.5, // H 9
            -0.5, -0.5, 0.5, // C 10
            0.5, -0.5, 0.5, // D 11

            // top
            -0.5, 0.5, -0.5, // E 12
            0.5, 0.5, -0.5, // F 13
            -0.5, 0.5, 0.5, // A 14
            0.5, 0.5, 0.5, // B 15

            // left
            -0.5, 0.5, 0.5, // A 16
            -0.5, 0.5, -0.5, // E 17
            -0.5, -0.5, 0.5, // C 18
            -0.5, -0.5, -0.5, // G 19

            // right
            0.5, 0.5, 0.5, // B 20
            0.5, 0.5, -0.5, // F 21
            0.5, -0.5, 0.5, // D 22
            0.5, -0.5, -0.5, // H 23
        ];

        this.indices = [
            // front
            2, 1, 0,
            3, 1, 2,

            // back
            4, 5, 6,
            5, 7, 6,

            // bottom
            8, 9, 10,
            9, 11, 10,

            // top
            14, 13, 12,
            14, 15, 13,

            // left
            16, 17, 18,
            17, 19, 18,

            // right
            22, 21, 20,
            23, 21, 22
        ];

        this.normals = [
            // front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // left
            -1,  0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
        
    }
}
