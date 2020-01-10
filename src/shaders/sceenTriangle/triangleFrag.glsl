varying vec2 vUv;

uniform sampler2D uTexture;

void main() {

    float dist = distance( vUv, vec2( 0.5 ) );

    vec4 color = texture2D( uTexture, vUv );

  	gl_FragColor = vec4( vUv.x, 0.0, vUv.y, 1.0 );

}