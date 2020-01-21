

uniform float time;
uniform float dt;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureFlow;

uniform float u_MinTheta;
uniform float u_MaxTheta;

uniform float u_MinSpeed;
uniform float u_MaxSpeed;

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

    vel.y = 0.1;

    gl_FragColor = vec4( vel, 1.0 );

}