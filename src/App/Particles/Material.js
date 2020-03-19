import { RawShaderMaterial, DoubleSide, AdditiveBlending, ShaderMaterial, FrontSide, TextureLoader, Vector3, CubeTextureLoader} from "three";
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';

export default class Material extends RawShaderMaterial {

	constructor( particleCount ) {		

		const uniforms = {
			uTime: { value: 0.01 },
			uRandom: { value: 1.0 },
			uDepth: { value: 2.0 },
			uSize: { value: 1.0 },
			uTextureMatCap: { value: new TextureLoader().load( 'assets/images/matcap-green.jpg' ) },
			uResolution: { value: null },
			uPoint: { value: new Vector3(1,1,1) },
		};2

		super( { uniforms, vertexShader, fragmentShader, depthTest: true, depthFunc: true, transparent: true, side: FrontSide } );

	}

}