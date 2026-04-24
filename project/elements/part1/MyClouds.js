import { CGFobject, CGFshader } from '../../../lib/CGF.js';
import { MyReverseSphere } from '../../primitives/MyReverseSphere.js';

/**
 * MyClouds
 * Procedural animated cloud layer rendered on a reverse-sphere placed just
 * inside the sky dome (slightly smaller radius). Uses an FBM noise shader
 * with alpha blending; depth writes are disabled so future opaque geometry
 * is not occluded by the cloud layer.
 *
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Cloud-sphere radius (should be slightly smaller than the sky)
 * @param slices - Longitudinal subdivisions
 * @param stacks - Latitudinal subdivisions
 */
export class MyClouds extends CGFobject {
    constructor(scene, radius = 29.9, slices = 60, stacks = 30) {
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
        // Keep timeFactor bounded for shader-precision safety.
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
