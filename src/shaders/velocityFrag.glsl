

uniform float time;
uniform float dt;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureFlow;

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

void main() {

    vec3 vel = texture2D( uTextureVelocity, vUv ).xyz;

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec2 noiseCoord = uv;
    vec2 rand = texture2D(uTextureFlow, noiseCoord).rg;

    float theta = uMinTheta + rand.r * ( uMaxTheta - uMinTheta );
    float x = cos(theta);
    float y = sin(theta);

    //vel.y = 0.1;

    gl_FragColor = vec4( vec3( rand.r * 2.0 - 1.0, rand.g, 0.0 ) , 1.0 );

}