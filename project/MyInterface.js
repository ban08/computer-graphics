import { CGFinterface, dat } from '../lib/CGF.js';

/**
 * MyInterface
 * Handles GUI controls and keyboard input
 * @constructor
 */
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
        gameplay.add(this.scene.gameplay, 'gameOver').name('Game Over').listen();

        // mandatory as per spec
        gameplay.add(this.scene.gameplay, 'hp').name('Health Points').listen();
        gameplay.add(this.scene.gameplay, 'lastDamage').name('Last Damage').listen();
        gameplay.add(this.scene.gameplay, 'lastHealthRestored').name('Last Restored').listen();
        gameplay.add(this.scene.gameplay, 'totalDeliveredBales').name('Delivered Bales').listen();
        gameplay.add(this.scene.gameplay, 'score').name('Score').listen();

        gameplay.open();

        return true;
    }
}
