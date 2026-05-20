#ifdef GL_ES
precision highp float;
#endif

varying float vHeight;
varying float vDry;
varying vec2  vWorldXZ;
varying vec3  vNormal;

uniform vec3  aliveBase;
uniform vec3  aliveTip;
uniform vec3  dryBase;
uniform vec3  dryTip;
uniform vec3  sunDir;
uniform float ambient;
uniform float maxRadius;
uniform vec3  hazeColor;
uniform float hazeStrength;

float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
    // Match the terrain's circular boundary so grass and ground end together.
    float radial = length(vWorldXZ);
    if (radial > maxRadius) discard;

    // Vertical color gradient per palette, then blend the palettes by dryness.
    vec3 alive = mix(aliveBase, aliveTip, vHeight);
    vec3 dry   = mix(dryBase,   dryTip,   vHeight);
    vec3 base  = mix(alive, dry, vDry);

    // Per-blade tint break-up sampled in world space.
    float fine = vnoise(vWorldXZ * 0.85 + vec2(5.3, 1.7));
    base *= 0.92 + fine * 0.16;

    // Lighting:
    //  - aboveHorizon kills the term cleanly at dusk/dawn (matches terrain).
    //  - sunHeight contributes most of the brightness (overhead = full bright).
    //  - sideTerm adds a small directional sparkle when sun rakes across the
    //    blade plane. abs() makes the blade visible from both sides.
    //  - vHeight bias acts as a cheap ambient-occlusion at the base.
    vec3 n = normalize(vNormal);
    vec3 s = normalize(sunDir);
    float aboveHorizon = smoothstep(-0.04, 0.24, s.y);
    float sunHeight = max(s.y, 0.0);
    float sideTerm  = abs(dot(n, s));
    float lighting = ambient + (1.0 - ambient) * aboveHorizon
                   * (0.55 * sunHeight + 0.18 * sideTerm + 0.20 * vHeight);

    vec3 lit = base * lighting;

    float distanceHaze = smoothstep(maxRadius * 0.48, maxRadius, radial);
    lit = mix(lit, hazeColor, distanceHaze * hazeStrength);

    gl_FragColor = vec4(lit, 1.0);
}
