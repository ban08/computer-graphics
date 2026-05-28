import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyTexturedBox } from '../primitives/MyTexturedBox.js';

/**
 * MyHayBale
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyHayBale extends CGFobject {
    constructor(scene) {
        super(scene);

        this.bale = new MyTexturedBox(this.scene, 0.62, 0.34, 0.50, 0.28);
        this.baleBandX = new MyTexturedBox(this.scene, 0.68, 0.04, 0.055, 0.20);
        this.baleBandZ = new MyTexturedBox(this.scene, 0.055, 0.04, 0.56, 0.20);

        this.initMaterials();
    }


    initMaterials() {
     
        this.hay = new CGFappearance(this.scene);
        this.hay.setAmbient(0.70, 0.50, 0.18, 1);
        this.hay.setDiffuse(0.95, 0.72, 0.28, 1);
        this.hay.setSpecular(0.10, 0.08, 0.03, 1);
        this.hay.setShininess(6);
        this.hay.setTexture(new CGFtexture(this.scene, './textures/wagonHay.svg'));
        this.hay.setTextureWrap('REPEAT', 'REPEAT');

        this.leather = new CGFappearance(this.scene);
        this.leather.setAmbient(0.20, 0.10, 0.05, 1);
        this.leather.setDiffuse(0.34, 0.18, 0.09, 1);
        this.leather.setSpecular(0.16, 0.08, 0.04, 1);
        this.leather.setShininess(22);
        this.leather.setTexture(new CGFtexture(this.scene, './textures/wagonLeather.svg'));
        this.leather.setTextureWrap('REPEAT', 'REPEAT');
    }


    drawAt(object, x, y, z) {
        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        object.display();
        this.scene.popMatrix();
    }

    display() {
        this.hay.apply();
        this.bale.display();


        this.leather.apply();
        this.drawAt(this.baleBandX, 0, 0.18, -0.14);
        this.drawAt(this.baleBandX, 0, 0.18, 0.14);
        this.drawAt(this.baleBandZ, -0.17, 0.19, 0);
        this.drawAt(this.baleBandZ, 0.17, 0.19, 0);
    }
}