#ifdef GL_ES
precision highp float;
#endif


varying vec3 vNormal;

void main() {
    float intensity = length(vNormal.xy); 

    vec3 core   = vec3(1.0, 1.0, 0.);
    vec3 orange = vec3(1.0, 0.5, 0.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    
    vec3 color = mix(core, yellow, intensity);
    color = mix(color, orange, pow(intensity, 3.0));
    gl_FragColor = vec4(color, 1.0);
}