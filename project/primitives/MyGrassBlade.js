/**
 * MyGrassBlade
 *
 * Raw geometry template for a single low-poly grass blade (one triangle).
 * This class is never drawn on its own: MyGrassField uses build() to bake
 * many transformed copies into a single batched VBO.
 *
 * Local frame:
 *   origin at the base, +Y up, blade plane lies in XY, normal = +Z.
 *   Vertex height fraction is packed into texCoord.x (0 = base, 1 = tip)
 *   so the wind shader can scale displacement by height.
 *
 * @constructor
 * @param width  - Blade width at the base
 * @param height - Blade height (base to tip)
 */
export class MyGrassBlade {
    constructor(width = 0.06, height = 0.35) {
        this.width = width;
        this.height = height;
    }

    /**
     * Builds one transformed triangle and appends it to the given flat arrays.
     * Used by MyGrassField when baking the field VBO.
     *
     * @param rootX     - World X of the blade root
     * @param rootY     - World Y of the blade root (terrain height)
     * @param rootZ     - World Z of the blade root
     * @param rotY      - Rotation around the Y axis (radians)
     * @param widthScale  - Per-blade width multiplier
     * @param heightScale - Per-blade height multiplier
     * @param dryness   - Per-blade dryness in [0, 1] (packed into texCoord.y)
     * @param out       - { vertices, normals, texCoords, indices } target arrays
     */
    build(rootX, rootY, rootZ, rotY, widthScale, heightScale, dryness, out) {
        const halfW = this.width * widthScale * 0.5;
        const h = this.height * heightScale;
        const c = Math.cos(rotY);
        const s = Math.sin(rotY);

        // Local triangle: base-left, base-right, tip.
        const local = [
            [-halfW, 0,    0],
            [ halfW, 0,    0],
            [ 0,     h,    0],
        ];

        // Local normal (+Z) rotated around Y.
        const nx = s;
        const nz = c;

        const baseIndex = out.vertices.length / 3;

        for (let i = 0; i < 3; i++) {
            const lx = local[i][0];
            const ly = local[i][1];
            const lz = local[i][2];

            const wx = rootX + lx * c + lz * s;
            const wy = rootY + ly;
            const wz = rootZ - lx * s + lz * c;

            out.vertices.push(wx, wy, wz);
            out.normals.push(nx, 0.0, nz);
        }

        // texCoord.x = height fraction (drives wind bend), texCoord.y = dryness
        out.texCoords.push(0.0, dryness);
        out.texCoords.push(0.0, dryness);
        out.texCoords.push(1.0, dryness);

        out.indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
    }
}
