import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyTwoSidedPlane } from '../../primitives/MyTwoSidedPlane.js';
import { MyRoofGable } from '../../primitives/MyRoofGable.js'; 
import { MyRing } from '../../primitives/MyRing.js';

/**
 * MyBarn
 * @constructor
 * @param scene - Reference to MyScene object
 * @param terrain - Terrain used to place the barn
 */
export class MyBarn extends CGFobject {
    // --- constructor
    
    constructor(scene, terrain) {
        super(scene);

        this.terrain = terrain;

        this.planeWalls = new MyTwoSidedPlane(scene, 10);
        this.planeWindow = new MyTwoSidedPlane(scene, 10);
        this.planeRoof = new MyTwoSidedPlane(scene, 10);
        this.roofGable = new MyRoofGable(scene);
        this.ring = new MyRing(scene, 30, 1, 1.05);

        this.x = 10.5;
        this.z = -20;
        this.rotation = -Math.PI / 4;

        this.scaleFactor = 0.6;

        this.bodyWidth = 8 * this.scaleFactor;
        this.bodyHeight = 5 * this.scaleFactor;
        this.bodyDepth = 6 * this.scaleFactor;

        this.wagonInDeliveryArea = false;
        this.deliveryAreaScale = 5;
        this.deliveryAreaRadius = this.deliveryAreaScale * this.ring.outerRadius;

        this.initMaterials();
    }

    // --- misc

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

        this.ringMaterialRed = new CGFappearance(this.scene);
        this.ringMaterialRed.setAmbient(0.2, 0.0, 0.0, 1);
        this.ringMaterialRed.setDiffuse(1.0, 0.0, 0.0, 1);  
        this.ringMaterialRed.setSpecular(0.2, 0.0, 0.0, 1);
        this.ringMaterialRed.setShininess(100);

        this.ringMaterialGreen = new CGFappearance(this.scene);
        this.ringMaterialGreen.setAmbient(0.0, 0.3, 0.0, 1);
        this.ringMaterialGreen.setDiffuse(0.0, 1.0, 0.0, 1);
        this.ringMaterialGreen.setSpecular(0.0, 0.2, 0.0, 1);
        this.ringMaterialGreen.setShininess(100);

        this.doorMaterial = new CGFappearance(this.scene);
        this.doorMaterial.setAmbient(0.4, 0.2, 0.1, 1);
        this.doorMaterial.setDiffuse(0.5, 0.3, 0.2, 1);
        this.doorMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.doorMaterial.setShininess(5);
        this.doorMaterial.setTexture(new CGFtexture(this.scene, './textures/doorTexture.png')); 
        this.doorMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    // --- displayers

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
        this.planeWalls.display();
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
        
       

        //DOOR
        this.doorMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, -0.2, 0.502);
        this.scene.scale(0.4, 0.6, 1);
        this.planeWalls.display();
        this.scene.popMatrix();
      
    }

    displayRing() {

        if (this.wagonInDeliveryArea) {
            this.ringMaterialGreen.apply();  
        } else {
            this.ringMaterialRed.apply();    
        }

        this.scene.pushMatrix();
        
        this.scene.translate(0, -1.45, 0); 
        this.scene.scale(this.deliveryAreaScale, 1.2, this.deliveryAreaScale);
        this.ring.display();
        this.scene.popMatrix();
    }

    display() {
        let terrainHeight = this.terrain ? this.terrain.getHeightAt(this.x, this.z) : 0;
        let correctY = terrainHeight + 1.6;

        this.scene.pushMatrix();

        this.scene.translate(this.x, correctY, this.z);
        this.scene.rotate(this.rotation, 0, 1, 0);
        this.displayRing();

        this.scene.scale(this.bodyWidth, this.bodyHeight, this.bodyDepth); 

        this.displayWalls();
        this.displayRoof();
        this.displayWindow();  
        this.displayDoorFrame(); 
        this.scene.popMatrix();
    }

    // --- exposed getters

    isPointInDeliveryArea(x, z) {
        return Math.hypot(x - this.x, z - this.z) <= this.deliveryAreaRadius;
    }

    getCollisionBox() {
        return {
            x: this.x,
            z: this.z,
            width: this.bodyWidth,
            depth: this.bodyDepth,
            rotation: this.rotation,
        };
    }

    // --- exposed setters

    setWagonInDeliveryArea(inside) {
        this.wagonInDeliveryArea = inside;
    }
}
