#ifdef GL_ES
precision highp float;
#endif

varying float vScreenY;

void main() {
	if (vScreenY > 0.5)
		gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
	else
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
