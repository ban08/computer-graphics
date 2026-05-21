import { CGFobject } from '../../lib/CGF.js';
import { MyGrass } from './MyGrass.js';

export class MyGrassSet extends CGFobject {
    constructor(scene, grass) {
        super(scene);

        this.grass = grass;
        this.blades = [];

        this.generate();
    }

    generate() {
       
        const count = 10 + Math.floor(Math.random() * 20);

        for (let i = 0; i < count; i++) {

            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.35; 

            this.blades.push({
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                rot: Math.random() * Math.PI * 2,
                scale: 0.5 + Math.random() * 0.9
            });
        }
    }

    display() {
        for (const b of this.blades) {

            this.scene.pushMatrix();

            // ligeiro espalhamento orgânico
            this.scene.translate(b.x, 0, b.z);
            this.scene.rotate(b.rot, 0, 1, 0);
            this.scene.scale(b.scale, b.scale, b.scale);

            this.grass.display();

            this.scene.popMatrix();
        }
    }
}