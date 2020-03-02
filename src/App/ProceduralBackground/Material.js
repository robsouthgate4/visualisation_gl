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
			uColor1: { value: new Color( '#f4eeff' ) },
			uColor2: { value: new Color( '#a6b1e1' ) }
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