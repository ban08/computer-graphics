import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyPlane } from '../../primitives/MyPlane.js';
import { MyRoofGable } from '../../primitives/MyRoofGable.js'; 
import { MyRing } from '../../primitives/MyRing.js';

export class MyBarn extends CGFobject {
    constructor(scene, terrain) {
        super(scene);

        this.terrain = terrain;

        this.planeWalls = new MyPlane(scene, 10);
        this.planeWindow = new MyPlane(scene, 10);
        this.planeRoof = new MyPlane(scene, 10);
        this.roofGable = new MyRoofGable(scene);
        this.terrain = terrain;
        this.ring = new MyRing(scene, 30, 1,1.05);
        this.initMaterials();
    }

    initMaterials() {
        this.wall = new CGFappearance(this.scene);
        this.wall.setAmbient(0.8, 0.8, 0.8, 1);
        this.wall.setDiffuse(0.9, 0.9, 0.9, 1);
        this.wall.setSpecular(0.1, 0.1, 0.1, 1);
        this.wall.setShininess(10);
        this.wall.setTexture(new CGFtexture(this.scene, './textures/barnWalls.png'));
        this.wall.setTextureWrap('REPEAT', 'REPEAT');

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
        this.roof.setTextureWrap('REPEAT', 'REPEAT');

        this.ringMaterial = new CGFappearance(this.scene);
        this.ringMaterial.setAmbient(0.2, 0.0, 0.0, 1);
        this.ringMaterial.setDiffuse(1.0, 0.0, 0.0, 1);  
        this.ringMaterial.setSpecular(0.2, 0.0, 0.0, 1);
        this.ringMaterial.setShininess(100);
    }

    displayRoof() {
        this.wall.apply();

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
        this.wall.apply();

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
    displayRing() {
        this.ringMaterial.apply();
        this.scene.pushMatrix();
        
        this.scene.translate(0, -1.45, 0); 
        this.scene.scale(3.5*1.2, 1.2, 3.5*1.2);        
        this.ring.display();
        this.scene.popMatrix();
    }

    display() {
        let z = -26;
        let x = Math.sin(z * 0.15) * 8.0 +  Math.cos(z * 0.05) * 4.0;
        
        let worldX = x + 4;
        let worldZ = z + 6;

        let terrainHeight = this.terrain ? this.terrain.getHeightAt(worldX, worldZ) : 0;

        let correctY = terrainHeight + 1.6;

        this.scene.pushMatrix();

        this.scene.translate(worldX, correctY, worldZ);
        this.scene.rotate(-Math.PI/4, 0, 1, 0);
        this.displayRing();

        this.scene.scale(8*0.6, 5*0.6, 6*0.6); 

        this.displayWalls();
        this.displayRoof();
        this.displayWindow();  
        this.displayDoorFrame(); 
        this.scene.popMatrix();
    }
}
