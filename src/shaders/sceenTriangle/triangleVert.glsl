varying vec2 vUv;

const vec2 EPS = vec2(1.0 / 2048.0, 1.0 / 1024.0);

uniform vec2 side;

void main() {

 	vUv = vec2( 0.5 ) + ( position.xy ) * 0.5;

 	vUv = vUv + side * EPS * 0.5;

	gl_Position = vec4( position.xy, 0.0,  1.0 );
  
}