attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float timeFactor;
uniform vec2  windDir;
uniform float windStrength;
uniform float windSpeed;
uniform float uBladeHeight;

varying float vHeight;
varying float vDry;
varying float vTone;
varying vec2  vWorldXZ;
varying vec3  vNormal;

void main() {
    // aTextureCoord.x = height fraction (0 base, 1 tip), .y = dryness.
    float h = aTextureCoord.x;
    // Quadratic bend keeps the base anchored and concentrates motion at the
    // tip, matching the spec "wind effect increases with height".
    float bend = h * h;

    vec2 crossWind = vec2(-windDir.y, windDir.x);
    float alongWind = dot(aVertexPosition.xz, windDir);
    float acrossWind = dot(aVertexPosition.xz, crossWind);

    // Layered sin waves: a broad gust travelling along wind direction plus
    // smaller crosswind flutter. Dry blades are stiffer and move less.
    float phase = dot(aVertexPosition.xz, vec2(0.27, 0.41));
    float mainWave = sin(timeFactor * windSpeed * 2.8 + alongWind * 1.15 + phase);
    float slowWave = sin(timeFactor * windSpeed * 0.9 + alongWind * 0.36 + phase * 0.7);
    float flutter = sin(timeFactor * windSpeed * 5.6 + acrossWind * 1.8 + phase * 1.9);
    float gust = 0.55 * mainWave + 0.30 * slowWave + 0.15 * flutter;
    float stiffness = mix(1.0, 0.55, aTextureCoord.y);

    // windStrength is a fraction of blade height, so the GUI slider stays
    // intuitive even when the blade scale is rebuilt.
    float displaceAmount = windStrength * uBladeHeight * bend * gust * stiffness;

    vec3 p = aVertexPosition;
    p.xz += windDir * displaceAmount;
    p.xz += crossWind * displaceAmount * 0.12 * flutter;
    p.y  -= bend * abs(displaceAmount) * 0.35;

    vHeight  = h;
    vDry     = aTextureCoord.y;
    vTone    = aVertexNormal.y;
    vWorldXZ = aVertexPosition.xz;
    vNormal  = normalize(vec3(aVertexNormal.x, 0.0, aVertexNormal.z));

    gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);
}
