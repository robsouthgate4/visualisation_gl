precision highp float;
uniform float uTime;
uniform sampler2D uTextureVelocity;
// Default texture uniform for GPGPU pass is 'uTexture'.
// Can use the textureUniform parameter to update.
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {

    vec4 position = texture2D(uTexture, vUv);
    vec4 velocity = texture2D(uTextureVelocity, vUv);

    // position.xy += velocity.xy * 0.01;
                    
    // // Keep in bounds
    // vec2 limits = vec2(1);
    // position.xy += (1.0 - step(-limits.xy, position.xy)) * limits.xy * 2.0;
    // position.xy -= step(limits.xy, position.xy) * limits.xy * 2.0;
    gl_FragColor = position;

}