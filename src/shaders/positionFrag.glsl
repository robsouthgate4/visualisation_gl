
uniform float time;
uniform float delta;
uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;


void main() {    

    vec4 vel = texture2D( uTextureVelocity, vUv );

    vec4 pos = texture2D( uTexturePosition, vUv );   

    pos += vel;

    gl_FragColor = pos;
}