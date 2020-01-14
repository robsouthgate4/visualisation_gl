#ifdef GL_ES
precision highp float;
#endif



uniform float time;
uniform float delta;
uniform sampler2D uTextureVelocity;
uniform sampler2D uTexturePosition;
uniform sampler2D uTexturePositionPrev;

uniform vec2 uResolution;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

varying vec2 vUv;


uniform vec2 uMouse;

vec4 live = vec4(0.0,1.0,0.0,1.);
vec4 dead = vec4(0.,0.,0.,1.);
vec4 blue = vec4(1.,0.,0.,1.);


void main() {    

    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 pixel = 1.0 / uResolution.xy;

    if ( length( uv - uMouse ) < 0.02 ) {

        gl_FragColor = vec4(0.8);
		
	} else
     {

        float sum = 0.;

        vec4 cl = texture2D(uTexturePosition, uv + pixel * vec2(-1., 0.));
        vec4 tc = texture2D(uTexturePosition, uv + pixel * vec2(0., -1.));
        vec4 cc = texture2D(uTexturePosition, uv + pixel * vec2(0., 0.));
        vec4 bc = texture2D(uTexturePosition, uv + pixel * vec2(0., 1.));
        vec4 cr = texture2D(uTexturePosition, uv + pixel * vec2(1., 0.));

        vec4 me = texture2D(uTexturePosition, uv);

        vec3 color = 8.0 * 0.016 * ( cl.rgb + cr.rgb + bc.rgb * 3.0 + tc.rgb - 6.0 * gl_FragColor.rgb );

        gl_FragColor = vec4( color, 1.0 );
            

    }

   
}