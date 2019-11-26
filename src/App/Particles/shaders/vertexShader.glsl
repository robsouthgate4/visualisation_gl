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


void main() {
	// displacement
	vec3 displaced = offset;
    vec3 pos = position;
    pos *= 0.01;
    vec4 mvPos = modelViewMatrix * vec4(pos + displaced, 1.0);
	gl_Position = projectionMatrix * mvPos;
}
