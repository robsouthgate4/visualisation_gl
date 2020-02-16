varying vec2 vUv;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uResolution;

//RADIUS of our vignette, where 0.5 results in a circle fitting the screen
const float RADIUS = 0.6;

//softness of our vignette, between 0.0 and 1.0
const float SOFTNESS = 0.25;

void main() {

    vec2 center = ( gl_FragCoord.xy / uResolution.xy ) - vec2( 0.5 );

    float len = length( center );

    float vignette = smoothstep( RADIUS, RADIUS - SOFTNESS , len);

    vec3 color1 = texture2D( uTexture1, vUv ).xyz;
    vec3 color2 = texture2D( uTexture2, vUv ).xyz;

    vec3 sceneColor = color1 + color2 * 2.0;

    //sceneColor.rgb = mix(sceneColor.rgb, sceneColor.rgb * vignette, 0.5);

    gl_FragColor = vec4( sceneColor, 1.0 );
}