import {CGFinterface, dat} from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);

        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'displayAxis').name('Display Axis');

        const clouds = this.gui.addFolder('Clouds');
        clouds.add(this.scene.clouds, 'visible').name('Visible');
        clouds.add(this.scene.clouds, 'coverage', 0, 1, 0.01).name('Coverage');
        clouds.add(this.scene.clouds, 'speed', 0, 0.1, 0.001).name('Drift speed');
        clouds.open();

        return true;
    }
}