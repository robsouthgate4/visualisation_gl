

varying vec2 vUv;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

void main() {
    vec4 pos = texture2D(texturePosition, vUv);
    gl_FragColor = vec4(1.0);
}