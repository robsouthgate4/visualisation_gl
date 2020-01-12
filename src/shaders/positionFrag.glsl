
uniform float time;
uniform float delta;
uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;

uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

float get(float x, float y) {
    return texture2D( uTexturePosition, (gl_FragCoord.xy + vec2(x, y)) / vec2(1000., 1000.)).r;
}

void main() {    

    float sum = get(-1., -1.) +
              get(-1.,  0.) +
              get(-1.,  1.) +
              get( 0., -1.) +
              get( 0.,  1.) +
              get( 1., -1.) +
              get( 1.,  0.) +
              get( 1.,  1.);

              if (sum == 3.) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                } else if (sum == 2.) {
                    float current = get(0., 0.);
                    gl_FragColor = vec4(current, current, current, 1.0);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }

    // vec3 current = texture2D(uTexturePosition, vUv).rgb;

    // current *= 0.99;

    //gl_FragColor = vec4(current, 1.0);
}