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
uniform sampler2D uTextureLife;

uniform vec3 uOrigin;
uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;

uniform vec2 uMouse;


void main() {


    vec2 pixel = 1.0 / uResolution.xy;   

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

	vec3 vel = texture2D(uTextureVelocity, uv).xyz;
    vec4 pos = texture2D(uTexturePosition, uv).xyzw;
    float life = texture2D(uTextureLife, uv).r;
    vec4 origin = texture2D( uTextureOrigin, uv );

	vec3 position = origin.xyz;

    float age = pos.w;  

    if ( age >= life ) {

        pos.xyz = origin.xyz;

        age = 0.0;
        //life = uLife;


    } else {

        age += dt;

        position = pos.xyz + vel * dt;

    }

    position = pos.xyz + vel * dt;

    //position = pos.xyz + vel * dt;

    gl_FragColor = vec4( position, age );
   
}
