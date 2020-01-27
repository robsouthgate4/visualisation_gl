attribute float pindex;
attribute vec3 position;
attribute vec3 aOffset;
attribute vec2 uv;
attribute float angle;
attribute float aScale;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

varying vec2 vUv;
varying vec3 vOffset;

void main() {

    vUv = uv;

    vec4 tPos = texture2D( uTexturePosition, aOffset.xy );
    vec4 tVel = texture2D( uTextureVelocity, aOffset.xy );

    vOffset = aOffset;

	vec3 displaced = tPos.xyz;

    vec3 pos = position;    

    vec4 mvPosition = modelViewMatrix * vec4( tPos.xyz, 1.0 );


    gl_PointSize = 0.5 * ( 2.5 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;

}