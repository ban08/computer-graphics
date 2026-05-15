#ifdef GL_ES
precision highp float;
#endif

varying vec3 vLocalPos;

uniform float timeFactor;
uniform float coverage;
uniform float speed;
uniform vec3 cloudColor;

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

    // Keep clouds in the upper sky so they do not appear to touch the terrain.
    const float cloudBase = 0.32;
    const float cloudFade = 0.18;

    if (dir.y < cloudBase - cloudFade) discard;

    // Project the dome direction onto the horizontal plane.
    vec2 uv = dir.xz * 3.0;
    vec2 drift = vec2(timeFactor * speed, timeFactor * speed * 0.3);
    uv += drift;

    // Combine the base shape with finer detail.
    float base = fbm(uv);
    float detail = fbm(uv * 2.8 + vec2(11.7, 5.3));
    float n = clamp(base + detail * 0.35 - 0.25, 0.0, 1.0);

    // Remap density values to keep cloud gaps distinct.
    n = smoothstep(0.15, 0.85, n);

    // Coverage controls the alpha threshold.
    float threshold = 1.0 - coverage;
    float alpha = smoothstep(threshold - 0.05, threshold + 0.08, n);

    // Use density to vary the cloud shading.
    float density = smoothstep(threshold, threshold + 0.35, n);
    vec3 shadowColor = cloudColor * vec3(0.70, 0.75, 0.85);
    vec3 color = mix(shadowColor, cloudColor, density);

    // Fade the lower edge well above the horizon for a more natural cloud layer.
    float altitudeFade = smoothstep(cloudBase - cloudFade, cloudBase + cloudFade, dir.y);
    alpha *= altitudeFade;

    gl_FragColor = vec4(color, alpha);
}
