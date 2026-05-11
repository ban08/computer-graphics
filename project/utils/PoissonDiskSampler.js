/**
 * Generates 2D Poisson Disk sample points inside a circular domain using
 * Bridson's algorithm, enforcing a minimum distance between samples.
 * Algorithm reference links in project/README.md.
 * 
 * @param centerX - X coordinate of the circular domain center
 * @param centerZ - Z coordinate of the circular domain center
 * @param boundsRadius - Radius of the circular domain
 * @param radius - Minimum distance between generated samples
 * @param k - Maximum number of candidate attempts per active point
 * @returns Returns generated sample points array {x, z}[]
 */
export function generatePoissonDiskSample(centerX, centerZ, boundsRadius, radius, k = 10) {
    const cellSize = radius / Math.sqrt(2);
    const minX = centerX - boundsRadius;
    const maxX = centerX + boundsRadius;
    const minZ = centerZ - boundsRadius;
    const maxZ = centerZ + boundsRadius;

    const sample = [];
    const active = [];

    const gridWidth = Math.ceil((maxX - minX) / cellSize);
    const gridHeight = Math.ceil((maxZ - minZ) / cellSize);
    const grid = new Array(gridWidth * gridHeight).fill(-1);

    function gridIndex(gx, gz) {
        return gz * gridWidth + gx;
    }

    function addPoint(x, z) {
        const point = {x, z};

        sample.push(point);
        active.push(point);

        const gx = Math.floor((x - minX) / cellSize);
        const gz = Math.floor((z - minZ) / cellSize);

        grid[gridIndex(gx, gz)] = sample.length - 1;
    }

    function isValid(x, z) {
        const dxCenter = x - centerX;
        const dzCenter = z - centerZ;

        if (dxCenter * dxCenter + dzCenter * dzCenter > boundsRadius * boundsRadius) return false;

        const gx = Math.floor((x - minX) / cellSize);
        const gz = Math.floor((z - minZ) / cellSize);

        for (let dz = -2; dz <= 2; dz++) {
            for (let dx = -2; dx <= 2; dx++) {
                const nx = gx + dx;
                const nz = gz + dz;

                if (nx < 0 || nx >= gridWidth || nz < 0 || nz >= gridHeight) continue;

                const index = grid[gridIndex(nx, nz)];

                if (index === -1) continue;

                const p = sample[index];
                const distX = x - p.x;
                const distZ = z - p.z;

                if (distX * distX + distZ * distZ < radius * radius) return false;
            }
        }

        return true;
    }

    let startX, startZ;

    do {
        startX = minX + Math.random() * (maxX - minX);
        startZ = minZ + Math.random() * (maxZ - minZ);
    } while (!isValid(startX, startZ));

    addPoint(startX, startZ);

    while (active.length > 0) {
        const activeIndex = Math.floor(Math.random() * active.length);
        const center = active[activeIndex];
        let found = false;

        for (let i = 0; i < k; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (1 + Math.random());

            const x = center.x + Math.cos(angle) * distance;
            const z = center.z + Math.sin(angle) * distance;

            if (isValid(x, z)) {
                addPoint(x, z);
                found = true;
                break;
            }
        }

        if (!found) active.splice(activeIndex, 1);
    }

    return sample;
}
