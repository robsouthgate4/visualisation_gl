precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTexturePosition;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 position = texture2D(uTexturePosition, uv);
    vec4 velocity = texture2D(uTextureVelocity, uv);

    // // Repulsion from mouse
    // vec2 toMouse = position.xy - uMouse;
    // float strength = smoothstep(0.3, 0.0, length(toMouse));
    // velocity.xy += strength * normalize(toMouse) * 0.5;

    // // Friction
    // velocity.xy *= 0.98;
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}
