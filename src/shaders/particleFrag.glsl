

varying vec2 vUv;
varying mat4 vMMatrix;
varying vec4 vWorldPosition;
varying float vDepth;

uniform float time;
uniform float delta;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D map;

vec3 lightDir = vec3(-50.0, -50.0, 40.0);

const float Ns = 32.;

#define PI 3.14

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / (PI * 2.0), phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}

vec4 pack1K ( float depth ) {

   depth /= 1000.0;
   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
   const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
   vec4 res = fract( depth * bitSh );
   res -= res.xxyz * bitMsk;
   return res;

}

void main() {

    vec3 N;

    N.xy = gl_PointCoord * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

    N.z = sqrt(1.0-mag);

    vec4 pos = texture2D(texturePosition, vUv);
    vec4 velocity = texture2D(textureVelocity, vUv);
    vec3 lightVector = normalize(lightDir - vWorldPosition.xyx);

    float diffuse = max(0.0, dot(lightVector, N));
    vec3 worldNormal = vec4(vMMatrix * vec4( N, 0.0 )).xyz;
    vec3 env = texture2D(map, envMapEquirect(worldNormal)).rgb;    

    vec3 eye = vec3 (0.0, 0.0, 1.0);
    vec3 halfVector = normalize( eye + lightVector);
    float spec = max( pow(dot(N,halfVector), Ns), 0.);

    vec3 col1 = vec3(246. / 255.,	226. / 255.,	127. / 255.);
    vec3 col2 = vec3(255. / 255., 119. / 255., 155. / 255.);
    vec3 col3 = vec3(50. / 255., 119. / 255., 255. / 255.);

    vec3 col = col1 * 0.5;

    // if(velocity.x > 0.5) {
    //   col = col1;
    // } else {
    //   col = col2;
    // }
    
    gl_FragColor = vec4(col, 1.0);

    //gl_FragColor = pack1K(vDepth);

}