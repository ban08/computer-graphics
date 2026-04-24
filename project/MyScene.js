import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MySky } from "./elements/part1/MySky.js";
import { MyClouds } from "./elements/part1/MyClouds.js";

/**
 * MyScene
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

    	// Background color
    	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

		this.gl.clearDepth(100.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);

		// Initialize scene objects
		this.axis = new CGFaxis(this);
		this.sky = new MySky(this);
		this.clouds = new MyClouds(this);

		// Time-driven shader animation (clouds, future grass/arrows)
		this.setUpdatePeriod(50);

		// Objects connected to MyInterface
    	this.displayAxis = true;
  	}

  	update(t) {
		this.clouds.update(t);
  	}

  	initLights() {
    	this.lights[0].setPosition(15, 2, 5, 1);
		this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
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
		// BEGIN Background, camera and axis setup

		// Clear image and depth buffer everytime we update the scene
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Initialize Model-View matrix as identity (no transformation
		this.updateProjectionMatrix();
		this.loadIdentity();

		// Apply transformations corresponding to the camera position relative to the origin
		this.applyViewMatrix();

		// Draw axis
		if (this.displayAxis) this.axis.display();

		this.setDefaultAppearance();

		// END Background, camera and axis setup

		// BEGIN Primitive drawing section

		this.sky.display();
		this.clouds.display();

		// END Primitive drawing section
  	}
}
