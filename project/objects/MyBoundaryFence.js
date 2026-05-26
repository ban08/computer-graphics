import { CGFobject, CGFappearance, CGFtexture } from '../../lib/CGF.js';
import { MyTexturedBox } from '../primitives/MyTexturedBox.js';

/**
 * MyBoundaryFence
 * @constructor
 * @param scene - Reference to MyScene object
 * @param terrain - Terrain used to position the fence on the ground
 * @param segments - Number of fence sections around the terrain boundary
 * @param postHeight - Height of each fence post
 */
export class MyBoundaryFence extends CGFobject {
    constructor(scene, terrain, segments, postHeight) {
        super(scene);

        this.terrain = terrain;
        this.segments = segments ?? 36;
        this.postHeight = postHeight ?? 1.15;

        this.radius = 30.0;
        this.railHeights = [this.postHeight * 0.33, this.postHeight * 0.68];
        this.step = Math.PI * 2 / this.segments;
        this.span = 2 * this.radius * Math.sin(this.step / 2);
        
        this.post = new MyTexturedBox(scene, 0.16, this.postHeight, 0.16, 0.40);
        this.rail = new MyTexturedBox(scene, this.span + 0.16, 0.10, 0.10, 0.50);

        this.texture = new CGFtexture(scene, '/project/textures/wagonWood.svg');
        
        this.wood = new CGFappearance(scene);
        this.wood.setDiffuse(0.55, 0.31, 0.14, 1);
        this.wood.setTexture(this.texture);
        this.wood.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.wood.apply();

        for (let i = 0; i < this.segments; i++) {
            const angle = i * this.step;

            const x = this.radius * Math.cos(angle);
            const z = this.radius * Math.sin(angle);
            const y = this.terrain.getHeightAt(x, z);

            const nextX = this.radius * Math.cos(angle + this.step);
            const nextZ = this.radius * Math.sin(angle + this.step);
            const nextY = this.terrain.getHeightAt(nextX, nextZ);

            this.scene.pushMatrix();

            this.scene.translate(x, y + this.postHeight / 2, z);

            this.post.display();

            this.scene.popMatrix();

            const rise = nextY - y;
            const slope = Math.atan2(rise, this.span);
            const lengthScale = Math.hypot(this.span, rise) / this.span;

            for (const height of this.railHeights) {
                this.scene.pushMatrix();

                this.scene.translate((x + nextX) / 2, (y + nextY) / 2 + height, (z + nextZ) / 2);
                this.scene.rotate(-angle - this.step / 2 - Math.PI / 2, 0, 1, 0);
                this.scene.rotate(slope, 0, 0, 1);
                this.scene.scale(lengthScale, 1, 1);

                this.rail.display();
                
                this.scene.popMatrix();
            }
        }

        this.scene.setDefaultAppearance();
    }
}
