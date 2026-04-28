attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying float vHeight;

void main() {
    vHeight = normalize(aVertexPosition).y * 0.5 + 0.5;
    
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
