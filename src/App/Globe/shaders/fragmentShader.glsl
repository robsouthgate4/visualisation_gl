

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

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec4 pos = texture2D( uTexturePosition, vOffset.xy );
    vec3 vel = texture2D( uTextureVelocity, vOffset.xy ).rgb;
    

    vec3 I = normalize(vWorldPos - cameraPosition.xyz);
	float r = 0.01 + 3.0 * pow(1.0 + dot(I, vWorldNormal), 6.0);


    vec3 envColor = texture2D( uTextureMatCap, envMapEquirect( vWorldNormal ) ).rgb;

    
	gl_FragColor = vec4( mix(vec3(0.0), vec3(0.45, 0.7, 1.0), r), 1.0);

    vec3 norm = normalize( vNormal );

    //gl_FragColor = vec4( vec3( vNoise ), 1.0);

}