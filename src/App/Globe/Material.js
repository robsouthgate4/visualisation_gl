import { RawShaderMaterial, DoubleSide, AdditiveBlending, ShaderMaterial, FrontSide, TextureLoader } from "three";
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
			uTextureMatCap: { value: new TextureLoader().load( 'assets/images/matcapHD.png' ) },
			uResolution: { value: null },
		};

		super( { uniforms, vertexShader, fragmentShader, depthTest: true, depthFunc: true, transparent: true, side: FrontSide } );

	}

}