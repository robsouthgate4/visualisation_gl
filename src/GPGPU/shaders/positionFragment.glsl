precision highp float;
uniform float uTime;
uniform float uDelta;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 position = texture2D(uTexturePosition, uv);
    vec4 velocity = texture2D(uTextureVelocity, uv);

    // position.xy += velocity.xy * 0.01;
                    
    // // Keep in bounds
    // vec2 limits = vec2(1);
    // position.xy += (1.0 - step(-limits.xy, position.xy)) * limits.xy * 2.0;
    // position.xy -= step(limits.xy, position.xy) * limits.xy * 2.0;

    position.xyz += velocity.xyz * uDelta;

    gl_FragColor = position;

}