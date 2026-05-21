import { CGFobject, CGFshader } from '../../lib/CGF.js';
import { MyGrass } from './MyGrass.js';
import { MyGrassSet } from './MyGrassSet.js';

export class MyGrassField extends CGFobject {
    constructor(scene, terrain, density = 150) {
        super(scene);

        this.scene = scene;
        this.terrain = terrain;

        this.grass = new MyGrass(scene);

        this.patches = [];

        this.shader = new CGFshader(
            scene.gl,
            'shaders/grass/grass.vert',
            'shaders/grass/grass.frag'
        );

        this.shader.setUniformsValues({
            time: 0
        });

        this.generate(density);
    }

    generate(density) {

        const size = this.terrain.size ?? 64;

        for (let i = 0; i < density; i++) {

            const x = (Math.random() - 0.5) * size;
            const z = (Math.random() - 0.5) * size;

            const y = this.terrain.getHeightAt(x, z);

       
            if (y <= 0) continue;
            if (y > this.terrain.heightScale * 0.65) continue;

            this.patches.push({
                x,
                y,
                z,
                rot: Math.random() * Math.PI * 2,
                scale: 0.9 + Math.random() * 0.8,
                set: new MyGrassSet(this.scene, this.grass)
            });
        }
    }

    update(t) {
        this.shader.setUniformsValues({
            time: t / 1000
        });
    }

    display() {

        this.scene.setActiveShader(this.shader);

        for (const p of this.patches) {

            this.scene.pushMatrix();

            this.scene.translate(p.x, p.y, p.z);
            this.scene.rotate(p.rot, 0, 1, 0);
            this.scene.scale(p.scale, p.scale, p.scale);

            p.set.display();

            this.scene.popMatrix();
        }

        this.scene.setActiveShader(this.scene.defaultShader);
    }
}