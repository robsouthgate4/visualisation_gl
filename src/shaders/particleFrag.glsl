

varying vec2 vUv;
varying mat4 vMMatrix;
varying vec4 vWorldPosition;

uniform float time;
uniform float delta;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform sampler2D map;

vec3 lightDir = vec3(10.0, 10.0, 10.0);

const float Ns = 32.0;

#define PI 3.14

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / (PI * 2.0), phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}

void main() {
    vec3 N;
    N.xy = gl_PointCoord * 2.0 - vec2(1.0);
    float mag = dot(N.xy, N.xy);
    if (mag > 1.0) discard;   // kill pixels outside circle
    N.z = sqrt(1.0-mag);

    vec4 pos = texture2D(texturePosition, vUv);

    vec3 lightVector = normalize(lightDir - vWorldPosition.xyx);

    // lightDir.x = sin(time * 0.5) * 50.0;
    // lightDir.z = cos(time * 0.5) * 50.0;

    float diffuse = max(0.0, dot(lightVector, N));

    vec3 worldNormal = vec4(vMMatrix * vec4( N, 0.0 )).xyz;

    vec3 env = texture2D(map, envMapEquirect(worldNormal)).rgb;    

    vec3 eye = vec3 (0.0, 0.0, 1.0);
    vec3 halfVector = normalize( eye + lightVector);
    float spec = max( pow(dot(N,halfVector), Ns), 0.); 
    
    gl_FragColor = vec4( vec3(0.8) * env * diffuse + spec ,1.0);
}