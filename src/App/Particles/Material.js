import { RawShaderMaterial, DoubleSide, AdditiveBlending } from "three";
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';


export default class Material extends RawShaderMaterial {

	constructor( particleCount ) {

		const uniforms = {
			uTime: { value: 0 },
			uRandom: { value: 1.0 },
			uDepth: { value: 2.0 },
			uSize: { value: 0.0 },
			uTexturePosition: { value: null },
			uTextureVelocity: { value: null },
			uResolution: { value: null },
		};

		super( { uniforms, vertexShader, fragmentShader, depthTest: false, depthFunc: false, transparent: true, side: DoubleSide, blending: AdditiveBlending } );

	}

}