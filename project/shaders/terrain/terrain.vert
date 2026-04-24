attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform sampler2D uSampler2;
uniform float terrainSize;
uniform float heightScale;
uniform float texelSize;

varying float vHeight;
varying vec3 vNormal;
varying float vRadial;

float sampleHeight(vec2 uv) {
    return texture2D(uSampler2, uv).r;
}

float terrainH(vec2 uv) {
    return sampleHeight(uv);
}

void main() {
    float h = terrainH(aTextureCoord);
    vHeight = h;

    vec3 pos = aVertexPosition;
    pos.x *= terrainSize;
    pos.y *= terrainSize;
    pos.z = h * heightScale;

    vRadial = length(aVertexPosition.xy * terrainSize);

    // Estimate the normal from neighboring height samples.
    float hL = terrainH(aTextureCoord - vec2(texelSize, 0.0)) * heightScale;
    float hR = terrainH(aTextureCoord + vec2(texelSize, 0.0)) * heightScale;
    float hD = terrainH(aTextureCoord - vec2(0.0, texelSize)) * heightScale;
    float hU = terrainH(aTextureCoord + vec2(0.0, texelSize)) * heightScale;
    float worldStep = 2.0 * texelSize * terrainSize;
    vec3 tx = vec3(worldStep, 0.0, hR - hL);
    vec3 ty = vec3(0.0, worldStep, hU - hD);
    vNormal = normalize(cross(tx, ty));

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}
