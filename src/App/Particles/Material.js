import { ShaderMaterial, DoubleSide, NormalBlending, TextureLoa, NormalBlendingder, BackSide, FrontSide, Matrix4 } from "three";



import { UniformsLib } from 'three/src/renderers/shaders/UniformsLib';
import { mergeUniforms } from 'three/src/renderers/shaders/UniformsUtils';

import vertexShader from './shaders/particleVertex.glsl'
import fragmentShader from './shaders/particleFragment.glsl'

export default class Material extends ShaderMaterial {

    constructor( ) {

        const uniforms = mergeUniforms( [

            UniformsLib.lights,
            UniformsLib.fog,
            UniformsLib.shadowmap,
            {
                uTime: { value: 0 },
                uRandom: { value: 1.0 },
                uDepth: { value: 2.0 },
                uSize: { value: 0.0 },
                uPrevProjectionMatrix: { value: new Matrix4() },
                uPrevModelViewMatrix: { value: new Matrix4() },
                uTexturePrevPosition: { value: null },
                uTexturePosition: { value: null },
                uTextureVelocity: { value: null },
                uTextureParticle: { value: null },
                uTextureMatCap: { value: null },
                uTextureMatCap2: { value: null },
                uMaterialBlend: { value: null },
                uResolution: { value: null }
            }

        ] );

		super( { 

            uniforms,
            vertexShader,
            fragmentShader,
            depthTest: true,
            depthFunc: true,
            transparent: false,
            side: FrontSide,
            fog: true,
            lights: true,
            dithering: false,
            //blending: NormalBlending,
            depthWrite: true
        } );

	}

}