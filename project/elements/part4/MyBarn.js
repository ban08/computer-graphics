import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyPlane } from '../../primitives/MyPlane.js';

export class MyBarn extends CGFobject {
    constructor(scene,terrain) {
        super(scene);

        this.planeWalls = new MyPlane(scene, 10, 0, 3, 0, 3);
        this.planeWindow = new MyPlane(scene, 10);
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

        this.window = new CGFappearance(this.scene);
        this.window.setAmbient(0.6, 0.6, 0.6, 1);
        this.window.setDiffuse(0.8, 0.8, 0.8, 1);
        this.window.setSpecular(0.8, 0.8, 0.8, 1);
        this.window.setShininess(50);
        this.window.setTexture(new CGFtexture(this.scene, './textures/barnWindow.png'));
        this.window.setTextureWrap('REPEAT', 'REPEAT');
     
    }
    displayWindow() {
       
        this.window.apply();

         //left window
        this.scene.pushMatrix();
        this.scene.translate(-0.501,0,0);
        this.scene.rotate(-Math.PI/2,0,1,0);
        this.scene.scale(0.25, 0.5, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

        //right window
        this.scene.pushMatrix();
        this.scene.translate(0.501,0,0);
        this.scene.rotate(Math.PI/2,0,1,0);
        this.scene.scale(0.25, 0.5, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

        //back windows
        this.scene.pushMatrix();
        this.scene.translate(0.25,0,-0.501);
        this.scene.rotate(Math.PI,0,1,0);
        this.scene.scale(0.25, 0.5, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-0.25,0,-0.501);
        this.scene.rotate(Math.PI,0,1,0);
        this.scene.scale(0.25, 0.5, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

        //front windows
        this.scene.pushMatrix();
        this.scene.translate(0.25,0.3,0.501);
        this.scene.scale(0.2, 0.25, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-0.25,0.3,0.501);
        this.scene.scale(0.2, 0.25, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

    }

    displayWalls() {
        this.walls.apply();

        // FRONT
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5); 

        this.scene.pushMatrix();
        this.scene.translate(-0.35, 0, 0); 
        this.scene.scale(0.3, 1, 1);       
        this.planeWalls.display();
        this.scene.popMatrix();
    
        this.scene.pushMatrix();
        this.scene.translate(0.35, 0, 0);  
        this.scene.scale(0.3, 1, 1);       
        this.planeWalls.display();
        this.scene.popMatrix();
    
        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0);    
        this.scene.scale(0.4, 0.4, 1);  
        this.planeWalls.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
        
        // BACK
        this.scene.pushMatrix();
        this.scene.translate(0,0,-0.5);
        this.scene.rotate(Math.PI,0,1,0);
        this.planeWalls.display();
        this.scene.popMatrix();

        // RIGHT
        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2,0,1,0);
        this.planeWalls.display();
        this.scene.popMatrix();

        // LEFT
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(-Math.PI/2,0,1,0);
        this.planeWalls.display();
        this.scene.popMatrix();
        // TOP
        this.scene.pushMatrix();
        this.scene.translate(0,0.5,0);
        this.scene.rotate(-Math.PI/2,1,0,0);
        this.planeWalls.display();
        this.scene.popMatrix();

        // BOTTOM
        this.scene.pushMatrix();
        this.scene.translate(0,-0.5,0);
        this.scene.rotate(Math.PI/2,1,0,0);
        this.planeWalls.display();
        this.scene.popMatrix();
    }


    display() {
        let z = -26;
        let x = Math.sin(z * 0.15) * 8.0 +  Math.cos(z * 0.05) * 4.0;
        this.scene.pushMatrix();

        this.scene.translate(x+4, 5, z+6);
        this.scene.rotate(-Math.PI/4, 0, 1, 0);

        this.scene.scale(8,5,6);

        this.displayWalls();

        this.displayWindow();   
        this.scene.popMatrix();
    }
}