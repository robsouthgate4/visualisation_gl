#include <common>

#include <fog_pars_vertex>

#include <shadowmap_pars_vertex>

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

attribute vec2 aReference;
attribute vec3 aOffset;


void main() {

    #include <begin_vertex>

    vec4 tPosition = texture2D( uTexturePosition, aReference );
    vec4 tVelocity = texture2D( uTextureVelocity, aReference );

    vec4 mvPosition = modelViewMatrix * vec4( aOffset, 1.0 );

    gl_PointSize = 3. * ( 2.5 / -mvPosition.z );
    
    gl_Position = projectionMatrix * mvPosition;

    #include <worldpos_vertex>

    #include <shadowmap_vertex>

    #include <fog_vertex>

}
  