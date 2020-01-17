uniform float dt; 

uniform sampler2D inputTexture;

uniform sampler2D uTextureVelocity;

varying vec2 vUv;

void main() { 
    vec2 u = texture2D( uTextureVelocity, vUv ).xy; 

    vec2 pastCoord = fract( vUv - ( 0.5 * dt * u ) ); 

    gl_FragColor = texture2D( inputTexture, pastCoord ); 
} 