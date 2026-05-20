import { generatePoissonDiskSample } from './PoissonDiskSampler.js';

/**
 * GrassPatchLayout
 *
 * Reusable blade-offset template for a single grass patch.
 * Offsets are sampled once (Poisson disk in a unit-ish disc) and then
 * reused for every patch by MyGrassField with a per-patch random rotation
 * applied at bake time. This keeps thousands of blades cheap to generate
 * while preventing visible repetition across patches.
 *
 * @constructor
 * @param radius      - Patch radius (offsets are bounded by this disc)
 * @param minDistance - Minimum distance between blade roots within a patch
 * @param k           - Maximum candidate attempts per active sample (Poisson tuning)
 */
export class GrassPatchLayout {
    constructor(radius = 0.6, minDistance = 0.10, k = 20) {
        this.radius = radius;
        this.minDistance = minDistance;

        const points = generatePoissonDiskSample(0, 0, radius, minDistance, k);

        // Pre-flatten into plain offset arrays so MyGrassField doesn't allocate
        // a wrapper object per blade during the bake loop.
        this.offsets = new Float32Array(points.length * 2);
        for (let i = 0; i < points.length; i++) {
            this.offsets[i * 2]     = points[i].x;
            this.offsets[i * 2 + 1] = points[i].z;
        }
    }

    /**
     * @returns Number of blades in the patch layout
     */
    get bladeCount() {
        return this.offsets.length / 2;
    }
}
