attribute float pindex;
attribute vec3 position;
attribute vec3 aOffset;
attribute vec2 uv;
attribute float angle;
attribute float aScale;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

varying vec2 vUv;
varying vec3 vOffset;

void main() {
	// displacement

    mat4 modelViewBB = modelViewMatrix;

    // First colunm.
    modelViewBB[0][0] = 1.0; 
    modelViewBB[0][1] = 0.0; 
    modelViewBB[0][2] = 0.0; 


    // Second colunm.
    modelViewBB[1][0] = 0.0; 
    modelViewBB[1][1] = 1.0; 
    modelViewBB[1][2] = 0.0; 


    // Thrid colunm.
    modelViewBB[2][0] = 0.0; 
    modelViewBB[2][1] = 0.0; 
    modelViewBB[2][2] = 1.0; 

    vUv = uv;

    vec4 tPos = texture2D( uTexturePosition, aOffset.xy );

    vOffset = aOffset;

	vec3 displaced = tPos.xyz;

    vec3 pos = position;

    pos *= ( aScale * 1.5 );
    
    pos.xyz *= 0.002;
    //pos.x *= 0.001;

    vec4 mvPos = modelViewMatrix * vec4( pos + displaced , 1.0);

	gl_Position = projectionMatrix * mvPos;
}