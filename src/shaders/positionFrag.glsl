#ifdef GL_ES
precision highp float;
#endif



uniform float time;
uniform float delta;
uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform vec2 uMouse;
uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;



void main() {    

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec2 pixel = 1.0 / uResolution.xy;

    float sum = 0.;

    float current =  0.0;

    float prev = texture2D(uTexturePosition, uv).r;

    //current *= 0.99;

    gl_FragColor = vec4(uv, 0.0, 1.0);

   
}