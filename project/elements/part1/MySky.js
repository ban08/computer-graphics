import { CGFobject, CGFshader } from '../../../lib/CGF.js';
import { MyReverseHalfSphere } from '../../primitives/MyReverseHalfSphere.js';

/**
 * MySky
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MySky extends CGFobject {
    constructor(scene) {
        super(scene);

        this.reverseSphere = new MyReverseHalfSphere(scene, 30, 30, 30);

        this.shader = new CGFshader(
            scene.gl,
            "shaders/sky/sky.vert",
            "shaders/sky/sky.frag"
        );

        this.shader.setUniformsValues({sunDir: [0.0, 1.0, 0.0]});
    }

    updateSunDir(x, y, z) {
        const len = Math.sqrt(x*x + y*y + z*z) || 1;
        this.shader.setUniformsValues({sunDir: [x/len, y/len, z/len]});
    }

    display() {
        this.scene.setActiveShader(this.shader);
        this.reverseSphere.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}
