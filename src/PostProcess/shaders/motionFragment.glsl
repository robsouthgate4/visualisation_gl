varying vec4 vPosition;
varying vec4 vPrevPosition;

void main(void) {

    vec3 vel;

    vel = ( vPosition.xyz / vPosition.w ) - ( vPrevPosition.xyz / vPrevPosition.w );

    gl_FragColor = vec4( vel, 1.0);

}
