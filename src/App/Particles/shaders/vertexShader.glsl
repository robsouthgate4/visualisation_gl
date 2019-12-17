attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float angle;
attribute float scale;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;

varying vec2 vUv;
varying vec3 vFragPos; 
varying vec3 vNormal;

vec3 applyQuaternionToVector( vec4 q, vec3 v ){
			return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
		}

void main() {

	// displacement

    vUv = uv;

    vec4 tPos = texture2D(uPositionTexture, offset.xy);
    vec4 tVel = texture2D(uVelocityTexture, offset.xy);

	vec3 displaced = tPos.xyz;

    vec3 pos = position;

    
    //pos.x *= 0.001;

    vec3 vPosition = applyQuaternionToVector( vec4(vec3(tVel), 1.0), pos );

    vPosition *= (scale * 1.5);
    
    vPosition.xyz *= 0.005;

    vec4 mvPos = modelViewMatrix * vec4( vPosition + displaced, 1.0);

	gl_Position = projectionMatrix * mvPos;

    vFragPos = vec3( modelMatrix * vec4( vPosition + displaced, 1.0) );
    vNormal = normal;
}
