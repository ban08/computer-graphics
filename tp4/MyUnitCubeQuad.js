import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";

/**
 * MyUnitQuadCube
 * @constructor
 * @param scene - Reference to MyScene object
 */

export class MyUnitCubeQuad extends CGFobject {
    constructor(scene, textureTop, textureFront, textureRight, textureBack, textureLeft, textureBottom) {
        super(scene);
        this.quad = new MyQuad(scene);

        this.textureTop = textureTop;
        this.textureFront = textureFront;
        this.textureRight = textureRight;
        this.textureBack = textureBack;
        this.textureLeft = textureLeft;
        this.textureBottom = textureBottom;

        this.material = new CGFappearance(scene);
    }

    applyTexture(texture) {
        this.material.setTexture(texture);
        this.material.apply();
        this.scene.setTextureFilter(texture);
    }

    display() {
    
        //main square
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.applyTexture(this.textureFront);
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0,0,-0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.applyTexture(this.textureBack);
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0,-0.5,0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.applyTexture(this.textureBottom);
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0,0.5,0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.applyTexture(this.textureTop);
        this.quad.display();
        this.scene.popMatrix()

        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.applyTexture(this.textureLeft);
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.applyTexture(this.textureRight);
        this.quad.display();
        this.scene.popMatrix()
        }
}