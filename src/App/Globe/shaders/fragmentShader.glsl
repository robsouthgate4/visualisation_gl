

precision highp float;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTextureMatCap;
uniform float time;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vOffset;
varying vec3 vNormal;
varying vec3 vPosition;

uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 cameraPosition;

varying vec3 e;
varying vec3 n;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vUpdatedNormal;
varying float vNoise;
varying vec3 vNoiseWave;
varying float vDist;

#define PI 3.14159265359
#define TwoPI 6.28

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  //I assume envMap texture has been flipped the WebGL way (pixel 0,0 is a the bottom)
  //therefore we flip wcNorma.y as acos(1) = 0
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    //-1.0 for left handed coordinate system oriented texture (usual case)
    return envMapEquirect(wcNormal, -1.0);
}




void main() {

    vec3 ref = reflect( e, n );
    float m = 2. * sqrt( pow( ref.x, 2. ) + pow( ref.y, 2. ) + pow( ref.z + 1., 2. ) );
    vec2 vN = ref.xy / m + .5;

    vec2 uv = gl_FragCoord.xy / uResolution.xy;    

    vec3 I = normalize(vWorldPos - cameraPosition.xyz);
	float r = 0.01 + 3.0 * pow(1.0 + dot(I, vWorldNormal), 8.0);


    //vec3 envColor = texture2D( uTextureMatCap, envMapEquirect( vWorldNormal ) ).rgb;

    //vN += vNormal.xy * 0.05;

    vec3 envColor = texture2D( uTextureMatCap, vN ).rgb;

    envColor *= length(n);

    envColor *= vec3(1.0, .5, 0.5);

    vec3 color = mix( envColor, vec3(1.0), pow(length(n) * 0.6, 10.0));

    color += mix(vec3(0.0), vec3(0.45, 0.7, 1.0), r);

    //color += vDist;

    gl_FragColor = vec4( color, 1.0);

}