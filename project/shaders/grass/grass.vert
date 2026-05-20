attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float timeFactor;
uniform vec2  windDir;
uniform float windStrength;
uniform float windSpeed;

varying float vHeight;
varying float vDry;
varying vec2  vWorldXZ;
varying vec3  vNormal;

void main() {
    // aTextureCoord.x = height fraction (0 base, 1 tip), .y = dryness.
    float h = aTextureCoord.x;
    // Quadratic bend so motion is concentrated at the tip — spec requirement
    // (wind effect increases with height).
    float bend = h * h;

    // Per-blade phase from the blade-root XZ. Two co-located vertices of the
    // same blade share this phase, so the whole triangle bends as one piece.
    vec2 root = aVertexPosition.xz;
    float phase = dot(root, vec2(0.27, 0.41));

    // Layered sinusoids: a fast gust + a slow swell — cheaper than fbm noise
    // and reads as natural wind. Sin-only (spec: "Sinusoidal functions work well").
    float gust = 0.65 * sin(timeFactor * windSpeed * 1.7 + phase)
               + 0.35 * sin(timeFactor * windSpeed * 0.35 + phase * 0.5);

    vec3 p = aVertexPosition;
    p.xz += windDir * windStrength * bend * gust;
    // Tiny vertical dip on the tip so the blade conserves length while bending.
    p.y  -= bend * bend * windStrength * 0.5 * abs(gust);

    vHeight  = h;
    vDry     = aTextureCoord.y;
    vWorldXZ = aVertexPosition.xz;
    vNormal  = aVertexNormal;

    gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);
}
