

import PP from './PP'

class MixShader {

    constructor() {
        this.material = new THREE.ShaderMaterial( {

            uniforms: {
                texture1: { type: 't', value: null },
                texture2: { type: 't', value: null }
            },
            vertexShader: [
    
                'varying vec2 vUv;',
    
                'void main() {',
                '	vUv = vec2( uv.x, uv.y );',
                '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '} '
    
            ].join( '\n' ),
            fragmentShader: [
    
                'varying vec2 vUv;',
                'uniform sampler2D texture1;',
                'uniform sampler2D texture2;',
    
                'void main() {',
                '	vec3 color1 = texture2D( texture1, vUv ).xyz;',
                '	vec3 color2 = texture2D( texture2, vUv ).xyz;',
                '	gl_FragColor = vec4( color1 + color2 * 1.5, 1.0 );',
                '}'
    
            ].join( '\n' )
    
        } )
    }

    setTextures( textureA, textureB ) {
        this.material.uniforms.texture1.value = textureA
        this.material.uniforms.texture2.value = textureB
    }

}

Object.assign(PP, { MixShader })