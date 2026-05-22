attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;


uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float heightScale;

varying vec2 vWorldXY;
varying float vHeight;
varying float vRadial;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main() {
    vWorldXY = aVertexPosition.xy;
    vHeight = clamp(aVertexPosition.z / max(heightScale, 0.0001), 0.0, 1.0);
    vRadial = length(vWorldXY);
    vNormal = normalize(aVertexNormal);
    vTexCoord = aTextureCoord;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
