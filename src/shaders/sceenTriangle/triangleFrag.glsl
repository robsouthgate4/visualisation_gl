varying vec2 vUv;

uniform sampler2D texture;

void main() {

    float dist = distance(vUv, vec2( 0.5 ));

  	gl_FragColor = vec4( vec3( dist ), 1.0 );

}