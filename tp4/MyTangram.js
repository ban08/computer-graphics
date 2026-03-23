import {CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyDiamond } from './MyDiamond.js';
import { MyTriangle } from './MyTriangle.js';
import { MyParallelogram } from './MyParallelogram.js';
import { MyTriangleSmall } from './MyTriangleSmall.js';
import { MyTriangleBig } from './MyTriangleBig.js';

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

		const smallLeftTexCoords = [
			0.25, 0.25,
			0.00, 0.00,
			0.00, 0.50,
			0.25, 0.25,
			0.00, 0.00,
			0.00, 0.50
		];

		const smallCenterTexCoords = [
			0.50, 0.50,
			0.25, 0.75,
			0.75, 0.75,
			0.50, 0.50,
			0.25, 0.75,
			0.75, 0.75
		];

		const bigTopTexCoords = [
			0.50, 0.50,
			0.00, 0.00,
			1.00, 0.00,
			0.50, 0.50,
			0.00, 0.00,
			1.00, 0.00
		];

		const bigRightTexCoords = [
			0.50, 0.50,
			1.00, 0.00,
			1.00, 1.00,
			0.50, 0.50,
			1.00, 0.00,
			1.00, 1.00
		];

		this.triangleSmallOne.updateTexCoords(smallLeftTexCoords);
		this.triangleSmallTwo.updateTexCoords(smallCenterTexCoords);
		this.triangleBigOne.updateTexCoords(bigTopTexCoords);
		this.triangleBigTwo.updateTexCoords(bigRightTexCoords);

		this.tangramMaterial = new CGFappearance(scene);
		this.tangramMaterial.setAmbient(0.1, 0.1, 0.1, 1);
		this.tangramMaterial.setDiffuse(0.9, 0.9, 0.9, 1);
		this.tangramMaterial.setSpecular(0.1, 0.1, 0.1, 1);
		this.tangramMaterial.setShininess(10.0);
		this.tangramMaterial.loadTexture('images/tangram.png');
		this.tangramMaterial.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
	}

	display() {
		// const to center 45 degree rotations
		const h = Math.sqrt(2) / 2;

		// degree to rad const
		const dtr = Math.PI / 180;

		// --- Diamond

		this.scene.pushMatrix();

		var tra = [
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			3.0 + h, 0.0, 0.0, 1.0,
		];

		this.scene.multMatrix(tra);

		var rot = [
			Math.cos(45 * Math.PI / 180), Math.sin(45 * Math.PI / 180), 0.0, 0.0,
			-(Math.sin(45 * Math.PI / 180)), Math.cos(45 * Math.PI / 180), 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
		];

		this.scene.multMatrix(rot);
		this.tangramMaterial.apply();
		this.diamond.display();
		this.scene.popMatrix();

		// --- Parallelogram

		this.scene.pushMatrix();
		this.scene.translate(2.5, 0, 0);
		this.scene.rotate(180 * dtr, 1, 0, 0);
		this.scene.rotate(90 * dtr, 0, 0, 1);
		this.scene.translate(-1.5, -0.5, 0);
		this.tangramMaterial.apply();
		this.parallelogram.display();
		this.scene.popMatrix();

		// --- Triangle

		this.scene.pushMatrix();
		this.scene.translate(1, 0, 0);
		this.scene.rotate(180 * dtr, 0, 0, 1);
		this.tangramMaterial.apply();
		this.triangle.display();
		this.scene.popMatrix();

		// --- Triangle Small One

		this.scene.pushMatrix();
		this.scene.translate(2, 1.5, 0);
		this.scene.rotate(-90 * dtr, 0, 0, 1);
		this.tangramMaterial.apply();
		this.triangleSmallOne.display();
		this.scene.popMatrix();

		// --- Triangle Big One

		this.scene.pushMatrix();
		this.scene.translate(0, -1, 0);
		this.tangramMaterial.apply();
		this.triangleBigOne.display();
		this.scene.popMatrix();

		// --- Triangle Small Two

		this.scene.pushMatrix();
		this.scene.translate(3, -1.5, 0);
		this.scene.rotate(90 * dtr, 0, 0, 1);
		this.tangramMaterial.apply();
		this.triangleSmallTwo.display();
		this.scene.popMatrix();

		// --- Triangle Big Two

		this.scene.pushMatrix();
		this.scene.translate(-2, 1, 0);
		this.scene.rotate(180 * dtr, 0, 0, 1);
		this.tangramMaterial.apply();
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
