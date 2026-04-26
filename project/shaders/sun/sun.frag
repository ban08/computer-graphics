#ifdef GL_ES
precision highp float;
#endif


varying vec3 vNormal;

void main() {

    float intensity = vNormal.z;

    vec3 orange = vec3(1.0, 0.5, 0.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    
    vec3 color = mix(orange, yellow, intensity);

    gl_FragColor = vec4(color, 1.0);
}