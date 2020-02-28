varying vec4 vPosition;
varying vec4 vPrevPosition;

void main( void ) {

    vec3 N;

    N.xy = gl_PointCoord * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle


    vec3 vel;

    vel = ( vPosition.xyz / vPosition.w ) - ( vPrevPosition.xyz / vPrevPosition.w );

    vel *= 3.0;

    gl_FragColor = vec4( vel, 1.0);

}
