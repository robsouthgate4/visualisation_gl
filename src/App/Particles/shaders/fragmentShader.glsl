

precision highp float;

uniform sampler2D uVelocityTexture;
varying vec2 vUv;

void main() {
	vec3 N;

    N.xy = vUv * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

	
	vec4 color = vec4(1.0);
	gl_FragColor = color;
}