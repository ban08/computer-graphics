attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float timeFactor;
uniform float bobAmplitude;
uniform float bobSpeed;
uniform float phase;

varying vec3 vNormal;
varying float vHeight;

void main() {
    float bob = sin(timeFactor * bobSpeed + phase) * bobAmplitude;
    vec3 p = aVertexPosition + vec3(0.0, bob, 0.0);

    vNormal = normalize(aVertexNormal);
    vHeight = aVertexPosition.y;

    gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);
}
