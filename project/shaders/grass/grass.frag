#ifdef GL_ES
precision highp float;
#endif

varying float vHeight;
varying float vDry;
varying float vTone;
varying vec2  vWorldXZ;
varying vec3  vNormal;

uniform vec3  aliveBaseCool;
uniform vec3  aliveTipCool;
uniform vec3  aliveBaseWarm;
uniform vec3  aliveTipWarm;
uniform vec3  dryBase;
uniform vec3  dryTip;
uniform float colorVariation;
uniform vec3  skyAmbient;
uniform vec3  groundAmbient;
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

    // Per-blade hue/saturation noise sampled in world space. Wavelength is
    // large enough that the four vertices of a single blade fall on nearly
    // the same value, so the blade reads as one tint, but neighbouring
    // blades drift between cooler and warmer greens for variety.
    float hueShift = fract(vTone * 1.73 + vnoise(vWorldXZ * 1.15 + vec2(7.3, 1.1)) * 0.35);
    float fineTint = fract(vTone * 4.17 + vnoise(vWorldXZ * 4.20 + vec2(2.1, 9.7)) * 0.45);

    vec3 aliveBase = mix(aliveBaseCool, aliveBaseWarm, hueShift);
    vec3 aliveTip  = mix(aliveTipCool,  aliveTipWarm,  hueShift);

    // Vertical gradient per palette, then blend palettes by dryness.
    vec3 alive = mix(aliveBase, aliveTip, vHeight);
    vec3 dry   = mix(dryBase,   dryTip,   vHeight);
    vec3 base  = mix(alive, dry, vDry);

    float toneAmount = clamp(colorVariation, 0.0, 1.5);
    vec3 yellowGreen = vec3(0.74, 0.78, 0.22);
    vec3 blueGreen = vec3(0.08, 0.34, 0.16);
    base = mix(base, mix(blueGreen, yellowGreen, fineTint), 0.18 * toneAmount * (1.0 - vDry));
    base = mix(base, vec3(0.75, 0.54, 0.17), smoothstep(0.52, 1.0, vDry) * 0.24);
    base *= 0.90 + fineTint * 0.26 * toneAmount;

    // Lighting model:
    //   - Hemispheric ambient (cool sky from above + warm earth bounce from
    //     below) keeps the field readable even at dusk/dawn.
    //   - Direct sun term gated by aboveHorizon, weighted by sun height +
    //     a small directional sparkle (abs() so both sides of the single-
    //     faced quad light the same).
    //   - vHeight bias acts as a cheap base-darkening AO.
    vec3 n = normalize(vNormal);
    vec3 s = normalize(sunDir);
    float aboveHorizon = smoothstep(-0.04, 0.24, s.y);
    float sunHeight = max(s.y, 0.0);
    float sideTerm  = abs(dot(n, s));
    float aoBase = 0.86 + 0.14 * vHeight;

    vec3 hemi = mix(groundAmbient, skyAmbient, 0.5 + 0.5 * vHeight) * ambient;
    vec3 direct = vec3(0.60 * sunHeight + 0.20 * sideTerm) * aboveHorizon;

    vec3 lit = base * (hemi + direct) * aoBase;

    float distanceHaze = smoothstep(maxRadius * 0.48, maxRadius, radial);
    lit = mix(lit, hazeColor, distanceHaze * hazeStrength);

    gl_FragColor = vec4(lit, 1.0);
}
