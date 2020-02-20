#include <common>

#include <fog_pars_vertex>

#include <shadowmap_pars_vertex>

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

attribute vec3 aColor;

varying vec4 vWorldPosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vColor;

varying float vLife;
varying vec3 e;
varying vec3 n;
varying vec3 vPosition;
varying vec3 vVelocity;

void main() {

    vPosition = position;

    vec4 tPosition = texture2D( uTexturePosition, position.xy );
    vec4 tVelocity = texture2D( uTextureVelocity, position.xy );

    vVelocity = tVelocity.xyz;

    vLife = tPosition.w;

    vec4 worldPosition = modelMatrix * vec4( tPosition.xyz, 1.0 ); 

    

    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 40.0 / length( mvPosition.xyz );

    vWorldPosition = worldPosition;
    
    gl_Position = projectionMatrix * mvPosition;
    
    vNormal = normal;

    e = normalize( vec3( modelViewMatrix * vec4( tPosition.xyz, 1.0 ) ) );

    n = normalize( normalMatrix * normal );

    #include <shadowmap_vertex>

    #include <fog_vertex>

    vColor = aColor;

}
  