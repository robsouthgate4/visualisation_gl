import { ShaderMaterial, FrontSide, TextureLoader, Vector3, DoubleSide, BackSide } from "three";
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';
import { Color } from "three/build/three.module";


export default class Material extends ShaderMaterial {

	constructor( particleCount ) {

		const uniforms = {
			uTime: { value: 0.01 },
			uRandom: { value: 1.0 },
			uResolution: { value: null },
			uColor1: { value: new Color( 'rgb( 25,	7, 50 )' ) },
			uColor2: { value: new Color( 'rgb( 19, 5, 23 )' ) }
		};

		super( { 
			uniforms,
			vertexShader,
			fragmentShader,
			depthTest: false,
			depthFunc: false,
			transparent: false,
			side: DoubleSide
		} );

	}

}