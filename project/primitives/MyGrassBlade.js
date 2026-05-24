/**
 * MyGrassBlade
 *
 * Raw geometry template for a single low-poly grass blade - a tapered quad
 * (4 vertices, 2 triangles). Wider at the base and sharp at the tip for a
 * readable blade silhouette. Satisfies the spec's
 * "very simple, low polygon count" rule.
 *
 * Local frame:
 *   origin at the base, +Y up, blade plane lies in XY, normal = +Z.
 *   texCoord.x packs the height fraction (0 = base, 1 = tip), texCoord.y
 *   carries dryness, and normal.y carries a per-blade tone seed.
 *
 * @constructor
 * @param width  - Blade width at the base
 * @param height - Blade height (base to tip)
 */
export class MyGrassBlade {
    constructor(width = 0.014, height = 0.085) {
        this.width = width;
        this.height = height;
        this.tipFraction = 0.08;
    }

    /**
     * Builds one transformed blade (2 triangles) into the given flat arrays.
     * Used by MyGrass during VBO baking, with no per-blade allocations.
     */
    build(rootX, rootY, rootZ, rotY, widthScale, heightScale, dryness, toneSeed, out) {
        const halfBase = this.width * widthScale * 0.5;
        const halfTip = halfBase * this.tipFraction;
        const h = this.height * heightScale;
        const c = Math.cos(rotY);
        const s = Math.sin(rotY);

        const local = [
            [-halfBase, 0, 0],
            [ halfBase, 0, 0],
            [-halfTip,  h, 0],
            [ halfTip,  h, 0],
        ];

        const nx = s;
        const nz = c;

        const baseIndex = out.vertices.length / 3;

        for (let i = 0; i < 4; i++) {
            const lx = local[i][0];
            const ly = local[i][1];
            const lz = local[i][2];

            const wx = rootX + lx * c + lz * s;
            const wy = rootY + ly;
            const wz = rootZ - lx * s + lz * c;

            out.vertices.push(wx, wy, wz);
            out.normals.push(nx, toneSeed, nz);
        }

        out.texCoords.push(0.0, dryness);
        out.texCoords.push(0.0, dryness);
        out.texCoords.push(1.0, dryness);
        out.texCoords.push(1.0, dryness);

        out.indices.push(baseIndex, baseIndex + 1, baseIndex + 3);
        out.indices.push(baseIndex, baseIndex + 3, baseIndex + 2);
    }
}
