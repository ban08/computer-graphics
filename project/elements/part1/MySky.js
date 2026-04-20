import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyReverseSphere } from '../../primitives/MyReverseSphere.js';

/**
 * MySky
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MySky extends CGFobject {
    constructor(scene) {
        super(scene);

        this.reverseSphere = new MyReverseSphere(scene, 30, 30, 30);

        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0.25, 0.4, 0.45, 1);
        this.appearance.setDiffuse(0, 0, 0, 1);
        this.appearance.setSpecular(0, 0, 0, 1);
        this.appearance.setEmission(0.25, 0.4, 0.45, 1);
        this.appearance.setShininess(1);
    }

    display() {
        this.appearance.apply();

        this.reverseSphere.display();
    }
}
