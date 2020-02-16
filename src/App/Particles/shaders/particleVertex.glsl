#include <common>

#include <fog_pars_vertex>

#include <shadowmap_pars_vertex>

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

attribute vec3 aOffset;

varying vec4 vWorldPosition;
varying vec3 vNormal;


void main() {


    vec4 tPosition = texture2D( uTexturePosition, position.xy );
    vec4 tVelocity = texture2D( uTextureVelocity, position.xy );

    

    vec4 worldPosition = modelMatrix * vec4( tPosition.xyz, 1.0 );

    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 12.0 / length( mvPosition.xyz );

    vWorldPosition = worldPosition;
    
    gl_Position = projectionMatrix * mvPosition;
    
    vNormal = normal;

    #include <shadowmap_vertex>

    #include <fog_vertex>

}
  