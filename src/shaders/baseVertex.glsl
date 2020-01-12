precision highp float;
precision mediump sampler2D;

varying vec2 vUv;

uniform vec2 uTexelSize;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main () {

    vUv = vec2(0.5) + ( position.xy ) * 0.5;

    gl_Position = vec4(position.xy, 0.0, 1.0);
    
}