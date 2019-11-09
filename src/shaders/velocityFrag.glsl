uniform float time;
uniform float delta;

const float width = resolution.x;
const float height = resolution.y;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

float rand( vec2 co ){
    return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 selfPosition = texture2D(texturePosition, uv).xyz;
    vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;
    
    vec3 velocity = selfVelocity;

    gl_FragColor = vec4(velocity, 1.0);
}