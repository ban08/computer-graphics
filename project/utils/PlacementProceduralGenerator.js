import { generatePoissonDiskSample } from './PoissonDiskSampler.js';

/**
 * PlacementGenerator
 * @constructor
 * @param centerX - X coordinate of the placement world center
 * @param centerZ - Z coordinate of the placement world center
 * @param worldRadius - Radius of the placement world
 * @param getHeightAt - Optional function that returns terrain height at (x, z)
 */
export class PlacementGenerator {
    constructor(centerX, centerZ, worldRadius, getHeightAt = null) {
        this.centerX = centerX;
        this.centerZ = centerZ;
        this.worldRadius = worldRadius;
        this.getHeightAt = getHeightAt;
    }

    generatePoints(minDistance, k = 10) {
        return generatePoissonDiskSample(
            this.centerX,
            this.centerZ,
            this.worldRadius,
            minDistance,
            k
        );
    }

    generatePlacements(minDistance, k = 10, filter = null, map = null) {
        const points = this.generatePoints(minDistance, k);
        const placements = [];

        for (const point of points) {
            if (filter && !filter(point.x, point.z)) continue;

            const placement = {
                x: point.x,
                y: this.getHeightAt ? this.getHeightAt(point.x, point.z) : 0,
                z: point.z
            };

            placements.push(map ? map(placement) : placement);
        }

        return placements;
    }
}
