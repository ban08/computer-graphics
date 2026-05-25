import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyTexturedBox } from '../../primitives/MyTexturedBox.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';

/**
 * MyHayBales
 * Class strictly responsible for the independent procedural placement of hay bales.
 */
export class MyHayBales extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to the main scene
     * @param {Object} terrain - Reference to MyTerrain object
     */
    constructor(scene, terrain) {
        super(scene);

        this.scene = scene;
        this.terrain = terrain;
        this.placements = [];


        this.bale = new MyTexturedBox(this.scene, 0.62, 0.34, 0.50, 0.28);
        this.baleBandX = new MyTexturedBox(this.scene, 0.68, 0.04, 0.055, 0.20);
        this.baleBandZ = new MyTexturedBox(this.scene, 0.055, 0.04, 0.56, 0.20);


        this.initMaterials();


        this.generateBalePlacements();
    }

    initMaterials() {
     
        this.hay = new CGFappearance(this.scene);
        this.hay.setAmbient(0.70, 0.50, 0.18, 1);
        this.hay.setDiffuse(0.95, 0.72, 0.28, 1);
        this.hay.setSpecular(0.10, 0.08, 0.03, 1);
        this.hay.setShininess(6);
        this.hay.setTexture(new CGFtexture(this.scene, './textures/wagonHay.svg'));
        this.hay.setTextureWrap('REPEAT', 'REPEAT');

 
        this.leather = new CGFappearance(this.scene);
        this.leather.setAmbient(0.20, 0.10, 0.05, 1);
        this.leather.setDiffuse(0.34, 0.18, 0.09, 1);
        this.leather.setSpecular(0.16, 0.08, 0.04, 1);
        this.leather.setShininess(22);
        this.leather.setTexture(new CGFtexture(this.scene, './textures/wagonLeather.svg'));
        this.leather.setTextureWrap('REPEAT', 'REPEAT');
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }


   generateBalePlacements() {
    this.placements = [];

    const keepAwayFromCenter = (x, z) => {
        const awayFromSceneCenter = Math.sqrt(x * x + z * z) > 4.0;
        const awayFromStarterWagon = Math.hypot(x - 8.0, z - 6.2) > 6.0;
        const awayFromPathway = !this.terrain.isPointOnPath(x, z);
        
        return awayFromSceneCenter && awayFromStarterWagon && awayFromPathway;
    };

    const maxRadius = this.terrain.maxRadius * 0.85; 
    const minDistanceBetweenBales = 18.0;      
    const targetCount = 5;   //numero de fardos alterar se necessário                    
    let totalAttempts = 0;


    while (this.placements.length < targetCount && totalAttempts < 500) {
        totalAttempts++;

      
        const radius = Math.sqrt(Math.random()) * maxRadius;
        const angle = Math.random() * Math.PI * 2;
        
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        if (!keepAwayFromCenter(x, z)) continue;

   
        let tooCloseToOthers = false;
        for (const p of this.placements) {
            if (Math.hypot(x - p.x, z - p.z) < minDistanceBetweenBales) {
                tooCloseToOthers = true;
                break;
            }
        }

        if (tooCloseToOthers) continue;


        const y = this.terrain.getHeightAt ? this.terrain.getHeightAt(x, z) : 0.0;

        this.placements.push({
            x: x,
            y: y,
            z: z,
            rotation: this.randomRange(0, Math.PI * 2)
        });
    }
}

    drawAt(object, x, y, z) {
        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        object.display();
        this.scene.popMatrix();
    }


    display() {
        for (const placement of this.placements) {
            this.scene.pushMatrix();

            this.scene.translate(placement.x, placement.y + 0.17, placement.z);
            this.scene.rotate(placement.rotation, 0, 1, 0);

            this.hay.apply();
            this.bale.display();

            this.leather.apply();
            this.drawAt(this.baleBandX, 0, 0.18, -0.14);
            this.drawAt(this.baleBandX, 0, 0.18, 0.14);
            this.drawAt(this.baleBandZ, -0.17, 0.19, 0);
            this.drawAt(this.baleBandZ, 0.17, 0.19, 0);

            this.scene.popMatrix();
        }
    }
}