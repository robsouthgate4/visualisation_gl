

precision highp float;

uniform sampler2D uVelocityTexture;
uniform float time;

varying vec2 vUv;

void main() {
	vec3 N;

    N.xy = vUv * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

    vec3 velocity = texture2D(uVelocityTexture, vUv).rgb;

	vec3 color = vec3(246. / 255.,	226. / 255., 127. / 255.);
    
	gl_FragColor = vec4(color, 1.0);
}