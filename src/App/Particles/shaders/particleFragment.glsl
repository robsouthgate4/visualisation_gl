#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <dithering_pars_fragment>

const vec3 lightPosition = vec3( 100., 10., 0. );

varying vec4 vWorldPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vLife;

void main() {

     vec3 N;

    N.xy = gl_PointCoord * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

    N.z = sqrt(1.0-mag);

    vec3 finalColor = vec3(0.9, 0.9, 0.9);
    vec3 shadowColor = vec3(0.01, 0.01, 0.01);
    float shadowPower = 0.7;   

    // it just mixes the shadow color with the frag color

    float shadow = ( 1.0 - getShadowMask() ) * shadowPower;

    //gl_FragColor = vec4(vColor, 1.0);

    //finalColor *= N:

    gl_FragColor = vec4( mix( finalColor, shadowColor, shadow ), vLife - 1.0 );

    



    #include <fog_fragment>
    #include <dithering_fragment>   

}