import { CGFobject, CGFshader } from '../../lib/CGF.js';
import { MyTexturedBox } from '../primitives/MyTexturedBox.js';
import { MyArrowHead } from '../primitives/MyArrowHead.js';

/**
 * MyPinpointArrow
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyPinpointArrow extends CGFobject {
    constructor(scene) {
        super(scene);

        this.shaft = new MyTexturedBox(scene, 0.07, 0.72, 0.07, 0.18);
        this.head = new MyArrowHead(scene, 0.42, 0.42, 0.09);
        this.bobAmplitude = 0.28;
        this.bobSpeed = 2.4;
        this.timeSeconds = 0.0;
        
        this.normalBaseColor = [1.0, 0.18, 0.08];
        this.normalTipColor = [1.0, 0.92, 0.12];

        this.interactionBaseColor = [0.0, 0.85, 0.10];
        this.interactionTipColor = [0.55, 1.0, 0.20];

        this.shader = new CGFshader(
            scene.gl,
            'shaders/arrows/arrow.vert',
            'shaders/arrows/arrow.frag'
        );

        this.shader.setUniformsValues({
            timeFactor: 0.0,
            bobAmplitude: this.bobAmplitude,
            bobSpeed: this.bobSpeed,
            phase: 0.0,
            baseColor: this.normalBaseColor,
            tipColor: this.normalTipColor,
        });
    }

    update(t) {
        this.timeSeconds = (t / 1000.0) % 10000.0;

        this.shader.setUniformsValues({
            timeFactor: this.timeSeconds,
            bobAmplitude: this.bobAmplitude,
        });
    }

    display(phase = 0.0, wagonInInteractionArea) {
        const gl = this.scene.gl;
        const cullWasEnabled = gl.isEnabled(gl.CULL_FACE);

        this.shader.setUniformsValues({ phase });

        if (wagonInInteractionArea) {
            this.shader.setUniformsValues({
                baseColor: this.interactionBaseColor,
                tipColor: this.interactionTipColor,
            });
        } else {
            this.shader.setUniformsValues({
                baseColor: this.normalBaseColor,
                tipColor: this.normalTipColor,
            });
        }

        gl.disable(gl.CULL_FACE);
        this.scene.setActiveShader(this.shader);

        this.scene.pushMatrix();
        this.scene.translate(0, 0.42, 0);
        this.shaft.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, -0.14, 0);
        this.head.display();
        this.scene.popMatrix();

        this.scene.setActiveShader(this.scene.defaultShader);
        if (cullWasEnabled) gl.enable(gl.CULL_FACE);
    }
}
