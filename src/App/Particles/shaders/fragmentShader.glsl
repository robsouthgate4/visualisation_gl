

precision highp float;

uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform float time;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vOffset;

void main() {
	vec3 N;

    N.xy = vUv * 2.0 - vec2(1.0);

    float mag = dot(N.xy, N.xy);

    if (mag > 1.0) discard;   // kill pixels outside circle

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec4 pos = texture2D( uTexturePosition, vOffset.xy );
    vec3 vel = texture2D( uTextureVelocity, vOffset.xy ).rgb;

	vec3 color1 = vec3(255. / 255.,	51. / 255., 0. / 255.);
    vec3 color2 = vec3(255. / 255., 31. / 255., 0.0 / 255.);

    vec3 color = mix( color1, color2, vel.z );
    
	gl_FragColor = vec4(color, 1.0);
}