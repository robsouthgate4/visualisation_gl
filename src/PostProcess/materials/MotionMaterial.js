import { ShaderMaterial, DoubleSide, NormalBlending, TextureLoa, NormalBlendingder, BackSide, FrontSide, Matrix4 } from "three";

import vertexShader from '../../PostProcess/shaders/motionVertex.glsl';
import fragmentShader from '../../PostProcess/shaders/motionFragment.glsl';

export default class Material extends ShaderMaterial {

    constructor( ) {

        const uniforms = {
            uPrevProjectionMatrix: { value: new Matrix4() },
            uPrevModelViewMatrix: { value: new Matrix4() },
            uTexturePosition: { value: null },
            uTexturePrevPosition: { value: null },
            uTime: { value: 0 },
            uRandom: { value: 1.0 },
            uDepth: { value: 2.0 },
            uSize: { value: 0.0 },
            uTextureVelocity: { value: null },
            uTextureParticle: { value: null },
            uTextureMatCap: { value: null },
            uResolution: { value: null },
            uMotionBlurAmount: { value: null }
        };

		super( { 

            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            side: DoubleSide,
            blending: NormalBlending,
            
        } );

	}

}