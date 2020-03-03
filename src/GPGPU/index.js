

import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import velocityFragment from './shaders/velocityFragment.glsl';
import positionFragment from './shaders/positionFragment.glsl';
import { ClampToEdgeWrapping, RepeatWrapping, IcosahedronGeometry, Vector3 } from 'three';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils';

import FBOHelper from '../libs/THREE.FBOHelper';

import Gui from '../Engine/Gui'


export default class GPGPU {

    constructor( { numParticles, renderer, fboHelper } ) {

        this.settings = {

            uDieSpeed: 0.002,
            velocity: 1,
            noiseScale: 0

        }

        this.renderer = renderer;

        this.fboHelper = fboHelper;

        this.gpuCompute = new GPUComputationRenderer( Math.sqrt( numParticles ), Math.sqrt( numParticles ), this.renderer );

        this.controller3 = Gui.gui.add(  this.settings, 'velocity', 0, 1);
        this.controller4 = Gui.gui.add(  this.settings, 'noiseScale', 0, 1);

        this.dtPosition = this.gpuCompute.createTexture();
		const posArray = this.dtPosition.image.data;

		this.dtVelocity = this.gpuCompute.createTexture();
		const velArray = this.dtVelocity.image.data;

        // Position data

		for ( let i = 0, l = posArray.length; i < l; i += 4 ) {

            const w = Math.random() * 1; // life
            
			posArray[ i + 0 ] = ( Math.random() * 2.0 - 1.0 ) * 0.15;
			posArray[ i + 1 ] = ( Math.random() * 2.0 - 1.0 ) * 0.15;
            posArray[ i + 2 ] = ( Math.random() * 2.0 - 1.0 ) * 0.15;
            
			posArray[ i + 3 ] = w;

		}

		// Velocity data

		for ( let i = 0, l = velArray.length; i < l; i += 4 ) {

			const x = 0;
			const y = 0;
			const z = - Math.random() * 3;
			velArray[ i + 0 ] = x;
			velArray[ i + 1 ] = y;
			velArray[ i + 2 ] = z;
			velArray[ i + 3 ] = 1;

		}

        this.positionVariable = this.gpuCompute.addVariable( "uTexturePosition", positionFragment, this.dtPosition );
        this.velocityVariable = this.gpuCompute.addVariable( "uTextureVelocity", velocityFragment, this.dtVelocity );        

        this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.velocityVariable, this.positionVariable ] );
        this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.velocityVariable, this.positionVariable ] );

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.velocityUniforms = this.velocityVariable.material.uniforms;

        this.positionUniforms[ "uTime" ] = { value: 0.0 };
        this.positionUniforms[ "uDelta" ] = { value: 0.0 };
        this.positionUniforms[ "uTexturePositionOrigin" ] = { value: this.dtPosition }
        this.positionUniforms[ "uDieSpeed" ] = { value: this.settings.uDieSpeed }
        this.velocityUniforms[ "uTime" ] = { value: 0.0 };
        this.velocityUniforms[ "uDelta" ] = { value: 0.0 };
        this.velocityUniforms[ "uSpherePosition" ] = { value: new Vector3() };
        this.velocityUniforms[ "uVelocity" ] = { value: this.settings.velocity };
        this.velocityUniforms[ "uNoiseScale" ] = { value: this.settings.noiseScale };

        this.velocityVariable.wrapS = ClampToEdgeWrapping;
        this.velocityVariable.wrapT = ClampToEdgeWrapping;
        this.positionVariable.wrapS = ClampToEdgeWrapping;
        this.positionVariable.wrapT = ClampToEdgeWrapping;


        var error = this.gpuCompute.init();

        if ( error !== null ) {

            console.error( error );

        }

        // this.fboHelper.attach( this.gpuCompute.getCurrentRenderTarget( this.positionVariable ), 'position' );
        // this.fboHelper.attach( this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ), 'velocity' );

        this.controller3.onChange((newValue) => {

			this.velocityUniforms["uVelocity"].value = newValue;

        });
        
        this.controller4.onChange((newValue) => {

			this.velocityUniforms["uNoiseScale"].value = newValue;

		});

    }

    getRenderTexture( variableName ) {

        return this.gpuCompute.getCurrentRenderTarget( variableName ).texture;

    }
    compute( dt, time ) {

        this.positionUniforms[ "uTime" ].value = time;
        this.positionUniforms[ "uDelta" ].value = dt;
        this.velocityUniforms[ "uTime" ].value = time;
        this.velocityUniforms[ "uDelta" ].value = dt;        
        
                
        this.gpuCompute.compute();

        
        

    }

}