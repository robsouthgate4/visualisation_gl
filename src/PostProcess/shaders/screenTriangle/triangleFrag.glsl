varying vec2 vUv;

uniform sampler2D uTexture;

uniform vec2 uResolution;

void main() {

    vec2 uv = vUv;

    vec3 color2 = texture2D( uTexture, uv ).rgb;

  	gl_FragColor = vec4( color2, 1.0);

}