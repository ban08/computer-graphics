#ifdef GL_ES
precision highp float;
#endif

varying float vHeight;
varying vec3 vNormal;
varying float vRadial;
varying vec2 vWorldXY;
varying vec2 vTexCoord;

uniform vec3 lowColor;
uniform vec3 midColor;
uniform vec3 highColor;
uniform vec3 sunDir;
uniform float ambient;
uniform float maxRadius;
uniform vec3 hazeColor;
uniform float hazeStrength;
uniform sampler2D terrainTex;

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

float fbm3(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
        v += a * vnoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    // Apply a hard circular boundary inside the sky dome.
    if (vRadial > maxRadius) discard;

    vec3 n = normalize(vNormal);
    float slope = 1.0 - clamp(n.z, 0.0, 1.0);

    vec3 base;
    if (vHeight < 0.56) {
        base = mix(lowColor, midColor, smoothstep(0.04, 0.56, vHeight));
    } else {
        base = mix(midColor, highColor, smoothstep(0.50, 1.0, vHeight));
    }

    float broadVariation = fbm3(vWorldXY * 0.085 + vec2(3.4, 7.1));
    float fineVariation = vnoise(vWorldXY * 0.72 + vec2(12.8, 2.2));
    float dryPatch = smoothstep(0.47, 0.78, broadVariation + vHeight * 0.18 + slope * 0.12);
    float lowMoisture = (1.0 - smoothstep(0.18, 0.48, vHeight)) * (1.0 - slope * 0.55);

    vec3 moistGreen = vec3(0.07, 0.24, 0.08);
    vec3 dryGrass = vec3(0.66, 0.50, 0.18);
    base = mix(base, moistGreen, clamp(lowMoisture, 0.0, 1.0) * 0.20);
    base = mix(base, dryGrass, dryPatch * 0.46);
    base *= 0.92 + fineVariation * 0.14;
    base *= mix(1.0, 0.72, smoothstep(0.12, 0.52, slope));

    // Low-cost grass underpaint. The 3D blades supply silhouettes and wind;
    // this shader noise fills the gaps so the ground reads as a continuous
    // grassy field instead of isolated spikes.
    float bladeRows = vnoise(vec2(vWorldXY.x * 3.4 + broadVariation * 4.0, vWorldXY.y * 15.0));
    float grassFibers = smoothstep(0.50, 0.92, bladeRows) * (1.0 - dryPatch * 0.65);
    float grassGrain = fbm3(vWorldXY * 1.8 + vec2(8.1, 4.6));
    vec3 darkFiber = vec3(0.07, 0.23, 0.07);
    vec3 lightFiber = vec3(0.48, 0.58, 0.16);
    vec3 dryFiber = vec3(0.78, 0.62, 0.22);
    vec3 fiberColor = mix(darkFiber, lightFiber, grassGrain);
    fiberColor = mix(fiberColor, dryFiber, dryPatch * 0.58);
    base = mix(base, fiberColor, 0.16 + grassFibers * 0.22);

    // Basic diffuse lighting in object space.
    vec3 s = normalize(sunDir);

    float aboveHorizon = smoothstep(-0.04, 0.24, s.z);
    float lambert = max(dot(n, s), 0.0);
    float skyWrap = max(s.z, 0.0) * 0.16;
    float lighting = ambient + (1.02 - ambient) * (lambert + skyWrap) * aboveHorizon;
    vec3 litColor = base * lighting;

    float distanceHaze = smoothstep(maxRadius * 0.48, maxRadius, vRadial);
    litColor = mix(litColor, hazeColor, distanceHaze * hazeStrength);

    gl_FragColor = vec4(litColor, 1.0);
}
