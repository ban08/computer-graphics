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

    // locks out manual camera controls if the camera is set to follow the wagon
    processMouse() {
        if (this.scene.cameraType === 'Follow Wagon') return;
        super.processMouse();
    }

    processWheel(event) {
        if (this.scene.cameraType === 'Follow Wagon') return;
        super.processWheel(event);
    }

    processTouches() {
        if (this.scene.cameraType === 'Follow Wagon') return;
        super.processTouches();
    }

    init(application) {
        super.init(application);

        this.initKeys();

        this.gui = new dat.GUI();

        const gameplay = this.gui.addFolder('Gameplay');
        gameplay.add(this.scene, 'cameraType', ['Free Camera', 'Follow Wagon']).name('Camera Type')
            .onChange((cameraType) => {
                if (cameraType === 'Free Camera') this.scene.setFreeCamera();
            });
        gameplay.add(this.scene.gameplay, 'hp').name('Health (HP)').listen();
        gameplay.add(this.scene.gameplay, 'score').name('Score (s)').listen();
        gameplay.add(this.scene.gameplay, 'currentBales').name('Cargo Bales').listen();
        gameplay.add(this.scene.gameplay, 'totalPickedUpBales').name('Picked Up').listen();
        gameplay.add(this.scene.gameplay, 'totalDeliveredBales').name('Delivered').listen();
        gameplay.add(this.scene.gameplay, 'lastDamage').name('Last Damage').listen();
        gameplay.add(this.scene.gameplay, 'lastHealthRestored').name('Last Restored').listen();
        gameplay.add(this.scene.gameplay, 'gameOver').name('Game Over').listen();
        gameplay.open();

        // to remove later for delivery
        const dev = this.gui.addFolder('dev');

        const sun = dev.addFolder('Sun');
        sun.add(this.scene.sun, 'visible').name('Visible');
        sun.add(this.scene.sun, 'moving').name('Moving');
        sun.add(this.scene.sun, 'timeOffset', 0, 62800, 100).name('Time offset');
        sun.add(this.scene.sun, 'speed', 0, 0.001, 0.00001).name('Velocity');
        sun.add(this.scene.sun, 'arc', 0, 25, 1).name('Arc radius');

        const clouds = dev.addFolder('Clouds');
        clouds.add(this.scene.clouds, 'visible').name('Visible');
        clouds.add(this.scene.clouds, 'amount', 0, 1, 0.01).name('Amount');

        const wind = dev.addFolder('Wind');
        wind.add(this.scene.clouds, 'driftSpeed', 0, 0.05, 0.001).name('Speed');
        wind.add(this.scene.clouds, 'windAngleDeg', 0, 360, 1).name('Direction');

        const grass = dev.addFolder('Grass');
        grass.add(this.scene.grass, 'visible').name('Visible');
        grass.add(this.scene.grass, 'densityFactor', 1, 100, 1)
            .name('Amount')
            .onFinishChange(() => this.scene.grass.rebuild());

        return true;
    }
}
