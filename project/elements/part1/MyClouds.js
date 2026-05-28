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
    // --- constructor

    constructor(scene, radius = 120, slices = 90, stacks = 36) {
        super(scene);

        this.radius = radius;
        this.sphere = new MyReverseSphere(scene, radius, slices, stacks);
        this.curvature = 0.22;
        this.edgeDrop = 16.0;

        this.shader = new CGFshader(
            scene.gl,
            "shaders/clouds/clouds.vert",
            "shaders/clouds/clouds.frag"
        );

        this.amount = 0.65;
        this.driftSpeed = 0.005;
        this.windAngleDeg = 35;
        this.altitude = 0.48;
        this.horizonFade = 0.14;
        this.visible = true;

        const wind = this.getWindVector();
        this.shader.setUniformsValues({
            timeFactor: 0,
            coverage: this.amount,
            speed: this.driftSpeed,
            windDir: wind,
            cloudBase: this.altitude,
            cloudSoftness: this.horizonFade,
            cloudColor: [1.0, 1.0, 1.0],
            sunDir: [0.4, 0.6, 0.7],
        });
    }

    // --- updaters

    updateSunDir(x, y, z) {
        const len = Math.sqrt(x*x + y*y + z*z) || 1;
        this.shader.setUniformsValues({ sunDir: [x/len, y/len, z/len] });
    }

    update(t) {
        // Limit the time uniform to avoid precision loss in the shader.
        this.shader.setUniformsValues({
            timeFactor: (t / 100.0) % 10000.0,
            coverage: this.amount,
            speed: this.driftSpeed,
            windDir: this.getWindVector(),
            cloudBase: this.altitude,
            cloudSoftness: this.horizonFade,
        });
    }

    // --- displayers

    display() {
        if (!this.visible) return;

        const gl = this.scene.gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);

        this.scene.setActiveShader(this.shader);
        this.scene.pushMatrix();
        this.scene.translate(0.0, this.radius * this.curvature - this.edgeDrop, 0.0);
        this.scene.scale(1.0, this.curvature, 1.0);
        this.sphere.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);

        gl.depthMask(true);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }

    // --- exposed getters

    getWindVector() {
        const rad = this.windAngleDeg * Math.PI / 180.0;
        return [Math.cos(rad), Math.sin(rad)];
    }

    getDriftSpeed() {
        return this.driftSpeed;
    }
}
