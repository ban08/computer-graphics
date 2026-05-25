#ifdef GL_ES
precision highp float;
#endif

uniform vec3 baseColor;
uniform vec3 tipColor;
uniform float timeFactor;
uniform float bobSpeed;
uniform float phase;

varying vec3 vNormal;
varying float vHeight;

void main() {
    float verticalMix = smoothstep(-0.32, 0.80, vHeight);
    float rim = 0.65 + 0.35 * abs(vNormal.y);
    float pulse = 0.92 + 0.08 * sin(timeFactor * bobSpeed + phase);
    vec3 color = mix(baseColor, tipColor, verticalMix) * rim * pulse;

    gl_FragColor = vec4(color, 1.0);
}
