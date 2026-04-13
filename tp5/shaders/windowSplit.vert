attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying float vScreenY;

void main() {
	vec4 clipPos = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = clipPos;

	// Convert clip-space Y to normalized window-space Y in [0, 1].
	vScreenY = (clipPos.y / clipPos.w) * 0.5 + 0.5;
}
