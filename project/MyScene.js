import { CGFscene, CGFcamera } from "../lib/CGF.js";
import { MySky } from "./elements/environment/MySky.js";
import { MySun } from "./elements/environment/MySun.js";
import { MyClouds } from "./elements/environment/MyClouds.js";
import { MyTerrain } from "./elements/terrain/MyTerrain.js";
import { MyScatterElements } from "./elements/terrain/MyScatterElements.js";
import { MyFlowers } from "./elements/flora/MyFlowers.js";
import { MyGrass } from "./elements/flora/MyGrass.js";
import { MyWagon } from "./elements/interaction/MyWagon.js";
import { MyHayBales } from "./elements/gameplay/MyHayBales.js";
import { MyBarn } from "./elements/gameplay/MyBarn.js";
import { MyGameplay } from "./MyGameplay.js";
import { MyBoundaryFence } from "./objects/MyBoundaryFence.js";

/**
 * MyScene
 * Builds and updates the main scene
 * @constructor
 */
export class MyScene extends CGFscene {
  	constructor() {
    	super();
  	}

  	init(application) {
    	super.init(application);

    	this.initCameras();
    	this.initLights();

    	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(100.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);

		this.enableTextures(true);
		this.setUpdatePeriod(50);

		this.gameplay = new MyGameplay();
		this.createWorld();
		this.gameplay.onRestart = () => this.restartWorld();

		this.cameraType = 'Follow Wagon';
		this.toggleFreeCamera = false;

		this.gameOverOverlay = document.getElementById('gameOverOverlay');
  	}

	createWorld() {
		// environment
		this.sky = new MySky(this);
		this.sun = new MySun(this);
		this.clouds = new MyClouds(this);

		// terrain
		this.terrain = new MyTerrain(this);
		this.scatterElements = new MyScatterElements(this, this.terrain);

		// flora
		this.flowers = new MyFlowers(this, this.terrain);
		this.grass = new MyGrass(this, this.terrain);

		// interaction
		this.wagon = new MyWagon(this, this.terrain);

		// gameplay
		this.hayBales = new MyHayBales(this, this.terrain, this.flowers, this.scatterElements, this.wagon);
		this.barn = new MyBarn(this, this.terrain);

		// extra
		this.gameplay.setWorld({
			wagon: this.wagon,
			hayBales: this.hayBales,
			scatterElements: this.scatterElements,
			barn: this.barn,
		});
		this.boundaryFence = new MyBoundaryFence(this, this.terrain);
	}

	restartWorld() {
		this.gameplay.reset();
		this.createWorld();
	}

  	update(t) {
		this.sun.update(t);
		const sunPosition = this.sun.getPosition();
		const sunAmount = Math.max(0.0, Math.min(sunPosition.y / 10.0, 1.0));

		this.lights[0].setPosition(sunPosition.x, sunPosition.y, sunPosition.z, 0);
		this.lights[0].setAmbient(0.28 * sunAmount, 0.25 * sunAmount, 0.18 * sunAmount, 1.0);
		this.lights[0].setDiffuse(1.25 * sunAmount, 1.15 * sunAmount, 0.85 * sunAmount, 1.0);
        this.lights[0].setSpecular(1.0 * sunAmount, 0.9 * sunAmount, 0.55 * sunAmount, 1.0);
        this.lights[0].update();

        this.sky.updateSunDir(sunPosition.x, sunPosition.y, sunPosition.z);

        this.clouds.updateSunDir(sunPosition.x, sunPosition.y, sunPosition.z);
		this.clouds.update(t);

        this.terrain.updateSunDir(sunPosition.x, sunPosition.y, sunPosition.z);

        this.grass.update(t, this.clouds);
        this.grass.updateSunDir(sunPosition.x, sunPosition.y, sunPosition.z);

		this.scatterElements.update(t);

		this.gameplay.update(t, this.gui);

		this.hayBales.update(t);
		
		if (this.cameraType == 'Follow Wagon') {
			this.setChaseCamera();
		} else if (this.cameraType == 'Free Camera' && this.toggleFreeCamera) {
			this.setFreeCamera();
			this.toggleFreeCamera = false;
		}

		this.updateGameOverOverlay(t);
  	}

  	initLights() {
    	this.lights[0].setPosition(15, 2, 5, 1);
		this.lights[0].setDiffuse(1.25, 1.15, 0.85, 1.0);
        this.lights[0].setSpecular(1.0, 0.9, 0.55, 1.0);
        this.lights[0].setAmbient(0.28, 0.25, 0.18, 1.0);
		this.lights[0].enable();
		this.lights[0].update();

		this.lights[1].setPosition(0, -1, 0, 0);
		this.lights[1].setDiffuse(0.38, 0.44, 0.52, 1.0);
        this.lights[1].setSpecular(0.0, 0.0, 0.0, 1.0);
        this.lights[1].setAmbient(0.30, 0.34, 0.42, 1.0);
		this.lights[1].enable();
		this.lights[1].update();
  	}

  	initCameras() {
    	this.camera = new CGFcamera(
      		0.4,
      		0.1,
      		500,
      		vec3.fromValues(0, 0, 0),
      		vec3.fromValues(0, 0, 0)
    	);
  	}

	setChaseCamera() {
		const pose = this.wagon.getTerrainPose();
		const wagonPose = this.wagon.getPose();
		const dx = Math.sin(wagonPose.rotation);
		const dz = Math.cos(wagonPose.rotation);

		vec4.set(this.camera.position, wagonPose.x - dx * 18, pose.y + 6, wagonPose.z - dz * 18, 0);
		vec4.set(this.camera.target, wagonPose.x, pose.y + 2, wagonPose.z, 0);

		this.camera.direction = this.camera.calculateDirection();
	}

	setFreeCamera() {
		vec4.set(this.camera.position, 15, 5.5, 15, 0);
		vec4.set(this.camera.target, 0, 5, 0, 0);
		
		this.camera.direction = this.camera.calculateDirection();
	}

	setDefaultAppearance() {
		this.setAmbient(0.2, 0.4, 0.8, 1.0);
		this.setDiffuse(0.2, 0.4, 0.8, 1.0);
		this.setSpecular(0.2, 0.4, 0.8, 1.0);
		this.setShininess(10.0);
	}

	updateGameOverOverlay(t) {
		if (!this.gameOverOverlay) return;

		if (!this.gameplay.gameOver) {
			this.gameOverOverlay.style.display = 'none';
			return;
		}

		const elapsed = t - (this.gameplay.gameOverTime ?? t);
		const remaining = Math.max(0, Math.ceil((this.gameplay.restartDelay - elapsed) / 1000));

		this.gameOverOverlay.textContent = `Game Over! Restarting in ${remaining}`;
		this.gameOverOverlay.style.display = 'flex';
	}

  	display() {
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.updateProjectionMatrix();
		this.loadIdentity();

		this.applyViewMatrix();

		this.lights[0].update();
		this.lights[1].update();

		this.setDefaultAppearance();

		this.sky.display();
		this.sun.display();
		this.clouds.display();
		this.terrain.display();
		this.scatterElements.display();
		this.flowers.display();
		this.grass.display();
		this.wagon.display();
		this.hayBales.display();
		this.barn.display();
		this.boundaryFence.display();
	}
}
