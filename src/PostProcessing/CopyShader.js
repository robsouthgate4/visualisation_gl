import PP from "./PP";
import { ShaderMaterial } from "three";

export default class CopyShader {

	constructor() {

		this.material = new ShaderMaterial( {

			uniforms: {

                texture: { type: 't', value: null }
                
			},
			vertexShader: [

				'varying vec2 vUv;',

				'void main() {',
				'	vUv = uv;',
				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'} '

			].join( '\n' ),
			fragmentShader: [

				'varying vec2 vUv;',
				'uniform sampler2D texture;',

				'void main() {',
				'	gl_FragColor = texture2D( texture, vUv );',
				'}'

			].join( '\n' )

		} );

	}

	setTexture( texture ) {

		this.material.uniforms.texture.value = texture;

	}


}

Object.assign( PP, { CopyShader } );
