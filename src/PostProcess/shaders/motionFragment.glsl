varying vec4 vPosition;
varying vec4 vPrevPosition;
uniform float uMotionBlurAmount;

void main( void ) {

    vec3 N;

    N.xy = gl_PointCoord * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle


    vec3 vel;

    vel = ( vPosition.xyz / vPosition.w ) - ( vPrevPosition.xyz / vPrevPosition.w );

    vel = clamp(vel, vec3(0.0), vec3(0.1));

    vel *= uMotionBlurAmount;
    

    gl_FragColor = vec4( vel, 1.0);

}
