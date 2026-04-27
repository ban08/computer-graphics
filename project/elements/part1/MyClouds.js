import { CGFobject, CGFshader } from '../../../lib/CGF.js';
import { MyReverseSphere } from '../../primitives/MyReverseSphere.js';

/**
 * MyClouds
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius of the cloud sphere
 * @param slices - Number of horizontal cloud sphere subdivisions
 * @param stacks - Number of vertical cloud sphere subdivisions
 */
export class MyClouds extends CGFobject {
    constructor(scene, radius = 30, slices = 60, stacks = 30) {
        super(scene);

        this.sphere = new MyReverseSphere(scene, radius, slices, stacks);

        this.shader = new CGFshader(
            scene.gl,
            "shaders/clouds/clouds.vert",
            "shaders/clouds/clouds.frag"
        );

        this.coverage = 0.65;
        this.speed = 0.02;
        this.visible = true;

        this.shader.setUniformsValues({
            timeFactor: 0,
            coverage: this.coverage,
            speed: this.speed,
            cloudColor: [1.0, 1.0, 1.0],
        });
    }

    update(t) {
        // Limit the time uniform to avoid precision loss in the shader.
        this.shader.setUniformsValues({
            timeFactor: (t / 100.0) % 10000.0,
            coverage: this.coverage,
            speed: this.speed,
        });
    }

    display() {
        if (!this.visible) return;

        const gl = this.scene.gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);

        this.scene.setActiveShader(this.shader);
        this.sphere.display();
        this.scene.setActiveShader(this.scene.defaultShader);

        gl.depthMask(true);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }
}
