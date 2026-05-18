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
        this.x = 0;
        this.y = 0;
        this.z = 0;
      
        this.speed = 0.0001;
        this.arc = 30;
        this.sunX = this.x;
        this.sunY = this.y;

        this.moving = true;
        this.startTime = null;
        this.timeOffset = 0;

        this.sun = new MySphere(scene, this.radius, 20, 20);
                
        this.shader = new CGFshader(
            scene.gl,
            "shaders/sun/sun.vert",
            "shaders/sun/sun.frag"
        );
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(1, 0.92, 0.38, 1);
        this.appearance.setDiffuse(1, 0.86, 0.18, 1);
        this.appearance.setSpecular(0, 0, 0, 1);
        this.appearance.setEmission(1, 0.82, 0.16, 1);
        this.appearance.setShininess(1);

        this.visible = true;
    }

    update(t) {
        if (!this.moving) return;
        
        if (this.startTime === null) {
            this.startTime = t;
        }

        var time = t - this.startTime + this.timeOffset;
        var angle = time  * this.speed;

        this.sunX = Math.cos(angle) * this.arc;
        this.sunY = Math.sin(angle) * this.arc;
    }

    display() {
        if (!this.visible) return;
        
        this.scene.pushMatrix();
        this.scene.translate(this.sunX, this.sunY, this.z);
        this.scene.setActiveShader(this.shader);
        this.appearance.apply();
        this.sun.display();
        this.scene.setActiveShader(this.scene.defaultShader); 
        this.scene.popMatrix();
    }
}
