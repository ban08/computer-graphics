import { CGFobject, CGFtexture } from '../../../lib/CGF.js';
import { MyRock } from '../../objects/MyRock.js';
import { PlacementGenerator } from '../../utils/PlacementProceduralGenerator.js';

/**
 * MyScatterElements
 * @constructor
 * @param scene - Reference to MyScene object
 * @param terrain - Terrain used to place objects at the correct height and radius
 */
export class MyScatterElements extends CGFobject {
    constructor(scene, terrain) {
        super(scene);

        this.terrain = terrain;
        this.rockTextures = [
            new CGFtexture(scene, '/project/textures/rockTextureOne.png'),
            new CGFtexture(scene, '/project/textures/rockTextureTwo.png'),
            new CGFtexture(scene, '/project/textures/rockTextureThree.png'),
        ];
        this.placements = [];

        this.generateRocks();
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomRockTexture() {
        return this.rockTextures[Math.floor(Math.random() * this.rockTextures.length)];
    }

    generateRocks() {
        const keepAwayFromCenter = (x, z) => {
            const awayFromSceneCenter = Math.sqrt(x * x + z * z) > 3.0;
            const awayFromStarterWagon = Math.hypot(x - 8.0, z - 6.2) > 5.7;
            const awayFromPathway = !this.terrain.isPointOnPath(x, z);
            const barnBaseZ = -26;
            const barnX = (Math.sin(barnBaseZ * 0.15) * 8.0) + (Math.cos(barnBaseZ * 0.05) * 4.0) + 4.0;
            const barnZ = barnBaseZ + 6.0; 
            const awayFromBarn = Math.hypot(x - barnX, z - barnZ) > 6.0; 
            
            if (!awayFromSceneCenter || !awayFromStarterWagon || !awayFromPathway || !awayFromBarn) {
            return false;
            }
            return true;
        };

        const createRockPlacement = (placement) => {
            const scale = [
                this.randomRange(0.20, 0.75),
                this.randomRange(0.10, 0.35),
                this.randomRange(0.20, 0.75),
            ];
            const horizontalRadius = Math.max(scale[0], scale[2]) * 1.25;

            return {
                x: placement.x,
                y: placement.y,
                z: placement.z,
                collisionRadius: horizontalRadius + 0.18,
                rotation: this.randomRange(0, Math.PI * 2),
                rock: new MyRock(
                    this.scene,
                    null,
                    [0.34, 0.32, 0.29, 1.0],
                    0.25,
                    scale,
                    1.0,
                    14,
                    8,
                    this.randomRockTexture()
                ),
            };
        };

        const generator = new PlacementGenerator(
            0,
            0,
            this.terrain.maxRadius * 0.95,
            (x, z) => this.terrain.getHeightAt(x, z)
        );

        this.placements = generator.generatePlacements(
            6.0,
            10,
            keepAwayFromCenter,
            createRockPlacement
        );
    }

    display() {
        for (const placement of this.placements) {
            this.scene.pushMatrix();

            this.scene.translate(placement.x, placement.y, placement.z);
            this.scene.rotate(placement.rotation, 0, 1, 0);

            placement.rock.display();
            
            this.scene.popMatrix();
        }
    }

    getCollisionObstacles() {
        return this.placements.map((placement) => ({
            x: placement.x,
            z: placement.z,
            radius: placement.collisionRadius,
            type: 'rock',
        }));
    }
}
