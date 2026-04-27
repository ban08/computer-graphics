import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MySky } from "./elements/part1/MySky.js";
import { MyClouds } from "./elements/part1/MyClouds.js";
import { MySun } from "./elements/part1/MySun.js";
import { MyTerrain } from "./elements/part2/MyTerrain.js";

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

		this.axis = new CGFaxis(this);
		this.sky = new MySky(this);
		this.clouds = new MyClouds(this);
		this.sun = new MySun(this);
		this.terrain = new MyTerrain(this);

		this.setUpdatePeriod(50);

    	this.displayAxis = true;
  	}

  	update(t) {
		this.clouds.update(t);
		this.sun.update(t);		
		this.lights[0].setPosition(this.sun.sunX, this.sun.sunY, this.sun.z, 1);
        this.lights[0].update();
        this.terrain.updateSunDir(this.sun.sunX, this.sun.sunY, this.sun.z);
  	}

  	initLights() {
    	this.lights[0].setPosition(15, 2, 5, 1);
		this.lights[0].setDiffuse(1.0, 1.0, 0.9, 1.0);
        this.lights[0].setSpecular(0.8, 0.8, 0.6, 1.0);
        this.lights[0].setAmbient(0.05, 0.05, 0.05, 1.0);
		this.lights[0].enable();
		this.lights[0].update();
  	}

  	initCameras() {
    	this.camera = new CGFcamera(
      		0.4,
      		0.1,
      		500,
      		vec3.fromValues(15, 15, 15),
      		vec3.fromValues(0, 0, 0)
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

		if (this.displayAxis) this.axis.display();

		this.setDefaultAppearance();

		this.sky.display();
		this.clouds.display();
		this.sun.display();
		this.terrain.display();
  	}
}
