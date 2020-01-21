#ifdef GL_ES
precision highp float;
#endif



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

uniform vec3 uOrigin;
uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;

uniform vec2 uMouse;


void main() {    

    vec2 pixel = 1.0 / uResolution.xy;

	vec3 vel = texture2D(uTextureVelocity, vUv).xyz;
    vec4 pos = texture2D(uTexturePosition, vUv).xyzw;

    vec4 origin = texture2D( uTextureOrigin, vUv );

	vec3 position = vec3(0.0);

    float age = pos.w;

    if ( age >= uLife ) {

        pos.xyz = vec3(0.0);

        age = 0.0;

    } else {

        age += 100.;

        position = pos.xyz + vel * dt;

    }

    gl_FragColor = vec4( position, age );
   
}