import { CGFobject } from '../../../lib/CGF.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';
import { MyHayBale } from '../../objects/MyHayBale.js';

/**
 * MyHayBales
 * Class strictly responsible for the independent procedural placement of hay bales.
 */
export class MyHayBales extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to the main scene
     * @param {Object} terrain - Reference to MyTerrain object
     * * @param {Object} flowers - Reference to the instantiated MyFlowers object
     * @param {Object} rocks - Reference to the instantiated MyScatterElements object
    
     */
    constructor(scene, terrain,flowers,rocks) {
        super(scene);

        this.scene = scene;
        this.terrain = terrain;
        this.flowers = flowers;
        this.rocks = rocks;
        this.placements = [];
        this.bale = new MyHayBale(this.scene);


        this.generateBalePlacements();
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
        
    if (!awayFromSceneCenter || !awayFromStarterWagon || !awayFromPathway) {
                return false;
    }
 
    if (this.rocks && this.rocks.placements) {
        for (const rock of this.rocks.placements) {
            const distanceToRock = Math.hypot(x - rock.x, z - rock.z);
            if (distanceToRock < (rock.collisionRadius + 1.2)) {
                return false; 
            }
        }
    }
    if (this.flowers && this.flowers.placements) {
        for (const flower of this.flowers.placements) {
            const distanceToFlower = Math.hypot(x - flower.x, z - flower.z);
            if (distanceToFlower < 1.5) {
                return false; 
            }
        }
    }
    return true;
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

    display() {
        for (const placement of this.placements) {
            this.scene.pushMatrix();

            this.scene.translate(placement.x, placement.y + 0.17, placement.z);
            this.scene.rotate(placement.rotation, 0, 1, 0);

            this.bale.display();


            this.scene.popMatrix();
        }
    }
}