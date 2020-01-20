#ifdef GL_ES
precision highp float;
#endif



uniform float time;
uniform float dt;

uniform float u_MinTheta;
uniform float u_MaxTheta;

uniform float u_MinSpeed;
uniform float u_MaxSpeed;

uniform float u_Age;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureOrigin;

uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;

uniform vec2 uMouse;


void main() {    

    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 pixel = 1.0 / uResolution.xy;

	vec3 vel = texture2D(uTextureVelocity, uv).xyz;
    vec3 pos = texture2D(uTexturePosition, uv).xyz;

	vec3 color = pos + vel * dt;

    gl_FragColor = vec4( color, u_Age );
   
}