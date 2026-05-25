#ifdef GL_ES
precision highp float;
#endif

uniform float progress;

varying vec2 vTextureCoord;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    
    return fract(p.x * p.y);
}

float noise(vec2 p) {
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
    vec2 p = (vTextureCoord - 0.5) * vec2(1.0, 1.15);
    float haze = noise(p * 4.0 + vec2(progress * 0.5, 0.0));
    float edge = 1.0 - smoothstep(0.22, 0.52, length(p));
    float alpha = edge * mix(0.20, 0.42, haze) * (1.0 - progress);

    gl_FragColor = vec4(0.70, 0.59, 0.44, alpha);
}
