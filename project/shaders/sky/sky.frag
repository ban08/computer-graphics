#ifdef GL_ES
precision highp float;
#endif

uniform vec3 sunDir;
varying float vHeight;

void main() {
    float dayNightFactor = smoothstep(-0.05, 0.35, sunDir.y);
    float skyHeightFactor = smoothstep(0.0, 1.0, vHeight);
    float sunriseSunsetFactor = 1.0 - smoothstep(0.10, 0.45, sunDir.y);
    sunriseSunsetFactor *= smoothstep(-0.10, 0.15, sunDir.y);

    float horizonLineMask = smoothstep(0.46, 0.50, vHeight) * (1.0 - smoothstep(0.50, 0.72, vHeight));

    vec3 nightTop = vec3(0.01, 0.015, 0.04);
    vec3 nightBottom = vec3(0.04, 0.05, 0.10);

    vec3 dayTop = vec3(0.12, 0.32, 0.65);
    vec3 dayBottom = vec3(0.55, 0.72, 0.85);

    vec3 nightSky = mix(nightBottom, nightTop, skyHeightFactor);
    vec3 daySky = mix(dayBottom, dayTop, skyHeightFactor);

    vec3 dayNightCycleColor = mix(nightSky, daySky, dayNightFactor);
    vec3 sunriseSunsetColor = vec3(1.0, 0.35, 0.12);

    vec3 skyColor = mix(dayNightCycleColor, sunriseSunsetColor, sunriseSunsetFactor * horizonLineMask * 0.6);

    gl_FragColor = vec4(skyColor, 1.0);
}
