

precision highp float;

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

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
uniform sampler2D uEnvMap;
uniform sampler2D uEnvMapMask;
uniform samplerCube uReflectEnvMap;
uniform float uRefractAmount;

varying vec3 e;
varying vec3 n;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vUpdatedNormal;
varying float vNoise;
varying vec3 vNoiseWave;
varying float vDist;


varying vec4 clipSpace;

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


float fresnel( vec3 eyeToSurfaceDir, vec3 worldNormal, float power ) {

    return pow( 1.0 + dot( eyeToSurfaceDir, worldNormal ), power );

}

void main() {

    vec2 ndc = ( clipSpace.xy / clipSpace.w ) / 2.0 + 0.5;

    vec2 refractTexCoords = vec2( ndc.x, ndc.y );

    vec3 ref = reflect( e, n );
    float m = 2. * sqrt( pow( ref.x, 2. ) + pow( ref.y, 2. ) + pow( ref.z + 1., 2. ) );
    vec2 vN = ref.xy / m + .5;

    vec2 uv = gl_FragCoord.xy / uResolution.xy;             

    vec3 I = normalize(vWorldPos - cameraPosition.xyz);
	  float r = 0.01 + 3.0 * pow(1.0 + dot(I, vWorldNormal), 8.0);

    vec3 worldNormal = normalize( vWorldNormal );
    vec3 eyeToSurfaceDir = normalize( vWorldPos - cameraPosition );
    vec3 reflectDirection = reflect( eyeToSurfaceDir, worldNormal );
    vec3 refractDirection = refract( eyeToSurfaceDir, worldNormal, uRefractAmount / 1.33 );


    vec3 refracted = refract( eyeToSurfaceDir, worldNormal, uRefractAmount / 1.33  );

    float rimDist = fresnel( eyeToSurfaceDir, worldNormal, 1.0 );

    refractTexCoords -= ( worldNormal.xy  * rimDist ) * 0.08;

    vec3 envColorRefract = texture2D( uEnvMap, refractTexCoords ).rgb;

    vec3 envColorRefractBg = textureCube( uReflectEnvMap, refractDirection ).rgb;
    vec3 envColorReflect = textureCube( uReflectEnvMap, reflectDirection ).rgb;

    vec3 color = vec3( 0.5 );

    vec3 bgColor = envColorRefractBg * 0.1;

    vec4 maskColor = texture2D( uEnvMapMask, refractTexCoords);

    bgColor = mix( bgColor, envColorRefract, maskColor.r );

    envColorReflect.b += 0.3;

    bgColor += (envColorReflect * 0.3);

    float blueRimDist = fresnel( eyeToSurfaceDir, worldNormal, 6.0 );

    bgColor += (vec3( 0.5, 0.5, 1.0 ) * blueRimDist) * 0.9;

    gl_FragColor = vec4( bgColor, 1.0);

}