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

    // disables gui controlls to make them read only

    makeReadOnly(controller) {
        controller.domElement.style.pointerEvents = 'none';

        controller.domElement.querySelectorAll('input, select, button').forEach((element) => {
            element.disabled = true;
            element.tabIndex = -1;
        });

        return controller;
    }

    init(application) {
        super.init(application);

        this.initKeys();

        this.gui = new dat.GUI();
        
        const gameplayStats = this.gui.addFolder('Gameplay Statistics');

        // mandatory as per spec
        this.makeReadOnly(gameplayStats.add(this.scene.gameplay, 'hp', 0, this.scene.gameplay.initialHp).name('Health Points').listen());
        this.makeReadOnly(gameplayStats.add(this.scene.gameplay, 'lastDamage').name('Last Damage').listen());
        this.makeReadOnly(gameplayStats.add(this.scene.gameplay, 'lastHealthRestored').name('Last Restored').listen());
        this.makeReadOnly(gameplayStats.add(this.scene.gameplay, 'totalDeliveredBales').name('Delivered Bales').listen());
        this.makeReadOnly(gameplayStats.add(this.scene.gameplay, 'score').name('Score').listen());
        
        gameplayStats.open();

        const gameplayConfigs = this.gui.addFolder('Gameplay Configuration');

        gameplayConfigs.add(this.scene, 'cameraType', ['Free Camera', 'Follow Wagon']).name('Camera Type')
            .onChange((cameraType) => {
                if (cameraType === 'Free Camera') this.scene.toggleFreeCamera = true;
            });

        gameplayConfigs.open();

        return true;
    }
}
