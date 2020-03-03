uniform sampler2D uTexture;
uniform sampler2D uTextureVelocity;
   
uniform float uVelocityScale;
uniform vec2 uResolution;
varying vec2 vUv;


void main( void ) {

    vec2 texelSize = vec2( 1.0 ) / uResolution;
    vec4 color = texture2D( uTexture, vUv );
    vec2 screenTexCoords = vUv;

    vec2 velocity = texture2D( uTextureVelocity, screenTexCoords ).rg;

    velocity *= 1.0;

    //velocity.rg = clamp( velocity.rg, vec2(0.0), vec2(1.0) );

    float speed = length( velocity / texelSize );


    const int nSamples = 40;

    vec4 result = texture2D( uTexture, screenTexCoords);

    vec2 offset = vec2(0.0);

    for ( int i = 1; i < nSamples; i++ ) {

        offset = velocity.rg * ( float( i ) / ( float( nSamples ) - 1.0 ) - 0.5 );

        result += texture2D( uTexture, screenTexCoords + offset );

    }

    result /= float( nSamples );

    gl_FragColor = vec4( result.rgb, 1.0) ;

}