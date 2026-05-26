import { CGFobject } from '../../../lib/CGF.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';
import { MyHayBale } from '../../objects/MyHayBale.js';
import { MyPinpointArrow } from '../../objects/MyPinpointArrow.js';

/**
 * MyHayBales
 * Manages hay bales currently placed in the world, including dropped cargo.
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
        this.arrow = new MyPinpointArrow(this.scene);


        this.generateBalePlacements();
    }


    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }


   generateBalePlacements() {
    const isValidPlacement = (x, z) => {
        const awayFromStarterWagon = Math.hypot(x - 2.0, z - 21.0) > 6.0;
        const awayFromPathway = !this.terrain.isPointOnPath(x, z);
        
    if (!awayFromStarterWagon || !awayFromPathway) {
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
    const minDistanceBetweenBales = 8.0;
    const targetCount = 5;   //numero de fardos alterar se necessário                    
    let totalAttempts = 0;


    while (this.placements.length < targetCount && totalAttempts < 500) {
        totalAttempts++;

      
        const radius = Math.sqrt(Math.random()) * maxRadius;
        const angle = Math.random() * Math.PI * 2;
        
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        if (!isValidPlacement(x, z)) continue;

   
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

    collectBale(index) {
        this.placements.splice(index, 1);
        this.generateBalePlacements();
    }

    dropBale(x, z) {
        const y = this.terrain.getHeightAt(x, z);

        this.placements.push({
            x,
            y,
            z,
            rotation: this.randomRange(0, Math.PI * 2)
        });
    }

    getPickupTargets() {
        return this.placements.map((placement, index) => ({
            x: placement.x,
            z: placement.z,
            onPickup: () => this.collectBale(index)
        }));
    }

    update(t) {
        this.arrow.update(t);
    }

    display() {
        for (let i = 0; i < this.placements.length; i++) {
            const placement = this.placements[i];
            this.scene.pushMatrix();

            this.scene.translate(placement.x, placement.y + 0.17, placement.z);
            this.scene.rotate(placement.rotation, 0, 1, 0);

            this.bale.display();


            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.translate(placement.x, placement.y + 2.05, placement.z);
            this.scene.scale(0.85, 0.85, 0.85);
            this.arrow.display(i * 1.31);
            this.scene.popMatrix();
        }
    }
}
