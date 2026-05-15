attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float terrainSize;
uniform float heightScale;
uniform float frequency;
uniform vec2 seed;

varying float vHeight;
varying vec3 vNormal;
varying float vRadial;

vec2 hash22(vec2 p) {
    vec2 q = vec2(dot(p, vec2(127.1, 311.7)),
                  dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(q) * 43758.5453);
}

// Gradient noise in the approximate range [-1, 1].
float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n00 = dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float n10 = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float n01 = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float n11 = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
}

float fbm4(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * gnoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

// Return the procedural height at a world-space position.
float terrainHeight(vec2 worldXY) {
    vec2 q = worldXY * frequency + seed;
    vec2 warp = vec2(gnoise(q + vec2(0.0, 0.0)),
                     gnoise(q + vec2(5.2, 1.3)));

    float hills = fbm4(q * 0.72 + 0.75 * warp);
    float detail = fbm4(q * 2.4 + vec2(9.1, 4.7));
    float h = 0.5 + hills * 0.78 + detail * 0.16;

    return smoothstep(0.08, 0.92, clamp(h, 0.0, 1.0));
}

void main() {
    vec2 worldXY = aVertexPosition.xy * terrainSize;

    float h = terrainHeight(worldXY);
    vHeight = h;
    vRadial = length(worldXY);

    vec3 pos = aVertexPosition;
    pos.x *= terrainSize;
    pos.y *= terrainSize;
    pos.z = h * heightScale;

    // Estimate the normal from neighboring height samples.
    float eps = 0.5;
    float hL = terrainHeight(worldXY - vec2(eps, 0.0)) * heightScale;
    float hR = terrainHeight(worldXY + vec2(eps, 0.0)) * heightScale;
    float hD = terrainHeight(worldXY - vec2(0.0, eps)) * heightScale;
    float hU = terrainHeight(worldXY + vec2(0.0, eps)) * heightScale;

    float worldStep = 2.0 * eps;
    vec3 tx = vec3(worldStep, 0.0, hR - hL);
    vec3 ty = vec3(0.0, worldStep, hU - hD);
    vNormal = normalize(cross(tx, ty));

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}
