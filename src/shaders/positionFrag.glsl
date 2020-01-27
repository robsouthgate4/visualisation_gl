#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)
#pragma glslify: pnoise3 = require(glsl-noise/periodic/3d)
#pragma glslify: curlNoise = require('glsl-curl-noise') 

uniform float time;
uniform float dt;

uniform float uMinTheta;
uniform float uMaxTheta;

uniform float uMinSpeed;
uniform float uMaxSpeed;

uniform float uAge;
uniform float uLife;

uniform float uGravity;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureOrigin;
uniform sampler2D uTextureParticle;
uniform sampler2D uTextureFlow;

uniform vec3 uOrigin;
uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;

uniform vec2 uMouse;

vec3 sphericalToCartesians( float radius, float theta, float phi ) {

        float x = radius * sin( theta ) * cos( phi );
        float y = radius * sin( theta ) * sin( phi );
        float z = radius * cos( theta );

        return vec3( x, y, z );
}


void main() {


    vec2 pixel = 1.0 / uResolution.xy;   

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

	//vec3 vel = texture2D(uTextureVelocity, uv).xyz;

    vec4 prevPos = texture2D(uTexturePosition, uv).xyzw;

    float life = texture2D(uTextureParticle, uv).r;

    vec4 origin = texture2D( uTextureOrigin, uv );

    vec4 particleData = texture2D( uTextureParticle, uv );    

    float theta = particleData.g;

    float phi = particleData.b;

	vec3 pos = origin.xyz;
    
    float age = prevPos.w;    

     vec2 rand = texture2D(uTextureFlow, uv).rg; 

    vec3 position = prevPos.xyz;


    float thetaAdd = cnoise3( vec3( position.x * 6.0, position.y * 6.0, time * 0.2) );
    float phiAdd = cnoise3( vec3( position.y * 6.0, position.z * 6.0, time * 0.2 ) );

    theta += thetaAdd;
    phi += phiAdd;
   

    vec3 targetPos = sphericalToCartesians( -1.0 , theta, phi );   

   
    vec3 newPos = normalize( targetPos ) * 0.3;

    // if ( age >= life ) {

    //     pos.xyz = origin.xyz;

    //     age = 0.0;


    // } else {

    //     age += dt;        

    //     pos += newPos;

    //     //pos = clamp( pos, vec3(-1.0), vec3(1.0) );

    // }

    pos += newPos;

  

  


    gl_FragColor = vec4( pos, age );
   
}
