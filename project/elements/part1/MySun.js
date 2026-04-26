import { CGFobject, CGFappearance, CGFshader } from '../../../lib/CGF.js';
import { MySphere } from '../../primitives/MySphere.js';

/**
 * MySun
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MySun extends CGFobject {
    constructor(scene) {
        super(scene);

        this.radius = 1.5;
        this.x = 10;
        this.y = 20;
        this.z = 10;

        this.sun = new MySphere(scene, this.radius, 20, 20);
                
        this.shader = new CGFshader(
            scene.gl,
            "shaders/sun/sun.vert",
            "shaders/sun/sun.frag"
        );
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(1, 1, 0, 1);
        this.appearance.setDiffuse(1, 1, 0, 1);
        this.appearance.setSpecular(0, 0, 0, 1);
        this.appearance.setEmission(1, 1, 0, 1);
        this.appearance.setShininess(1);

        this.visible = true;
    }

    display() {
        
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.scene.setActiveShader(this.shader);
        this.appearance.apply();
        this.sun.display();
        this.scene.setActiveShader(this.scene.defaultShader); 
        this.scene.popMatrix();
    }

}
