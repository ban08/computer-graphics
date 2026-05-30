import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyCappedCylinder } from '../primitives/MyCappedCylinder.js';
import { MySphere } from '../primitives/MySphere.js';

/**
 * MyFlower
 * @constructor
 * @param scene - Reference to MyScene object
 * @param options - Flower parameter object
 * @param options.scale - Overall flower scale
 * @param options.stemHeight - Height of the stem along the Y axis
 * @param options.stemRadius - Radius of the cylindrical stem
 * @param options.stemColor - Stem color as [r, g, b, a]
 * @param options.leafCount - Number of leaves distributed along the stem
 * @param options.leafLength - Length of each leaf
 * @param options.leafWidth - Width of each leaf
 * @param options.leafColor - Leaf color as [r, g, b, a]
 * @param options.petalCount - Number of petals around the flower center
 * @param options.petalLength - Length of each petal
 * @param options.petalWidth - Width of each petal
 * @param options.petalThickness - Thickness of each petal
 * @param options.petalTilt - Petal rotation around the local X axis
 * @param options.petalColor - Petal color as [r, g, b, a]
 * @param options.petalTexture - Texture (as CFGTexture) of each petal
 * @param options.centerRadius - Radius of the flower center
 * @param options.centerColor - Center color as [r, g, b, a]
 */
export class MyFlower extends CGFobject {
    constructor(scene, options = {}) {
        super(scene);

        this.scale = options.scale ?? 1.0;

        this.stemHeight = options.stemHeight ?? 0.8;
        this.stemRadius = options.stemRadius ?? 0.025;
        this.stemColor = options.stemColor ?? [0.12, 0.42, 0.12, 1.0];

        this.leafCount = options.leafCount ?? 2;
        this.leafLength = options.leafLength ?? 0.22;
        this.leafWidth = options.leafWidth ?? 0.08;
        this.leafColor = options.leafColor ?? [0.10, 0.35, 0.10, 1.0];

        this.petalCount = options.petalCount ?? 8;
        this.petalLength = options.petalLength ?? 0.22;
        this.petalWidth = options.petalWidth ?? 0.08;
        this.petalThickness = options.petalThickness ?? 0.018;
        this.petalTilt = options.petalTilt ?? -0.35;
        this.petalColor = options.petalColor ?? [0.92, 0.28, 0.42, 1.0];
        this.petalTexture = options.petalTexture ?? null;

        this.centerRadius = options.centerRadius ?? 0.075;
        this.centerColor = options.centerColor ?? [0.86, 0.60, 0.12, 1.0];

        this.stem = new MyCappedCylinder(scene, this.stemRadius, this.stemHeight, 8, 1);
        this.leaf = new MySphere(scene, 1, 12, 6);
        this.petal = new MySphere(scene, 1, 12, 6);
        this.center = new MySphere(scene, this.centerRadius, 16, 8);

        this.stemMaterial = this.createMaterial(this.stemColor, 0.35, 0.08, 8);
        this.leafMaterial = this.createMaterial(this.leafColor, 0.35, 0.08, 8);
        this.petalMaterial = this.createMaterial(this.petalColor, 0.45, 0.16, 18);
        this.centerMaterial = this.createMaterial(this.centerColor, 0.45, 0.10, 12);

        if (this.petalTexture) {
            this.petalMaterial.setTexture(this.petalTexture);
            this.petalMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
    }

    createMaterial(color, ambientFactor, specular, shininess) {
        const material = new CGFappearance(this.scene);

        material.setAmbient(color[0] * ambientFactor, color[1] * ambientFactor, color[2] * ambientFactor, color[3]);
        material.setDiffuse(color[0], color[1], color[2], color[3]);
        material.setSpecular(specular, specular, specular, 1.0);
        material.setShininess(shininess);

        return material;
    }

    display() {
        this.scene.pushMatrix();

        this.scene.scale(this.scale, this.scale, this.scale);

        this.displayLeaves();
        this.displayPetals();
        this.displayCenter();
        this.displayStem();

        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }

    displayStem() {
        this.stemMaterial.apply();

        this.scene.pushMatrix();

        this.scene.translate(0, this.stemHeight / 2, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);

        this.stem.display();

        this.scene.popMatrix();
    }

    displayLeaves() {
        this.leafMaterial.apply();

        for (let i = 0; i < this.leafCount; i++) {
            const angle = (i / this.leafCount) * Math.PI * 2;
            const height = this.stemHeight * (0.25 + 0.45 * ((i + 1) / (this.leafCount + 1)));

            this.scene.pushMatrix();

            this.scene.translate(0, height, 0);
            this.scene.rotate(angle, 0, 1, 0);
            this.scene.rotate(-0.55, 1, 0, 0);
            this.scene.translate(0, 0, this.leafLength * 0.45);
            this.scene.scale(this.leafWidth, 0.012, this.leafLength);

            this.leaf.display();

            this.scene.popMatrix();
        }
    }

    displayPetals() {
        this.petalMaterial.apply();

        for (let i = 0; i < this.petalCount; i++) {
            const angle = (i / this.petalCount) * Math.PI * 2;

            this.scene.pushMatrix();

            this.scene.translate(0, this.stemHeight, 0);
            this.scene.rotate(angle, 0, 1, 0);
            this.scene.rotate(this.petalTilt, 1, 0, 0);
            this.scene.translate(0, 0, this.centerRadius + this.petalLength * 0.55);
            this.scene.scale(this.petalWidth, this.petalThickness, this.petalLength);
            
            this.petal.display();
            
            this.scene.popMatrix();
        }
    }

    displayCenter() {
        this.centerMaterial.apply();

        this.scene.pushMatrix();

        this.scene.translate(0, this.stemHeight, 0);
        this.scene.scale(1.0, 0.65, 1.0);
        
        this.center.display();

        this.scene.popMatrix();
    }
}
