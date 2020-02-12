precision highp float;
uniform float uTime;
uniform sampler2D uTexturePosition;
uniform sampler2D uTexture;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {

    vec4 position = texture2D(uTexturePosition, vUv);
    vec4 velocity = texture2D(uTexture, vUv);

    // // Repulsion from mouse
    // vec2 toMouse = position.xy - uMouse;
    // float strength = smoothstep(0.3, 0.0, length(toMouse));
    // velocity.xy += strength * normalize(toMouse) * 0.5;

    // // Friction
    // velocity.xy *= 0.98;
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}
