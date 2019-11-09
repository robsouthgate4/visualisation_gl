
uniform float time;
uniform float delta;
varying vec2 vUv;


void main() {

    vec2 st = gl_FragCoord.xy / resolution.xy;
    vec4 tempPos = texture2D(texturePosition, st);
    vec3 position = tempPos.xyz;
    vec3 velocity = texture2D(textureVelocity, st).xyz;

    gl_FragColor = vec4(position + velocity * delta, 1.0);

}