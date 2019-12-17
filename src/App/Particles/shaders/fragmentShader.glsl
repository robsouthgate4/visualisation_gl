

precision highp float;

uniform sampler2D uVelocityTexture;
uniform float time;

varying vec2 vUv;

const vec3 lightPos = vec3(0.0, 0.0, 10.0);
varying vec3 vNormal;
varying vec3 vFragPos;

void main() {
	// vec3 N;

    vec3 lightColor = vec3(255. / 255., 255. / 255., 255. / 255.);

    vec3 norm = normalize( vNormal );
    vec3 lightDir = normalize( lightPos - vFragPos ); 

    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // N.xy = vUv * 2.0 - vec2(1.0);

    // float mag = dot(N.xy, N.xy);

    // if (mag > 1.0) discard;   // kill pixels outside circle

    // vec3 velocity = texture2D(uVelocityTexture, vUv).rgb;

	
    
	gl_FragColor = vec4( diffuse * vec3(0.9), 1.0);
}