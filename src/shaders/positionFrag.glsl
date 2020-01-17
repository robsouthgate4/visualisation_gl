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

const int   ARROW_V_STYLE = 1;
const int   ARROW_LINE_STYLE = 1;

// Choose your arrow head style
const int   ARROW_STYLE = ARROW_LINE_STYLE;
const float ARROW_TILE_SIZE = 16.0;

// How sharp should the arrow head be? Used
const float ARROW_HEAD_ANGLE = 45.0 * PI / 180.0;

// Used for ARROW_LINE_STYLE
const float ARROW_HEAD_LENGTH = ARROW_TILE_SIZE / 6.0;
const float ARROW_SHAFT_THICKNESS = 0.5;
	


// Computes the center pixel of the tile containing pixel pos
vec2 arrowTileCenterCoord(vec2 pos) {
	return (floor(pos / ARROW_TILE_SIZE) + 0.5) * ARROW_TILE_SIZE;
}


// v = field sampled at tileCenterCoord(p), scaled by the length
// desired in pixels for arrows
// Returns 1.0 where there is an arrow pixel.
float arrow(vec2 p, vec2 v) {
	// Make everything relative to the center, which may be fractional
	p -= arrowTileCenterCoord(p);
		
    float mag_v = length(v), mag_p = length(p);
	
	if (mag_v > 0.0) {
		// Non-zero velocity case
		vec2 dir_p = p / mag_p, dir_v = v / mag_v;
		
		// We can't draw arrows larger than the tile radius, so clamp magnitude.
		// Enforce a minimum length to help see direction
		mag_v = clamp(mag_v, 5.0, ARROW_TILE_SIZE / 2.0);

		// Arrow tip location
		v = dir_v * mag_v;
		
		// Define a 2D implicit surface so that the arrow is antialiased.
		// In each line, the left expression defines a shape and the right controls
		// how quickly it fades in or out.

		float dist;		
		if (ARROW_STYLE == ARROW_LINE_STYLE) {
			// Signed distance from a line segment based on https://www.shadertoy.com/view/ls2GWG by 
			// Matthias Reitinger, @mreitinger
			
			// Line arrow style
			dist = 
				max(
					// Shaft
					ARROW_SHAFT_THICKNESS / 4.0 - 
						max(abs(dot(p, vec2(dir_v.y, -dir_v.x))), // Width
						    abs(dot(p, dir_v)) - mag_v + ARROW_HEAD_LENGTH / 2.0), // Length
						
   			         // Arrow head
					 min(0.0, dot(v - p, dir_v) - cos(ARROW_HEAD_ANGLE / 2.0) * length(v - p)) * 2.0 + // Front sides
					 min(0.0, dot(p, dir_v) + ARROW_HEAD_LENGTH - mag_v)); // Back
		} else {
			// V arrow style
			dist = min(0.0, mag_v - mag_p) * 2.0 + // length
				   min(0.0, dot(normalize(v - p), dir_v) - cos(ARROW_HEAD_ANGLE / 2.0)) * 2.0 * length(v - p) + // head sides
				   min(0.0, dot(p, dir_v) + 1.0) + // head back
				   min(0.0, cos(ARROW_HEAD_ANGLE / 2.0) - dot(normalize(v * 0.33 - p), dir_v)) * mag_v * 0.8; // cutout
		}
		
		return clamp(1.0 + dist, 0.0, 1.0);
	} else {
		// Center of the pixel is always on the arrow
		return max(0.0, 1.2 - mag_p);
	}
}

/////////////////////////////////////////////////////////////////////

// The vector field; use your own function or texture
vec2 field(vec2 pos) {
	//return vec2( sin(2. * PI * pos.y), sin(2. * PI * pos.x));

	// Examples:
//return 2.0 * texture(iChannel1, mod(pos, 2.0 * iChannelResolution[1].xy) * 0.5 / iChannelResolution[1].xy).xy - 1.0;
//	return 2.0 * texture(iChannel0, (pos + vec2(iTime * 100.0, 0.0)) / iChannelResolution[0].xy).xy - 1.0;
//	return vec2(0.0, 0.0);
    
    
//return vec2(
    //sin(pos.y * 0.057 * (2.0 * PI) ), sin(pos.x * 0.057 * (2.0 * PI)));

    float newTime = time * 10.0;
    
    return vec2( 1.0, 0.0 );
    
}


void main() {    

    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 pixel = 1.0 / uResolution.xy;

     float dist = length( uv - uMouse  );
    float col = 1.0 - smoothstep( dist, 0.01, 0.011 );

    vec3 circle  = vec4(vec3(col), 1.0).rgb;
		

    float sum = 0.;

    vec4 cl = texture2D(uTexturePosition, uv + pixel * vec2(-1., 0.));
    vec4 tc = texture2D(uTexturePosition, uv + pixel * vec2(0., -1.));
    vec4 cc = texture2D(uTexturePosition, uv + pixel * vec2(0., 0.));
    vec4 bc = texture2D(uTexturePosition, uv + pixel * vec2(0., 1.));
    vec4 cr = texture2D(uTexturePosition, uv + pixel * vec2(1., 0.));

    vec4 me = texture2D(uTexturePosition, uv);

    float damping = 0.999;

    vec3 color = 8.0 * 0.016 * ( cl.rgb + cr.rgb + bc.rgb * 3.0 + tc.rgb - 6.0 * gl_FragColor.rgb );

    color += circle * damping;

    gl_FragColor = vec4( vec3( uv.x, uv.y, 0.0 ), 1.0 );
            
    gl_FragColor += (1.0 - arrow(gl_FragCoord.xy, field(arrowTileCenterCoord(gl_FragCoord.xy)) * ARROW_TILE_SIZE * 0.4)) * vec4(1.0, 1.0, 1.0, 1.0);
   
}