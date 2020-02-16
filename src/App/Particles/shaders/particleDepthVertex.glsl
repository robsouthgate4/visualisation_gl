#include <common>

#include <fog_pars_vertex>

#include <shadowmap_pars_vertex>

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

attribute vec3 aOffset;

varying vec4 vWorldPosition;
varying vec3 vNormal;


void main() {

    #include <begin_vertex>

    vec4 tPosition = texture2D( uTexturePosition, position.xy );
    vec4 tVelocity = texture2D( uTextureVelocity, position.xy );

    vec4 mvPosition = modelViewMatrix * vec4( tPosition.xyz, 1.0 );

    gl_PointSize = 0.0001 * ( 2.5 / -mvPosition.z );
    
    gl_Position = projectionMatrix * mvPosition;

    #include <worldpos_vertex>
    
    vNormal = normal;

    #include <shadowmap_vertex>

    //vWorldPosition = worldPosition;

    #include <fog_vertex>

}
  