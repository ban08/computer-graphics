import {CGFobject, CGFappearance} from '../lib/CGF.js';
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

        this.diamondMaterial = new CGFappearance(scene);
        this.diamondMaterial.setAmbient(0.0, 0.5, 0.0, 1.0);
        this.diamondMaterial.setDiffuse(0.0, 0.8, 0.0, 1.0);
        this.diamondMaterial.setSpecular(0.0, 0.8, 0.0, 1.0);
        this.diamondMaterial.setShininess(40.0);

        this.parallelogramMaterial = new CGFappearance(scene);
        this.parallelogramMaterial.setAmbient(1.0, 1.0, 0.0, 1.0);
        this.parallelogramMaterial.setDiffuse(1.0, 1.0, 0.0, 1.0);
        this.parallelogramMaterial.setSpecular(1.0, 1.0, 0.0, 1.0);
        this.parallelogramMaterial.setShininess(40.0);

        this.triangleMaterial = new CGFappearance(scene);
        this.triangleMaterial.setAmbient(1.0, 0.6, 0.8, 1.0);
        this.triangleMaterial.setDiffuse(1.0, 0.6, 0.8, 1.0);
        this.triangleMaterial.setSpecular(1.0, 0.6, 0.8, 1.0);
        this.triangleMaterial.setShininess(40.0);

        this.triangleSmallOneMaterial = new CGFappearance(scene);
        this.triangleSmallOneMaterial.setAmbient(0.8, 0.0, 0.0, 1.0);
        this.triangleSmallOneMaterial.setDiffuse(1.0, 0.0, 0.0, 1.0);
        this.triangleSmallOneMaterial.setSpecular(1.0, 0.0, 0.0, 1.0);
        this.triangleSmallOneMaterial.setShininess(40.0);

        this.triangleBigOneMaterial = new CGFappearance(scene);
        this.triangleBigOneMaterial.setAmbient(0.0, 0.5, 1.0, 1.0);
        this.triangleBigOneMaterial.setDiffuse(0.0, 0.6, 1.0, 1.0);
        this.triangleBigOneMaterial.setSpecular(0.0, 0.6, 1.0, 1.0);
        this.triangleBigOneMaterial.setShininess(40.0);

        this.triangleSmallTwoMaterial = new CGFappearance(scene);
        this.triangleSmallTwoMaterial.setAmbient(0.5, 0.2, 0.7, 1.0);
        this.triangleSmallTwoMaterial.setDiffuse(0.6, 0.3, 0.9, 1.0);
        this.triangleSmallTwoMaterial.setSpecular(0.6, 0.3, 0.9, 1.0);
        this.triangleSmallTwoMaterial.setShininess(40.0);

        this.triangleBigTwoMaterial = new CGFappearance(scene);
        this.triangleBigTwoMaterial.setAmbient(0.8, 0.4, 0.0, 1.0);
        this.triangleBigTwoMaterial.setDiffuse(1.0, 0.5, 0.0, 1.0);
        this.triangleBigTwoMaterial.setSpecular(1.0, 0.5, 0.0, 1.0);
        this.triangleBigTwoMaterial.setShininess(40.0);
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

        // apply material (custom material if selected is custom, set material if not)
        if (Number(this.scene.selectedMaterial) === Number(this.scene.materialIDs['Custom']))
            this.scene.customMaterial.apply();
        else {
            this.diamondMaterial.apply();
        }

        // display
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

        // apply set material
        this.parallelogramMaterial.apply();

        // display
        this.parallelogram.display();

        // pop transformations from stack
        this.scene.popMatrix();

        // --- Triangle - Pink

        this.scene.pushMatrix();

        this.scene.translate(1,0,0);
        this.scene.rotate(180*dtr,0,0,1);

        // apply set material
        this.triangleMaterial.apply();

        // display
        this.triangle.display();
        
        this.scene.popMatrix();

        // --- Triangle Small One - Red

        this.scene.pushMatrix();

        this.scene.translate(2,1.5,0);
        this.scene.rotate(-90*dtr,0,0,1);

        // apply set material
        this.triangleSmallOneMaterial.apply();

        // display
        this.triangleSmallOne.display();

        this.scene.popMatrix();

        // --- Triangle Big One - Blue

        this.scene.pushMatrix();

        this.scene.translate(0,-1,0);

        // apply set material
        this.triangleBigOneMaterial.apply();

        // display
        this.triangleBigOne.display();

        this.scene.popMatrix();

        // --- Triangle Small Two - Purple

        this.scene.pushMatrix();

        this.scene.translate(3,-1.5,0);
        this.scene.rotate(90*dtr,0,0,1);

        // apply set material
        this.triangleSmallTwoMaterial.apply();

        // display
        this.triangleSmallTwo.display();

        this.scene.popMatrix();

        // --- Triangle Big Two - Orange

        this.scene.pushMatrix();

        this.scene.translate(-2,1,0);
        this.scene.rotate(180*dtr,0,0,1);

        // apply set material
        this.triangleBigTwoMaterial.apply();

        // display
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
