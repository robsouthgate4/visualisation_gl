import { RawShaderMaterial, DoubleSide, UniformsUtils, UniformsLib, ShaderLib, Color } from "three";
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';


export default class Material extends RawShaderMaterial {

	constructor( particleCount ) {

		const uniforms = UniformsUtils.merge( [
			ShaderLib.phong.uniforms,
			{
				diffuse: {value: new Color( 0x2194ce )},
				wireframe: {value: true},
				shininess: { value: 2 },
				specular: { value: new Color( 0xffffff ) },
				isOrthographic: { value: false },
				uTime: { value: 0 },
				uRandom: { value: 1.0 },
				uDepth: { value: 2.0 },
				uSize: { value: 0.0 },
				uPositionTexture: { value: null },
				uVelocityTexture: { value: null }
			}
		] );

		super( { 
			uniforms, 
			vertexShader, 
			fragmentShader, 
			depthTest: true, 
			transparent: true, 
			side: DoubleSide, 
			lights: true,
		} );

		//this.uniforms.color.value = 0x2194ce;

	}

}
