
uniform float time;
uniform float delta;
varying vec2 vUv;

uniform sampler2D textureOrigins;

float sdSphere( vec3 p, float s )
{
  return length( p ) - s;
}

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

    //position -= sdSphere(position, 1.0);    

    vec3 pos = position + velocity * delta;

    gl_FragColor = vec4(pos, 1.0);

}