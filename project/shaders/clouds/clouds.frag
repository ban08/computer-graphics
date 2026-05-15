#ifdef GL_ES
precision highp float;
#endif

varying vec3 vLocalPos;

uniform float timeFactor;
uniform float coverage;
uniform float speed;
uniform float cloudBase;
uniform float cloudSoftness;
uniform vec3 cloudColor;
uniform vec3 sunDir;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
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

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec3 dir = normalize(vLocalPos);

    float layerBase = clamp(cloudBase, 0.0, 0.95);
    float fadeWidth = max(cloudSoftness, 0.01);
    float fadeStart = layerBase - fadeWidth * 3.0;
    float fadeEnd = layerBase + fadeWidth * 1.35;

    if (dir.y < fadeStart) discard;

    // Project the dome direction onto the horizontal plane.
    vec2 uv = dir.xz * 3.2;
    vec2 drift = vec2(timeFactor * speed, timeFactor * speed * 0.3);
    uv += drift;

    // Layered 2D noise: large masses, medium cuts, and fine edge erosion.
    float large = fbm(uv * 0.62);
    float medium = fbm(uv * 1.75 + vec2(11.7, 5.3));
    float fine = fbm(uv * 5.20 + vec2(31.2, 17.8));
    float edgeErosion = fine * (1.0 - smoothstep(0.35, 0.82, large));
    float n = large * 0.78 + medium * 0.34 - edgeErosion * 0.28 - 0.12;
    n = smoothstep(0.18, 0.82, clamp(n, 0.0, 1.0));

    // Coverage controls the alpha threshold.
    float threshold = mix(0.76, 0.30, coverage);
    float alpha = smoothstep(threshold - 0.08, threshold + 0.16, n);
    alpha *= smoothstep(0.05, 0.95, n);

    vec3 s = normalize(sunDir);
    float sunHeight = smoothstep(-0.05, 0.40, s.y);
    float sunsetAmount = (1.0 - smoothstep(0.15, 0.55, s.y)) * smoothstep(-0.06, 0.20, s.y);
    float sunAmount = smoothstep(-0.15, 0.80, dot(dir, s));

    vec3 shadowColor = cloudColor * mix(vec3(0.58, 0.64, 0.74), vec3(0.68, 0.72, 0.80), sunHeight);
    vec3 litColor = cloudColor * mix(vec3(1.0), vec3(1.0, 0.86, 0.62), sunsetAmount);
    vec3 color = mix(shadowColor, litColor, clamp(n * 0.55 + sunAmount * 0.45, 0.0, 1.0));

    // Long atmospheric fade so clouds dissolve into the horizon instead of ending on a ring.
    float baseFade = smoothstep(fadeStart, fadeEnd, dir.y);
    baseFade = baseFade * baseFade * (3.0 - 2.0 * baseFade);
    float horizonMist = 1.0 - smoothstep(layerBase - fadeWidth * 1.6, layerBase + fadeWidth * 1.8, dir.y);
    vec3 mistColor = mix(vec3(0.70, 0.78, 0.84), vec3(0.92, 0.94, 0.95), sunHeight);
    color = mix(color, mistColor, horizonMist * 0.55);

    alpha *= baseFade;
    alpha *= mix(0.52, 0.90, sunHeight);

    gl_FragColor = vec4(color, alpha);
}
