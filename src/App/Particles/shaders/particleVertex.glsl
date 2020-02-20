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

void main() {


    vec4 tPosition = texture2D( uTexturePosition, position.xy );
    vec4 tVelocity = texture2D( uTextureVelocity, position.xy );

    vLife = tPosition.w;

    vec4 worldPosition = modelMatrix * vec4( tPosition.xyz, 1.0 ); 

    

    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = 40.0 / length( mvPosition.xyz );

    vWorldPosition = worldPosition;
    
    gl_Position = projectionMatrix * mvPosition;
    
    vNormal = normal;

    //vWorldNormal = normalize( mat3( modelMatrix ) * normalize( normal ) );

    #include <shadowmap_vertex>

    #include <fog_vertex>

    vColor = aColor;

}
  