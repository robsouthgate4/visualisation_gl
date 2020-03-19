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
uniform mat4 viewMatrix;
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
varying vec4 clipSpace;

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

vec3 getWaveHeight(vec3 pos, vec3 rCenter, float wH, float wF, float wL) {

    float dist = distance(pos, rCenter);
    float distWave = distance(dist, wF);
    float rOffset = 0.0;

    if(distWave < wL) {
    
        float t = (dist - wF + wL)/wL; // 0 ~ waveLength * 2.0;
        rOffset = -cos(t*PI) + 1.0;
    }

    // rOffset = smoothstep(0.0, 1.0, rOffset);

    vec3 tmpPos = normalize(pos) * 1.0;
    return tmpPos * rOffset * wH;
}


void main() {

    

    vUv = uv;

    vec4 tPos = texture2D( uTexturePosition, aOffset.xy );

    vOffset = aOffset;

    vec3 pos = position;

    vPosition = pos.xyz;


    vDist = distance( uPoint, pos ); 

    // pos.y += sin( uTime * pos.x );

    vWorldPos = mat3( modelMatrix ) * position;

    vec4 refractWorldPos = modelMatrix * vec4( pos, 1.0 );

    // Sawtooth function to pulse from centre.

    float offset = (( uTime - floor( uTime ) ) / uTime) * 3.0;

	float currentTIme = uWaveTime;   

    vNormal = normal;

    vNoise = cnoise( 1.5 * position + ( uTime * 0.3 ) ) * 0.05;

    vNoise += ( uAmp * uWaveTime * 0.1);

    vec3 newPos = position + normal * vNoise;   

    float freq = 4.0 / ( uWaveTime * 0.3 ) * 0.1;

    float amp = max(uAmp * vDist, 0.1);

    float angle = ( ( currentTIme * 0.1 ) - vDist ) * freq;

    //pos = pos + normal * sin( angle ) * amp;    

    //pos = pos + normal * vNoise;

    pos = pos;

    // vNoiseWave = pos + normal * sin( angle ) * amp;

    vNoiseWave = pos + normal * sin( angle ) * amp;

    vWorldPos = mat3( modelMatrix ) * pos;

    e = normalize( vec3( modelViewMatrix * vec4( pos, 1.0 ) ) );
    
    n = normalize( normalMatrix * normal + sin( angle ) * amp * 0.4 );

    //n = normalize( normalMatrix * normal );

    vWorldNormal = normalize( mat3( modelMatrix ) * normalize( vNormal ) );

         

    vec4 mvPos = modelViewMatrix * vec4( pos , 1.0);


   

	gl_Position = projectionMatrix * mvPos;


    clipSpace = projectionMatrix * viewMatrix * refractWorldPos;

    
    
}

