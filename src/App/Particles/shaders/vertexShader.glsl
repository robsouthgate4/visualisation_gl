#pragma glslify: cnoise = require(glsl-noise/classic/3d)

attribute float pindex;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 aOffset;
attribute vec2 uv;
attribute float angle;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;

uniform vec3 uPoint;
uniform float uAmp;
uniform float uWaveTime;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

varying vec2 vUv;
varying vec3 vOffset;
varying vec3 vNormal;
varying vec3 vPosition;

varying vec3 e;
varying vec3 n;

#define PI 3.14159265359
#define TwoPI 6.28

float numSeg = 10.0;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vUpdatedNormal;
varying float vNoise;
varying vec3 vNoiseWave;

varying float vDist;



void main() {

   

    vUv = uv;

    vOffset = aOffset;

    vec3 pos = position;

    vPosition = pos.xyz;

    vDist = distance( uPoint, pos ); 

    // pos.y += sin( uTime * pos.x );

    vWorldPos = mat3( modelMatrix ) * position;

    vNormal = normal;

    pos = pos;

    e = normalize( vec3( modelViewMatrix * vec4( pos, 1.0 ) ) );
    
    n = normalize( normalMatrix * normal );

    vec4 mvPos = modelViewMatrix * vec4( pos , 1.0);   

	gl_Position = projectionMatrix * mvPos;    
    
}

