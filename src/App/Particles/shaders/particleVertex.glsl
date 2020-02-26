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
varying vec4 vPosition;
varying vec3 vVelocity;
varying vec4 vPrevPosition;

uniform mat4 uPrevProjectionMatrix;
uniform mat4 uPrevModelViewMatrix;



void main() {

    

    vec4 tPosition = texture2D( uTexturePosition, position.xy );
    vec4 tVelocity = texture2D( uTextureVelocity, position.xy );

    vVelocity = tVelocity.xyz;

    vLife = tPosition.w;

    vec4 worldPosition = modelMatrix * vec4( tPosition.xyz, 1.0 );     

    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 0.4 * ( 150.0 / -mvPosition.z );

    vWorldPosition = worldPosition;   
    
    
    vNormal = normal;

    e = normalize( vec3( modelViewMatrix * vec4( tPosition.xyz, 1.0 ) ) );

    n = normalize( normalMatrix * normal );

    // For motion blur

    vPosition = projectionMatrix * modelViewMatrix * vec4( tPosition.xyz, 1.0 );

    vPrevPosition = projectionMatrix * uPrevModelViewMatrix * vec4( tPosition.xyz, 1.0 );

    #include <shadowmap_vertex>

    #include <fog_vertex>

    vColor = aColor;

    gl_Position = projectionMatrix * mvPosition;

}
  