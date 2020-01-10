#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)


uniform float time;
uniform float delta;

const float width = resolution.x;
const float height = resolution.y;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

void main() {    

    vec2 uv = gl_FragCoord.xy / resolution.xy;    

    vec3 selfPosition = texture2D(texturePosition, uv).xyz;

    vec3 acceleration = vec3( 0. );
    
    //vec3 velocity = curlNoise( selfPosition ) * (0.5 * sin( time ));

    vec3 velocity = vec3( 1.0 );

    gl_FragColor = vec4(velocity, 1.0);
}