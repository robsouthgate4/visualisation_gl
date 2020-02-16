import { ShaderMaterial, DoubleSide, NoBlending } from "three";

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
                uTexturePosition: { value: null },
                uTextureVelocity: { value: null },
                uTextureParticle: { value: null },
                uResolution: { value: null }
            }

        ] );

		super( { 

            uniforms,
            vertexShader,
            fragmentShader,
            depthTest: false,
            depthFunc: false,
            transparent: true,
            side: DoubleSide,
            fog: true,
            lights: true,
            dithering: true,
            blending: NoBlending,
            depthWrite: false
        } );

	}

}