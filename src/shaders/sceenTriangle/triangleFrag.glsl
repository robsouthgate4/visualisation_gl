varying vec2 vUv;

uniform sampler2D uTexture;

uniform vec2 uResolution;

void main() {

    vec2 st = vUv;

    vec3 color2 = texture2D( uTexture, st ).rgb;

  	gl_FragColor = vec4( color2, 1.0);

}