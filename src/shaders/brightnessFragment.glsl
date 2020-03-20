varying vec2 vUv;
uniform sampler2D uTexture;

void main() {

    vec3 color = texture2D( uTexture, vUv ).rgb;

    float brightness = dot( color.rgb, vec3(0.2126, 0.7152, 0.0722) );

    vec4 brightColor = vec4(0.0);

    if(brightness > 0.8)
        brightColor = vec4(color.rgb, 1.0);
    else
        brightColor = vec4(0.0, 0.0, 0.0, 1.0);

    gl_FragColor = brightColor;
}   