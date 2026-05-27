import { CGFobject, CGFtexture, CGFshader } from '../../../lib/CGF.js';
import { MyRock } from '../../objects/MyRock.js';
import { MyPlane } from '../../primitives/MyPlane.js';
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

        this.currentTime = 0;
        this.dustDuration = 850;
        this.respawnDelay = 10000;
        this.dustPlane = new MyPlane(scene, 1, 0, 1, 0, 1);
        this.dustShader = new CGFshader(
            scene.gl,
            'shaders/dust/dust.vert',
            'shaders/dust/dust.frag'
        );
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomRockTexture() {
        return this.rockTextures[Math.floor(Math.random() * this.rockTextures.length)];
    }

    generateRocks() {
        const isValidPlacement = (x, z) => {
            const awayFromStarterWagon = Math.hypot(x - 2.7, z - 21.6) > 6.0;
            const awayFromPathway = !this.terrain.isPointOnPath(x, z);
            return awayFromStarterWagon && awayFromPathway;
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
                impactTime: null,
                dustTime: null,
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
            27.5,
            (x, z) => this.terrain.getHeightAt(x, z)
        );

        this.placements = generator.generatePlacements(
            6.0,
            10,
            isValidPlacement,
            createRockPlacement
        );
    }

    impactRock(placement, t) {
        placement.impactTime = t;
        placement.dustTime = t;
    }

    update(t) {
        this.currentTime = t;

        for (const placement of this.placements) {
            if (placement.impactTime !== null && t - placement.impactTime >= this.respawnDelay) {
                placement.impactTime = null;
                placement.dustTime = t;
            }

            if (placement.dustTime !== null && t - placement.dustTime >= this.dustDuration) {
                placement.dustTime = null;
            }
        }
    }

    getCollisionObstacles() {
        return this.placements.map((placement) => ({
            x: placement.x,
            z: placement.z,
            radius: placement.collisionRadius,
            type: 'rock',
            isActive: () => placement.impactTime === null,
            onImpact: (time) => this.impactRock(placement, time),
        }));
    }

    displayDust(placement) {
        const age = this.currentTime - placement.dustTime;
        const progress = age / this.dustDuration;
        const size = (placement.collisionRadius + 0.4) * (1.3 + progress * 1.7);
        const y = placement.y + 0.2 + progress * 0.3;
        const camera = this.scene.camera.position;
        const dx = camera[0] - placement.x;
        const dz = camera[2] - placement.z;

        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        this.scene.gl.depthMask(false);

        this.dustShader.setUniformsValues({ progress });
        this.scene.setActiveShader(this.dustShader);

        this.scene.pushMatrix();

        this.scene.translate(placement.x, y, placement.z);
        this.scene.rotate(Math.atan2(dx, dz), 0, 1, 0);
        this.scene.rotate(-Math.atan2(camera[1] - y, Math.hypot(dx, dz)), 1, 0, 0);
        this.scene.scale(size, size * 0.78, 1.0);

        this.dustPlane.display();

        this.scene.popMatrix();

        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.gl.depthMask(true);
        this.scene.gl.disable(this.scene.gl.BLEND);
    }

    display() {
        for (const placement of this.placements) {
            if (placement.impactTime !== null) {
                if (placement.dustTime !== null) {
                    this.displayDust(placement);
                }
                continue;
            }


            if (placement.dustTime !== null) {
                this.displayDust(placement);
            }

            this.scene.pushMatrix();

            this.scene.translate(placement.x, placement.y, placement.z);
            this.scene.rotate(placement.rotation, 0, 1, 0);

            placement.rock.display();

            this.scene.popMatrix();
        }
    }
}
