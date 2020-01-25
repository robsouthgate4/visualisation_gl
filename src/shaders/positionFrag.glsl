#ifdef GL_ES
precision highp float;
#endif



uniform float time;
uniform float delta;
uniform sampler2D uBuffer;

uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;



vec4 live = vec4(0.0,1.0,0.0,1.);
vec4 dead = vec4(0.,0.,0.,1.);
vec4 blue = vec4(1.,0.,0.,1.);


void main() {    

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec2 pixel = 1.0 / uResolution.xy;

         
    float sum = 0.;
    sum += texture2D(uBuffer, uv + pixel * vec2(-1., -1.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(-1., 0.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(-1., 1.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(1., -1.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(1., 0.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(1., 1.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(0., -1.)).g;
    sum += texture2D(uBuffer, uv + pixel * vec2(0., 1.)).g;

    vec4 me = texture2D(uBuffer, uv);

    gl_FragColor = vec4( uv.x, uv.y, 0.0, 1.0 );

   
}