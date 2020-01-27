
#pragma glslify: fbm3d = require('glsl-fractal-brownian-noise/3d') 
#pragma glslify: curlNoise = require('glsl-curl-noise') 


uniform float time;
uniform float dt;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureFlow;
uniform sampler2D uTextureParticle;

uniform float uMinTheta;
uniform float uMaxTheta;

uniform float uMinSpeed;
uniform float uMaxSpeed;

uniform vec2 uResolution;
uniform vec2 uOrigin;

uniform float uAge;
uniform float uGravity;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

varying vec2 vUv;



vec3 sphericalToCartesians( float radius, float theta, float phi ) {

			float x = radius * sin( theta ) * cos( phi );
			float y = radius * sin( theta ) * sin( phi );
			float z = radius * cos( theta );

			return vec3( x, y, z );

}

void main() {    

    float tTime = time;

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec3 oldVelocity = texture2D( uTextureVelocity, uv ).xyz;

    vec3 velocity = oldVelocity;

    vec3 oldPosition = texture2D( uTexturePosition, uv ).xyz;

    vec4 particleData = texture2D( uTextureParticle, uv );    

    // float theta = particleData.g;

    // float phi = particleData.b;

    // float thetaAdd = cnoise3( vec3( oldPosition.x * 3.0, oldPosition.y * 3.0, time * 0.1) );
    // float phiAdd = cnoise3( vec3( oldPosition.y * 3.0, oldPosition.z * 3.0, time * 0.1 ) );

    // theta += thetaAdd;
    // phi += phiAdd;


    // vec3 targetVelocity = sphericalToCartesians(1.0, theta, phi );

    //velocity = oldVelocity + targetVelocity;

    gl_FragColor = vec4( velocity , 1.0 );

}