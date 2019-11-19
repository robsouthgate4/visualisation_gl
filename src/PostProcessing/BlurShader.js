import PP from './PP'

export default class BlurShader {

    constructor() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                texture: { type: 't', value: null },
                delta: { type: 'v2', value: new THREE.Vector2() }
            },
            vertexShader: [
                'varying vec2 vUv;',
                'void main() {',
                '	vUv = vec2( uv.x, uv.y );',
                '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '} '

            ].join('\n'),
            fragmentShader: [

                'varying vec2 vUv;',
                'uniform sampler2D texture;',
                'uniform vec2 delta;',

                'void main() {',
                "vec4 color = vec4( 0.0 );",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) - ( delta * 4.0 ) ) * 0.051;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) - ( delta * 3.0 ) ) * 0.0918;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) - ( delta * 2.0 ) ) * 0.12245;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) - delta ) * 0.1531;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) ) * 0.1633;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) + delta ) * 0.1531;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) + ( delta * 2.0 ) ) * 0.12245;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) + ( delta * 3.0 ) ) * 0.0918;",
                "color += texture2D( texture, vec2( vUv.x, vUv.y ) + ( delta * 4.0 ) ) * 0.051;",
                '	gl_FragColor = color;',
                '}'
            ].join('\n')

        })
    }

    setTexture(texture) {
        this.material.uniforms.texture.value = texture;
    }

    setDelta(x, y) {
        this.material.uniforms.delta.value.set(x, y);
    }

}

Object.assign(PP, {BlurShader})