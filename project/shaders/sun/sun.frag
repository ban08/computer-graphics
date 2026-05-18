#ifdef GL_ES
precision highp float;
#endif


varying vec3 vNormal;

void main() {
    float intensity = length(vNormal.xy); 

    vec3 core = vec3(1.0, 0.96, 0.55);
    vec3 orange = vec3(1.0, 0.45, 0.03);
    vec3 yellow = vec3(1.0, 0.82, 0.16);
    
    vec3 color = mix(core, yellow, intensity);
    color = mix(color, orange, pow(intensity, 3.0));
    gl_FragColor = vec4(color, 1.0);
}