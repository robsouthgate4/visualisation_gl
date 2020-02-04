#pragma glslify: cnoise = require(glsl-noise/classic/3d)

attribute float pindex;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 aOffset;
attribute vec2 uv;
attribute float angle;
attribute float aScale;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;

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

vec3 getPosition( vec3 values ) {

    float rx = values.y / numSeg * PI - PI;
    float ry = values.x / numSeg * PI * 2.0;

    vec3 pos = vec3(0.0);
    pos.y = cos(rx) * values.z;
    float r = sin(rx) * values.z;
    pos.x = cos(ry) * r;
    pos.z = sin(ry) * r;

    return pos;

}

void main() {

    vUv = uv;

    vec4 tPos = texture2D( uTexturePosition, aOffset.xy );

    vOffset = aOffset;

    vec3 pos = position;

    vPosition = pos.xyz;


    // pos.y += sin( uTime * pos.x );

    vWorldPos = mat3( modelMatrix ) * position;

    

    vNormal = normal;

    vNoise = cnoise( 1.5 * position + ( uTime * 0.1 ) ) * 0.2;

    vec3 newPos = position + normal * vNoise;

    vWorldNormal = normalize( mat3( modelMatrix ) * normalize( vNormal ) );
         

    vec4 mvPos = modelViewMatrix * vec4( newPos , 1.0);

	gl_Position = projectionMatrix * mvPos;

    vWorldPos = mat3( modelMatrix ) * position + normal * vNoise;
    
}

