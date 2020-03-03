varying vec2 vUv;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;

void main() {
    vec3 color1 = texture2D( uTexture1, vUv ).xyz;
    vec3 color2 = texture2D( uTexture2, vUv ).xyz;
    gl_FragColor = vec4( color1 + color2 * 1.5, 1.0 );
}