import { CGFobject } from '../../../lib/CGF.js';
import { MyFlower } from '../../objects/MyFlower.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';

/**
 * MyFlowers
 * @constructor
 * @param scene - Reference to MyScene object
 * @param terrain - Terrain used to place flowers at the correct height and radius
 */
export class MyFlowers extends CGFobject {
    constructor(scene, terrain) {
        super(scene);

        this.terrain = terrain;
        this.placements = [];

        this.generateFlowers();
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomPetalColor() {
        const colors = [
            [0.92, 0.28, 0.42, 1.0],
            [0.98, 0.78, 0.24, 1.0],
            [0.74, 0.36, 0.86, 1.0],
            [0.95, 0.50, 0.18, 1.0],
            [0.96, 0.84, 0.92, 1.0],
        ];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateFlowers() {
        const isValidPlacement = (x, z) => {
            const awayFromStarterWagon = Math.hypot(x - 2.7, z - 21.6) > 6.0;
            const awayFromPathway = !this.terrain.isPointOnPath(x, z);
            return awayFromStarterWagon && awayFromPathway;
        };

        const createFlowerPlacement = (placement) => ({
            x: placement.x,
            y: placement.y,
            z: placement.z,
            rotation: this.randomRange(0, Math.PI * 2),
            flower: new MyFlower(this.scene, {
                scale: this.randomRange(0.25, 0.6),
                stemHeight: this.randomRange(0.45, 0.85),
                petalCount: Math.floor(this.randomRange(5, 10)),
                leafCount: Math.floor(this.randomRange(1, 4)),
                petalColor: this.randomPetalColor(),
            }),
        });

        const generator = new PlacementGenerator(
            0,
            0,
            27.5,
            (x, z) => this.terrain.getHeightAt(x, z)
        );

        this.placements = generator.generatePlacements(
            3.0,
            10,
            isValidPlacement,
            createFlowerPlacement
        );
    }

    display() {
        for (const placement of this.placements) {
            this.scene.pushMatrix();

            this.scene.translate(placement.x, placement.y, placement.z);
            this.scene.rotate(placement.rotation, 0, 1, 0);

            placement.flower.display();

            this.scene.popMatrix();
        }
    }
}
