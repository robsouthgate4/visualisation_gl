
uniform float time;
uniform float delta;

varying vec2 vUv;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

void main() {
    vUv = position.xy;
    vec4 pos = texture2D(texturePosition, position.xy);
    vec4 vel = texture2D(textureVelocity, position.xy);
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
}