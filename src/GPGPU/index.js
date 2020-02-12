

import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import velocityFragment from './shaders/velocityFragment.glsl';
import positionFragment from './shaders/positionFragment.glsl';
import { ClampToEdgeWrapping } from 'three';

export default class GPGPU {

    constructor( { numParticles, renderer } ) {

        this.renderer = renderer;

        this.gpuCompute = new GPUComputationRenderer( Math.sqrt( numParticles ), Math.sqrt( numParticles ), renderer );

        const dtPosition = this.gpuCompute.createTexture();
        const dtVelocity = this.gpuCompute.createTexture();

        this.velocityVariable = this.gpuCompute.addVariable( "uTextureVelocity", velocityFragment, dtVelocity );
        this.positionVariable = this.gpuCompute.addVariable( "texturePosition", positionFragment, dtPosition );

        this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.positionVariable, this.velocityVariable ] );
        this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.positionVariable, this.velocityVariable ] );

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.velocityUniforms = this.velocityVariable.material.uniforms;

        this.positionUniforms[ "uTime" ] = { value: 0.0 };
        this.positionUniforms[ "uDelta" ] = { value: 0.0 };
        this.velocityUniforms[ "uTime" ] = { value: 0.0 };
        this.velocityUniforms[ "uDelta" ] = { value: 0.0 };

        this.velocityVariable.wrapS = ClampToEdgeWrapping;
        this.velocityVariable.wrapT = ClampToEdgeWrapping;
        this.positionVariable.wrapS = ClampToEdgeWrapping;
        this.positionVariable.wrapT = ClampToEdgeWrapping;

        var error = this.gpuCompute.init();

        if ( error !== null ) {

            console.error( error );

        }

    }

    addPass() {


    }

    compute( dt, time ) {

        this.positionUniforms[ "uTime" ].value = time;
        this.positionUniforms[ "uDelta" ].value = dt;
        this.velocityUniforms[ "uTime" ].value = time;
        this.velocityUniforms[ "uDelta" ].value = dt;

        // geoUniforms[ "texturePosition" ].value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
        // geoUniforms[ "textureVelocity" ].value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;
                
        this.gpuCompute.compute();

    }

}