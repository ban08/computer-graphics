#ifdef GL_ES
precision highp float;
#endif

varying float vHeight;
varying vec3 vNormal;
varying float vRadial;

uniform vec3 lowColor;
uniform vec3 midColor;
uniform vec3 highColor;
uniform vec3 sunDir;
uniform float ambient;
uniform float maxRadius;

void main() {
    // Apply a hard circular boundary inside the sky dome.
    if (vRadial > maxRadius) discard;

    vec3 base;
    if (vHeight < 0.5) {
        base = mix(lowColor, midColor, smoothstep(0.0, 0.5, vHeight));
    } else {
        base = mix(midColor, highColor, smoothstep(0.5, 1.0, vHeight));
    }

    // Basic diffuse lighting in object space.
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, normalize(sunDir)), 0.0);
    float lighting = ambient + (1.0 - ambient) * lambert;

    gl_FragColor = vec4(base * lighting, 1.0);
}
