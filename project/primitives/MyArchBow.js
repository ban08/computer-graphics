import { CGFobject } from '../../lib/CGF.js';

/**
 * MyArchBow
 * @constructor
 * @param scene - Reference to MyScene object
 * @param halfWidth - Half width of the bow
 * @param sideHeight - Height of the straight sides
 * @param archHeight - Height of the arch
 * @param tubeRadius - Radius of the tube
 * @param profileSteps - Number of arch profile steps
 * @param tubeSegments - Number of tube subdivisions
 */
export class MyArchBow extends CGFobject {
    constructor(scene, halfWidth = 1, sideHeight = 0.35, archHeight = 0.85, tubeRadius = 0.045, profileSteps = 22, tubeSegments = 8) {
        super(scene);
        this.halfWidth = halfWidth;
        this.sideHeight = sideHeight;
        this.archHeight = archHeight;
        this.tubeRadius = tubeRadius;
        this.profileSteps = profileSteps;
        this.tubeSegments = tubeSegments;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        const points = this.buildProfile();
        const tubeRow = this.tubeSegments + 1;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const tangent = this.tangentAt(points, i);
            const normal = { x: -tangent.y, y: tangent.x };
            const length = Math.hypot(normal.x, normal.y) || 1;
            normal.x /= length;
            normal.y /= length;

            for (let j = 0; j <= this.tubeSegments; j++) {
                const phi = (j / this.tubeSegments) * Math.PI * 2;
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);

                const offsetX = normal.x * cosPhi * this.tubeRadius;
                const offsetY = normal.y * cosPhi * this.tubeRadius;
                const offsetZ = sinPhi * this.tubeRadius;

                this.vertices.push(p.x + offsetX, p.y + offsetY, offsetZ);
                this.normals.push(normal.x * cosPhi, normal.y * cosPhi, sinPhi);
                this.texCoords.push(i / (points.length - 1), j / this.tubeSegments);
            }
        }

        for (let i = 0; i < points.length - 1; i++) {
            for (let j = 0; j < this.tubeSegments; j++) {
                const current = i * tubeRow + j;
                const next = (i + 1) * tubeRow + j;
                this.indices.push(current, next, current + 1);
                this.indices.push(current + 1, next, next + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    buildProfile() {
        const points = [];
        const sideStep = this.sideHeight / 3;

        // Left side, bottom -> top
        for (let i = 0; i <= 3; i++) {
            points.push({ x: -this.halfWidth, y: sideStep * i });
        }

        // Arch interior (skip both endpoints, since those coincide with the
        // top of the side walls and are added explicitly above/below).
        const archSteps = this.profileSteps;
        for (let i = 1; i < archSteps; i++) {
            const theta = Math.PI - (i / archSteps) * Math.PI;
            points.push({
                x: Math.cos(theta) * this.halfWidth,
                y: this.sideHeight + Math.sin(theta) * this.archHeight,
            });
        }

        // Right side, top -> bottom
        for (let i = 3; i >= 0; i--) {
            points.push({ x: this.halfWidth, y: sideStep * i });
        }

        return points;
    }

    tangentAt(points, i) {
        const prev = points[Math.max(0, i - 1)];
        const next = points[Math.min(points.length - 1, i + 1)];
        return { x: next.x - prev.x, y: next.y - prev.y };
    }
}
