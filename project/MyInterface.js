import {CGFinterface, dat} from '../lib/CGF.js';

export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);

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
        clouds.add(this.scene.clouds, 'driftSpeed', 0, 0.08, 0.001).name('Wind drift');
        clouds.add(this.scene.clouds, 'altitude', 0.35, 0.75, 0.01).name('Altitude');
        clouds.add(this.scene.clouds, 'horizonFade', 0.06, 0.35, 0.01).name('Horizon fade');
        clouds.add(this.scene.clouds, 'curvature', 0.12, 0.40, 0.01).name('Curvature');
        clouds.add(this.scene.clouds, 'edgeDrop', 0, 30, 1).name('Edge drop');
        clouds.open();

        const grass = this.gui.addFolder('Grass');
        grass.add(this.scene.grass, 'visible').name('Visible');
        grass.add(this.scene.grass, 'windStrength', 0, 0.5, 0.01).name('Wind strength');
        grass.add(this.scene.grass, 'windSpeed', 0, 3, 0.05).name('Wind speed');
        grass.add(this.scene.grass, 'windAngleDeg', 0, 360, 1).name('Wind angle');
        grass.open();

        return true;
    }
}
