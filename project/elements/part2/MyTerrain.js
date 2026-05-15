import { CGFobject, CGFtexture, CGFshader } from '../../../lib/CGF.js';
import { MyPlane } from '../../primitives/MyPlane.js';

const SHARED_FRAG_UNIFORMS = {
    lowColor:  [0.18, 0.30, 0.13],
    midColor:  [0.35, 0.50, 0.22],
    highColor: [0.65, 0.65, 0.40],
    sunDir:    [0.4, 0.4, 0.85],
    ambient:   0.35,
};

/**
 * MyTerrain
 * @constructor
 * @param scene - Reference to MyScene object
 * @param size - Side length of the terrain plane
 * @param divisions - Number of terrain plane subdivisions
 */
export class MyTerrain extends CGFobject {
    constructor(scene, size = 64, divisions = 128) {
        super(scene);

        this.size = size;
        this.divisions = divisions;
        this.plane = new MyPlane(scene, divisions, 0, 1, 0, 1);

        this.heightmap = new CGFtexture(scene, "textures/heightmap.jpg");

        this.heightmapShader = new CGFshader(
            scene.gl,
            "shaders/terrain/terrain.vert",
            "shaders/terrain/terrain.frag"
        );

        this.proceduralShader = new CGFshader(
            scene.gl,
            "shaders/terrain/procedural.vert",
            "shaders/terrain/terrain.frag"
        );

        this.mode = 'procedural';
        this.heightScale = 5.2;
        this.frequency = 0.045;
        this.seed = [12.34, 56.78];
        this.visible = true;

        // The plane extends past this radius, so the shader defines the edge.
        this.maxRadius = 30.0;

        this.heightmapShader.setUniformsValues({
            uSampler2: 1,
            terrainSize: this.size,
            heightScale: this.heightScale,
            texelSize: 1.0 / 256.0,
            maxRadius: this.maxRadius,
            ...SHARED_FRAG_UNIFORMS,
        });

        this.proceduralShader.setUniformsValues({
            terrainSize: this.size,
            heightScale: this.heightScale,
            frequency: this.frequency,
            seed: this.seed,
            maxRadius: this.maxRadius,
            ...SHARED_FRAG_UNIFORMS,
        });
    }

    updateSunDir(x, y, z) {
        const ox = x;
        const oy = z;
        const oz = y;

        const len = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
        const dir = [ox/len, oy/len, oz/len];

        this.heightmapShader.setUniformsValues({ sunDir: dir });
        this.proceduralShader.setUniformsValues({ sunDir: dir });
    }


    randomizeSeed() {
        this.seed = [Math.random() * 1000, Math.random() * 1000];
    }

    display() {
        if (!this.visible) return;

        let shader;
        if (this.mode === 'heightmap') {
            this.heightmap.bind(1);
            this.heightmapShader.setUniformsValues({
                heightScale: this.heightScale,
            });
            shader = this.heightmapShader;
        } else {
            this.proceduralShader.setUniformsValues({
                heightScale: this.heightScale,
                frequency: this.frequency,
                seed: this.seed,
            });
            shader = this.proceduralShader;
        }

        this.scene.setActiveShader(shader);
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}
