#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <dithering_pars_fragment>

const vec3 lightPosition = vec3( 0., -10., 0. );


uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;
uniform sampler2D uTextureMatCap;
uniform sampler2D uTextureMatCap2;

uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;

varying vec4 vWorldPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vWorldNormal;
varying vec4 vPosition;
varying float vLife;
varying vec3 e;
varying vec3 n;

varying vec3 vVelocity;

uniform float uMaterialBlend;

uniform vec3 shadowColor; // ms({ value: '#ff0000' })

vec3 rgb( float r, float g, float b ) {

    return vec3( r / 255., g / 255., b / 255. );

}

void main() {

    vec3 N;

    N.xy = gl_PointCoord * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

    N.z = sqrt(1.0-mag);

    float shadowPower = 0.2;
    float specularStrength = 1.0;

    vec3 lightColor = vec3( 1.0 );

    vec3 ref = reflect( e, N );
    float m = 2. * sqrt( pow( ref.x, 2. ) + pow( ref.y, 2. ) + pow( ref.z + 1., 2. ) );
    vec2 vN = ref.xy / m + .5;

    vec3 envColor = texture2D( uTextureMatCap, vN ).rgb;
    vec3 envColor2 = texture2D( uTextureMatCap2, vN ).rgb;

    // envColor.r += 0.1;

    // envColor *= 0.7;

    vec3 finalEnvColor = mix( envColor, envColor2, uMaterialBlend );
  
    vec3 finalColor = mix( finalEnvColor, finalEnvColor * 0.8, length( vVelocity ) );//rgb( 25.0, 13.0, 0.0);

    // // it just mixes the shadow color with the frag color

    float shadow = ( 1.0 - getShadowMask() ) * shadowPower;

    // //gl_FragColor = vec4(vColor, 1.0);

    // vec3 lightDir = normalize( lightPosition - vWorldPosition.xyz );

    // float diff = max( dot( N, lightDir ), 0.0 );
    // vec3 diffuse = diff * vec3( 0.4 );

    // vec3 viewDir = normalize( cameraPosition - vWorldPosition.xyz );
    // vec3 reflectDir = reflect( -lightDir, N);  

    // float spec = pow( max( dot( viewDir, reflectDir ), 0.0 ), 32.0 );
    // vec3 specular = specularStrength * spec * lightColor;  

    // finalColor += ( diffuse * 0.1) + specular;

    gl_FragColor = vec4( mix( finalColor, shadowColor, shadow ), 1.0);

    



    #include <fog_fragment>
    #include <dithering_fragment>   

}