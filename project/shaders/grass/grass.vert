attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float time;

varying vec2 vTexCoord;

void main() {
    vTexCoord = aTextureCoord;
    vec3 pos = aVertexPosition;
    float wind = sin(pos.y * 4.0 + time * 2.0) * 0.12;
    pos.x += wind * pos.y;
    pos.z += wind * 0.05;

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}