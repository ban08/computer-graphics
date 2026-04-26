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
        sun.add(this.scene.sun, 'speed', 0, 0.001, 0.00001).name('Velocity');
        sun.add(this.scene.sun, 'arc', 0, 25, 1).name('Arc radius');
        sun.open();

        const clouds = this.gui.addFolder('Clouds');
        clouds.add(this.scene.clouds, 'visible').name('Visible');
        clouds.add(this.scene.clouds, 'coverage', 0, 1, 0.01).name('Coverage');
        clouds.add(this.scene.clouds, 'speed', 0, 0.1, 0.001).name('Drift speed');
        clouds.open();

        const terrain = this.gui.addFolder('Terrain');
        terrain.add(this.scene.terrain, 'visible').name('Visible');
        terrain.add(this.scene.terrain, 'mode', ['heightmap', 'procedural']).name('Mode');
        terrain.add(this.scene.terrain, 'heightScale', 0, 8, 0.1).name('Height scale');
        terrain.add(this.scene.terrain, 'frequency', 0.01, 0.2, 0.001).name('Procedural freq');
        terrain.add(this.scene.terrain, 'randomizeSeed').name('Randomize seed');
        terrain.open();

        return true;
    }
}
