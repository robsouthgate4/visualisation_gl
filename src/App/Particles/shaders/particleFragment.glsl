#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <dithering_pars_fragment>

const vec3 lightPosition = vec3( 0., -10., 0. );

varying vec4 vWorldPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vWorldNormal;
varying float vLife;

uniform sampler2D uTextureMatCap;

vec3 rgb( float r, float g, float b ) {

    return vec3( r / 255., g / 255., b / 255. );

}

void main() {

     vec3 N;

    N.xy = gl_PointCoord * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

    N.z = sqrt(1.0-mag);

    
    vec3 shadowColor = vec3(0.01, 0.01, 0.01);
    float shadowPower = 0.1;
    float specularStrength = 0.3;
    vec3 lightColor = vec3( 1.0 );
    vec3 finalColor = vec3( 0.0 );

    // // it just mixes the shadow color with the frag color

    float shadow = ( 1.0 - getShadowMask() ) * shadowPower;


    vec3 lightDir = normalize( lightPosition - vWorldPosition.xyz );

    float diff = max( dot( N, lightDir ), 0.0 );
    vec3 diffuse = diff * vec3( 0.4 );

    vec3 viewDir = normalize( cameraPosition - vWorldPosition.xyz );
    vec3 reflectDir = reflect( -lightDir, N);  

    float spec = pow( max( dot( viewDir, reflectDir ), 0.0 ), 8. );
    vec3 specular = specularStrength * spec * lightColor;  

    finalColor += ( diffuse * 0.5) + specular;

    gl_FragColor = vec4( finalColor, 1.0);

    



    #include <fog_fragment>
    #include <dithering_fragment>   

}