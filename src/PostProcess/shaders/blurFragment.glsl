varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uDelta;

void main() {
    vec4 color = vec4( 0.0 );
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) - ( uDelta * 4.0 ) ) * 0.051;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) - ( uDelta * 3.0 ) ) * 0.0918;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) - ( uDelta * 2.0 ) ) * 0.12245;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) - uDelta ) * 0.1531;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) ) * 0.1633;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) + uDelta ) * 0.1531;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) + ( uDelta * 2.0 ) ) * 0.12245;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) + ( uDelta * 3.0 ) ) * 0.0918;
    color += texture2D( uTexture, vec2( vUv.x, vUv.y ) + ( uDelta * 4.0 ) ) * 0.051;
	gl_FragColor = color;
}