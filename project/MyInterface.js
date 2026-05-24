import { CGFinterface, dat } from '../lib/CGF.js';

export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    // initkeys similar to the keyboard events example!
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function() {};
        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    }

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    }

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    init(application) {
        super.init(application);

        this.initKeys();

        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'displayAxis').name('Display Axis');

        const sun = this.gui.addFolder('Sun');
        sun.add(this.scene.sun, 'visible').name('Visible');
        sun.add(this.scene.sun, 'moving').name('Moving');
        sun.add(this.scene.sun, 'timeOffset', 0, 62800, 100).name('Time offset');
        sun.add(this.scene.sun, 'speed', 0, 0.001, 0.00001).name('Velocity');
        sun.add(this.scene.sun, 'arc', 0, 25, 1).name('Arc radius');
        sun.open();

        const clouds = this.gui.addFolder('Clouds');
        clouds.add(this.scene.clouds, 'visible').name('Visible');
        clouds.add(this.scene.clouds, 'amount', 0, 1, 0.01).name('Amount');
        clouds.open();

        const wind = this.gui.addFolder('Wind');
        wind.add(this.scene.clouds, 'driftSpeed', 0, 0.05, 0.001).name('Speed');
        wind.add(this.scene.clouds, 'windAngleDeg', 0, 360, 1).name('Direction');
        wind.open();

        const grass = this.gui.addFolder('Grass');
        grass.add(this.scene.grass, 'visible').name('Visible');
        grass.add(this.scene.grass, 'densityFactor', 1, 100, 1)
            .name('Amount')
            .onFinishChange(() => this.scene.grass.rebuild());
        grass.open();

        return true;
    }
}
