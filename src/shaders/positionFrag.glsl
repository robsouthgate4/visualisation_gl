
uniform float time;
uniform float delta;
varying vec2 vUv;

uniform sampler2D textureOrigins;


void main() {

    vec2 st = gl_FragCoord.xy / resolution.xy;
    vec4 originPos = texture2D(textureOrigins, st);
    vec4 tempPos = texture2D(texturePosition, st);

    vec3 position = tempPos.xyz;
    vec3 velocity = texture2D(textureVelocity, st).xyz;

    if (position.y <= -1.3) {
        position.y = 2.0;
    }

    //vec3 position = originPos.xyz;

    gl_FragColor = vec4(position + velocity * delta, 1.0);

}