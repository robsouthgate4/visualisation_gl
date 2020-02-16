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

void main() {

    vec3 finalColor = vec3(1, 1, 1);
    vec3 shadowColor = vec3(0, 0, 0);
    float shadowPower = 0.8;   

    // it just mixes the shadow color with the frag color

    gl_FragColor = vec4( mix(finalColor, shadowColor, (1.0 - getShadowMask() ) * shadowPower), 1.0);



    #include <fog_fragment>
    #include <dithering_fragment>   

}