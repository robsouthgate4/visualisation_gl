
uniform float time;
uniform float delta;

varying vec2 vUv;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

varying mat4 vMMatrix;

void main() {
    vUv = position.xy;
    vec4 pos = texture2D(texturePosition, position.xy);
    vec4 vel = texture2D(textureVelocity, position.xy);

    

    vec4 mvPosition = modelViewMatrix * vec4( pos.xyz, 1.0 );
    gl_PointSize = 3.0 * ( 3.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;

    vMMatrix = modelMatrix;
}