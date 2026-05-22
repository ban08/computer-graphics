import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MySky } from "./elements/part1/MySky.js";
import { MyClouds } from "./elements/part1/MyClouds.js";
import { MySun } from "./elements/part1/MySun.js";
import { MyTerrain } from "./elements/part2/MyTerrain.js";
import { MyScatterElements } from "./elements/part2/MyScatterElements.js";
import { MyGrassField } from "./elements/part3/MyGrassField.js";
import { MyWagon } from "./elements/part4/MyWagon.js";

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

		this.axis = new CGFaxis(this);
		this.sky = new MySky(this);
		this.clouds = new MyClouds(this);
		this.sun = new MySun(this);
		this.terrain = new MyTerrain(this);
		this.scatterElements = new MyScatterElements(this, this.terrain);
		this.grass = new MyGrassField(this, this.terrain);
		this.wagon = new MyWagon(this, this.terrain, {
			obstacles: this.scatterElements.getCollisionObstacles(),
		});

		this.setUpdatePeriod(50);

    	this.displayAxis = true;
  	}

  	update(t) {
		this.sun.update(t);
		this.lights[0].setPosition(this.sun.sunX, this.sun.sunY, this.sun.z, 0);
		const sunAmount = Math.max(0.0, Math.min(this.sun.sunY / 10.0, 1.0));
		this.lights[0].setAmbient(0.28 * sunAmount, 0.25 * sunAmount, 0.18 * sunAmount, 1.0);
		this.lights[0].setDiffuse(1.25 * sunAmount, 1.15 * sunAmount, 0.85 * sunAmount, 1.0);
        this.lights[0].setSpecular(1.0 * sunAmount, 0.9 * sunAmount, 0.55 * sunAmount, 1.0);
        this.lights[0].update();
        this.sky.updateSunDir(this.sun.sunX, this.sun.sunY, this.sun.z);
        this.clouds.updateSunDir(this.sun.sunX, this.sun.sunY, this.sun.z);
		this.clouds.update(t);
        this.terrain.updateSunDir(this.sun.sunX, this.sun.sunY, this.sun.z);
        this.grass.update(t, this.clouds);
        this.grass.updateSunDir(this.sun.sunX, this.sun.sunY, this.sun.z);
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
      		vec3.fromValues(15, 5.5	, 15),
      		vec3.fromValues(12.5, 5, 12.5)
    	);
  	}

	setDefaultAppearance() {
		this.setAmbient(0.2, 0.4, 0.8, 1.0);
		this.setDiffuse(0.2, 0.4, 0.8, 1.0);
		this.setSpecular(0.2, 0.4, 0.8, 1.0);
		this.setShininess(10.0);
	}

  	display() {
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.updateProjectionMatrix();
		this.loadIdentity();

		this.applyViewMatrix();

		this.lights[0].update();
		this.lights[1].update();

		if (this.displayAxis) this.axis.display();

		this.setDefaultAppearance();

		this.sky.display();
		this.sun.display();
		this.clouds.display();
		this.terrain.display();
		this.grass.display();
		this.scatterElements.display();
		this.wagon.display();
  	}
}
