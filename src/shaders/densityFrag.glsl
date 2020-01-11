

uniform float time;
uniform float delta;

uniform sampler2D uTextureVelocity;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;

void main() {    

    vec3 acceleration = vec3( 0. );
 
    gl_FragColor = vec4( vec3( 1.0, 0.0, 0.0 ), 1.0 );
}