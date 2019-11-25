
uniform float time;
uniform float delta;

varying vec2 vUv;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

varying mat4 vMMatrix;
varying vec4 vWorldPosition;
varying float vDepth;

void main() {

    vUv = position.xy;
    
    vec4 pos = texture2D(texturePosition, position.xy);
    vec4 vel = texture2D(textureVelocity, position.xy);

    vWorldPosition = modelMatrix * vec4(pos.xyz, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4( pos.xyz, 1.0 );


    gl_PointSize = 2.5 * ( 2.5 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;

    vDepth = -mvPosition.z;

    vMMatrix = modelMatrix;
}