attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float angle;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;

varying vec2 vUv;

void main() {
	// displacement

    vUv = uv;

    vec4 tPos = texture2D(uPositionTexture, offset.xy);

	vec3 displaced = tPos.xyz;

    vec3 pos = position;
    
    pos.xyz *= 0.005;
    //pos.x *= 0.001;

    vec4 mvPos = modelViewMatrix * vec4(pos + displaced, 1.0);
	gl_Position = projectionMatrix * mvPos;
}
