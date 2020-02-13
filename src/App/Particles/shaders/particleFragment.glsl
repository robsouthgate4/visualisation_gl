#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <dithering_pars_fragment>


void main() {

    vec3 finalColor = vec3(1, 1, 1);
    vec3 shadowColor = vec3(0, 1, 0);
    float shadowPower = 1.0;   
    
    // it just mixes the shadow color with the frag color

    float shadowMask = getShadowMask();

    gl_FragColor = vec4( mix(finalColor, shadowColor, (1.0 - getShadowMask() ) * shadowPower), 1.0);


    #include <fog_fragment>
    #include <dithering_fragment>

}