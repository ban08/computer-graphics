#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform sampler2D grassTex;

void main() {
    vec4 tex = texture2D(grassTex, vTexCoord);
    if (tex.a < 0.25) discard;
    gl_FragColor = tex;
}