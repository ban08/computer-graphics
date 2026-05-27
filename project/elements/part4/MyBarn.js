import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyPlane } from '../../primitives/MyPlane.js';
import { MyRoofGable } from '../../primitives/MyRoofGable.js'; 

export class MyBarn extends CGFobject {
    constructor(scene,terrain) {
        super(scene);

        this.planeWalls = new MyPlane(scene, 10);
        this.planeWindow = new MyPlane(scene, 10);
        this.planeRoof = new MyPlane(scene, 10);
        this.roofGable = new MyRoofGable(scene);
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

        this.roof = new CGFappearance(this.scene);
        this.roof.setAmbient(0.4, 0.3, 0.2, 1);
        this.roof.setDiffuse(0.5, 0.4, 0.3, 1);
        this.roof.setSpecular(0.1, 0.1, 0.1, 1);
        this.roof.setShininess(5);
        this.roof.setTexture(new CGFtexture(this.scene, './textures/darkWoodTexture.png')); 
      
     
    }
displayRoof() {
        this.walls.apply();

        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0.5);
        this.roofGable.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, -0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.roofGable.display();
        this.scene.popMatrix();

        this.roof.apply();

       
        const seg1Scale = 0.1; 
        const seg2Angle = Math.atan(0.2 / 0.35); 
        const seg2Scale = Math.sqrt(0.35 * 0.35 + 0.2 * 0.2);
        const seg3Scale = 0.3; 

        // Plano Vertical Esquerdo
        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0.55, 0); 
        this.scene.rotate(-Math.PI / 2, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(seg1Scale, 1, 1);
        this.planeRoof.display();
        this.scene.popMatrix();

        // Plano Inclinado Esquerdo
        this.scene.pushMatrix();
        this.scene.translate(-0.325, 0.70, 0); 
        this.scene.rotate(seg2Angle, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(seg2Scale, 1, 1);
        this.planeRoof.display();
        this.scene.popMatrix();

        // Plano Superior (Topo)
        this.scene.pushMatrix();
        this.scene.translate(0, 0.80, 0); 
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(seg3Scale, 1, 1);
        this.planeRoof.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();
        this.scene.translate(0.325, 0.70, 0); 
        this.scene.rotate(-seg2Angle, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(seg2Scale, 1, 1);
        this.planeRoof.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0.5, 0.55, 0); 
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(seg1Scale, 1, 1);
        this.planeRoof.display();
        this.scene.popMatrix();
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
        this.scene.translate(0.25,0.4,0.501);
        this.scene.scale(0.2, 0.25, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-0.25,0.4,0.501);
        this.scene.scale(0.2, 0.25, 1);
        this.planeWindow.display();
        this.scene.popMatrix();

    }
    displayDoorFrame() {
        this.roof.apply();

        let frameZ = 0.502; 
        let frameThickness = 0.06; 
        //left
        this.scene.pushMatrix();
        this.scene.translate(-0.23, -0.2, frameZ);
        this.scene.scale(frameThickness, 0.6, 1);
        this.planeWalls.display();
        this.scene.popMatrix();

        //right
        this.scene.pushMatrix();
        this.scene.translate(0.23, -0.2, frameZ);
        this.scene.scale(frameThickness, 0.6, 1);
        this.planeWalls.display();
        this.scene.popMatrix();

        //top
        this.scene.pushMatrix();
        this.scene.translate(0, 0.13, frameZ);
        this.scene.scale(0.4 + (frameThickness * 2), frameThickness, 1);
        this.planeWalls.display();
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
        this.scene.scale(1, 1, 1); 
        this.planeWalls.display();
        this.scene.popMatrix();

        // LEFT
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(-Math.PI/2,0,1,0);
        this.scene.scale(1, 1, 1); 
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

   
        // BACK 
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.45);
        this.scene.scale(0.9, 1, 1);
        this.planeWalls.display();
        this.scene.popMatrix();

        // RIGHT 
        this.scene.pushMatrix();
        this.scene.translate(0.45, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.scene.scale(0.9, 1, 1);
        this.planeWalls.display();
        this.scene.popMatrix();

        // LEFT
        this.scene.pushMatrix();
        this.scene.translate(-0.45, 0, 0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(0.9, 1, 1);
        this.planeWalls.display();
        this.scene.popMatrix();

        // FLOOR
        this.scene.pushMatrix();
        this.scene.translate(0, -0.49, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(0.9, 0.9, 1);
        this.planeWalls.display();
        this.scene.popMatrix();

        // FRONT 
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.45); 
        this.scene.rotate(Math.PI, 0, 1, 0); 

        this.scene.pushMatrix();
        this.scene.translate(-0.325, 0, 0); 
        this.scene.scale(0.25, 1, 1);       
        this.planeWalls.display();
        this.scene.popMatrix();
    
        
        this.scene.pushMatrix();
        this.scene.translate(0.325, 0, 0);  
        this.scene.scale(0.25, 1, 1);       
        this.planeWalls.display();
        this.scene.popMatrix();
   
        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0);    
        this.scene.scale(0.4, 0.4, 1);  
        this.planeWalls.display();
        this.scene.popMatrix();

        this.scene.popMatrix();

      
    }

    display() {
        let z = -26;
        let x = Math.sin(z * 0.15) * 8.0 +  Math.cos(z * 0.05) * 4.0;
        this.scene.pushMatrix();

        this.scene.translate(x+4, 5, z+6);
        this.scene.rotate(-Math.PI/4, 0, 1, 0);

        this.scene.scale(8*0.6,5*0.6,6*0.6); // resize

        this.displayWalls();
        this.displayRoof();
        this.displayWindow();  
        this.displayDoorFrame(); 
        this.scene.popMatrix();
    }
}