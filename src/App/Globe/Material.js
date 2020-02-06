import { RawShaderMaterial, DoubleSide, AdditiveBlending, ShaderMaterial, FrontSide, TextureLoader, Vector3 } from "three";
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
			uPoint: { value: new Vector3() },
			uAmp: { value: 0 },
			uWaveTime: { value: 0 }
		};

		super( { uniforms, vertexShader, fragmentShader, depthTest: true, depthFunc: true, transparent: true, side: FrontSide } );

	}

}