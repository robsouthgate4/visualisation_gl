precision highp float;
uniform float uTime;
uniform float uDelta;
uniform float uDieSpeed;

uniform sampler2D uTexturePositionOrigin;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionBuffer = texture2D( uTexturePosition, uv);
    vec3 position = positionBuffer.xyz;

    vec4 velocity = texture2D( uTextureVelocity, uv );

    float life = positionBuffer.w - uDieSpeed;

    if ( life < 0.0 ) {

        positionBuffer = texture2D( uTexturePositionOrigin, uv );
        position = positionBuffer.xyz;
        life = positionBuffer.w + sin( uTime );

    } else {

        position.xyz += velocity.xyz * uDelta;

    }

    // position.xy += velocity.xy * 0.01;
                    
    // // Keep in bounds
    // vec2 limits = vec2(1);
    // position.xy += (1.0 - step(-limits.xy, position.xy)) * limits.xy * 2.0;
    // position.xy -= step(limits.xy, position.xy) * limits.xy * 2.0;

    

    gl_FragColor = vec4( position, life );

}