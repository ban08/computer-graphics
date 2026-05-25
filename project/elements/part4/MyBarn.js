import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyPlane } from '../../primitives/MyPlane.js';

export class MyBarn extends CGFobject {
    constructor(scene,terrain) {
        super(scene);

        this.plane = new MyPlane(scene, 1); 
        this.terrain = terrain;

        this.initMaterials();
    }

    initMaterials() {
        
        this.walls = new CGFappearance(this.scene);
        this.walls.setAmbient(0.8, 0.8, 0.8, 1);
        this.walls.setDiffuse(0.9, 0.9, 0.9, 1);
        this.walls.setSpecular(0.1, 0.1, 0.1, 1);
        this.walls.setShininess(10);
        this.walls.setTexture(new CGFtexture(this.scene, './textures/barnWalls.png'));
        this.walls.setTextureWrap('REPEAT', 'REPEAT');

     
    }

    displayWalls() {

        // FRONT
        this.scene.pushMatrix();
        this.scene.translate(0,0,0.5);
        this.plane.display();
        this.scene.popMatrix();

        // BACK
        this.scene.pushMatrix();
        this.scene.translate(0,0,-0.5);
        this.scene.rotate(Math.PI,0,1,0);
        this.plane.display();
        this.scene.popMatrix();

        // RIGHT
        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2,0,1,0);
        this.plane.display();
        this.scene.popMatrix();

        // LEFT
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(-Math.PI/2,0,1,0);
        this.plane.display();
        this.scene.popMatrix();
    }

    displayTopBottom() {

        // TOP
        this.scene.pushMatrix();
        this.scene.translate(0,0.5,0);
        this.scene.rotate(-Math.PI/2,1,0,0);
        this.plane.display();
        this.scene.popMatrix();

        // BOTTOM
        this.scene.pushMatrix();
        this.scene.translate(0,-0.5,0);
        this.scene.rotate(Math.PI/2,1,0,0);
        this.plane.display();
        this.scene.popMatrix();
    }

    display() {

        this.walls.apply();
        let z = -26;
        let x = Math.sin(z * 0.15) * 8.0 +  Math.cos(z * 0.05) * 4.0;
        this.scene.pushMatrix();

        this.scene.translate(x+4, 5, z+6);
        this.scene.rotate(-Math.PI/4, 0, 1, 0);

        this.scene.scale(8,5,6);

        this.displayWalls();
        this.displayTopBottom();
        this.scene.popMatrix();
    }
}