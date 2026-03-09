import {CGFobject} from '../lib/CGF.js';
import { MyDiamond } from "./MyDiamond.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
import { MyTriangleBig } from "./MyTriangleBig.js";

/**
 * MyTangram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTangram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.diamond = new MyDiamond(scene);
        this.triangle = new MyTriangle(scene);
        this.parallelogram = new MyParallelogram(scene);
        this.triangleSmallOne = new MyTriangleSmall(scene);
        this.triangleSmallTwo = new MyTriangleSmall(scene);
        this.triangleBigOne = new MyTriangleBig(scene);
        this.triangleBigTwo = new MyTriangleBig(scene);
    }

    display() {
        // const to center 45 degree rotations
        const h = Math.sqrt(2) / 2;

        // degree to rad const
        const dtr = Math.PI/180;

        // --- Diamond - Green

        this.scene.pushMatrix();

        // transformations for this object using matrix functions
        // translation
        var tra = [
        1.0, 0.0, 0.0, 0.0, 
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        3.0+h, 0.0, 0.0, 1.0, // Tx, Ty, Tz, 1.0
        ];

        this.scene.multMatrix(tra);

        // rotation
        var rot = [ // around z axis (constant z)
        Math.cos(45*Math.PI/180), Math.sin(45*Math.PI/180), 0.0, 0.0,
        -(Math.sin(45*Math.PI/180)), Math.cos(45*Math.PI/180), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
        ];

        this.scene.multMatrix(rot);

        // display
        this.scene.setAmbient(0.0, 0.5, 0.0, 1.0);
        this.scene.setDiffuse(0.0, 0.8, 0.0, 1.0);
        this.scene.setSpecular(0.0, 0.8, 0.0, 1.0);
        this.scene.setShininess(10.0);
        this.diamond.display();

        this.scene.popMatrix();

        // --- Parallelogram - Yellow

        // push tranformations to stack
        this.scene.pushMatrix();

        // transformations for this object using vector functions
        this.scene.translate(2.5,0,0);
        this.scene.rotate(180*dtr,1,0,0);
        this.scene.rotate(90*dtr,0,0,1);
        this.scene.translate(-1.5,-0.5,0);

        // display
        this.scene.setAmbient(1.0, 1.0, 0.0, 1.0);
        this.scene.setDiffuse(1.0, 1.0, 0.0, 1.0);
        this.scene.setSpecular(1.0, 1.0, 0.0, 1.0);
        this.scene.setShininess(10.0);
        this.parallelogram.display();

        // pop transformations from stack
        this.scene.popMatrix();

        // --- Triangle - Pink

        this.scene.pushMatrix();

        this.scene.translate(1,0,0);
        this.scene.rotate(180*dtr,0,0,1);

        this.scene.setAmbient(1.0, 0.6, 0.8, 1.0);
        this.scene.setDiffuse(1.0, 0.6, 0.8, 1.0);
        this.scene.setSpecular(1.0, 0.6, 0.8, 1.0);
        this.scene.setShininess(10.0);
        this.triangle.display();
        
        this.scene.popMatrix();

        // --- Triangle Small One - Red

        this.scene.pushMatrix();

        this.scene.translate(2,1.5,0);
        this.scene.rotate(-90*dtr,0,0,1);

        this.scene.setAmbient(0.8, 0.0, 0.0, 1.0);
        this.scene.setDiffuse(1.0, 0.0, 0.0, 1.0);
        this.scene.setSpecular(1.0, 0.0, 0.0, 1.0);
        this.scene.setShininess(10.0);
        this.triangleSmallOne.display();

        this.scene.popMatrix();

        // --- Triangle Big One - Blue

        this.scene.pushMatrix();

        this.scene.translate(0,-1,0);

        this.scene.setAmbient(0.0, 0.5, 1.0, 1.0);
        this.scene.setDiffuse(0.0, 0.6, 1.0, 1.0);
        this.scene.setSpecular(0.0, 0.6, 1.0, 1.0);
        this.scene.setShininess(10.0);
        this.triangleBigOne.display();

        this.scene.popMatrix();

        // --- Triangle Small Two - Purple

        this.scene.pushMatrix();

        this.scene.translate(3,-1.5,0);
        this.scene.rotate(90*dtr,0,0,1);

        this.scene.setAmbient(0.5, 0.2, 0.7, 1.0);
        this.scene.setDiffuse(0.6, 0.3, 0.9, 1.0);
        this.scene.setSpecular(1.0, 0.0, 0.0, 1.0);
        this.scene.setShininess(10.0);
        this.triangleSmallTwo.display();

        this.scene.popMatrix();

        // --- Triangle Big Two - Orange

        this.scene.pushMatrix();

        this.scene.translate(-2,1,0);
        this.scene.rotate(180*dtr,0,0,1);

        this.scene.setAmbient(0.8, 0.4, 0.0, 1.0);
        this.scene.setDiffuse(1.0, 0.5, 0.0, 1.0);
        this.scene.setSpecular(0.0, 0.6, 1.0, 1.0);
        this.scene.setShininess(10.0);
        this.triangleBigTwo.display();

        this.scene.popMatrix();
    }

    enableNormalViz() {
        this.diamond.enableNormalViz();
        this.triangle.enableNormalViz();
        this.parallelogram.enableNormalViz();
        this.triangleSmallOne.enableNormalViz();
        this.triangleSmallTwo.enableNormalViz();
        this.triangleBigOne.enableNormalViz();
        this.triangleBigTwo.enableNormalViz();
    }

        disableNormalViz() {
        this.diamond.disableNormalViz();
        this.triangle.disableNormalViz();
        this.parallelogram.disableNormalViz();
        this.triangleSmallOne.disableNormalViz();
        this.triangleSmallTwo.disableNormalViz();
        this.triangleBigOne.disableNormalViz();
        this.triangleBigTwo.disableNormalViz();
    }
}
