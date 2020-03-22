
import Geometry from './Geometry';
import Material from './Material';
import { Mesh, Raycaster, Vector2, CubeRefractionMapping, Vector3, CubeCamera, LinearMipMapLinearFilter, CubeTextureLoader, WebGLRenderTarget, LinearFilter  } from 'three';
import { MeshBasicMaterial } from 'three/build/three.module';

import Gui from "../../Engine/Gui";

export default class Globe extends Mesh {

	constructor( { particleCount = 100, settings, camera, scene, renderer, fboHelper } ) {	

		const cubeMapTextureRefract = new CubeTextureLoader()
										.setPath( 'assets/images/studio1/' )
										.load( [
											'px.png',
											'nx.png',
											'py.png',
											'ny.png',
											'pz.png',
											'nz.png'
										] );

		const cubeMapTextureReflect = new CubeTextureLoader()
		.setPath( 'assets/images/env/city/' )
		.load( [
			'px.png',
			'nx.png',
			'py.png',
			'ny.png',
			'pz.png',
			'nz.png'
		] );


		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount, cubeMapTextureRefract, cubeMapTextureReflect );

		super( geo, mat );

		this.settings = {

			distortionAmount: 0

		};

		

		this.fboHelper = fboHelper;

		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.raycaster = new Raycaster();
		this.mouse = new Vector2();

		this.cubeMapTexture = cubeMapTextureRefract;

		this.scene.background = cubeMapTextureRefract;
		this.scene.background.generateMipmaps = true;

		this.amplitude = 0.01;
		this.waveTime = 0.01;
		this.triggerWaveTime = true;

		this.renderOrder = 1;

		this.refractionBuffer = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
		this.refractionBuffer.texture.generateMipmaps = false;
		this.refractionBuffer.flipY = true;

		this.refractionMaskBuffer = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
		this.refractionMaskBuffer.texture.generateMipmaps = false;
		this.refractionMaskBuffer.flipY = true;
		
		// this.fboHelper.attach( this.refractionBuffer, 'Refraction Buffer' );
		// this.fboHelper.attach( this.refractionMaskBuffer, 'Refraction mask Buffer' );

		this.visible = false;	

		

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;


	}

	update( dt ) {

		this.visible = false;

		this.scene.background = null;

		// Render the non refracted object into a buffer

		this.renderer.setRenderTarget( this.refractionBuffer );
		this.renderer.render( this.scene, this.camera );
		this.renderer.setRenderTarget( null );

		this.scene.overrideMaterial = new MeshBasicMaterial( { color: 0xffffff } );

		this.renderer.setRenderTarget( this.refractionMaskBuffer );
		this.renderer.render( this.scene, this.camera );
		this.renderer.setRenderTarget( null );


		this.scene.overrideMaterial = null;

		this.visible = true;
		
		//this.scene.background = this.cubeMapTexture;

		
		if ( this.triggerWaveTime ) {

			this.waveTime += 0.003;

		}

		if ( this.waveTime >= 6.0 ) {

			this.waveTime = 0.0;

			this.triggerWaveTime = false;

		}

		if ( this.amplitude > 0.03 ) {

			this.amplitude *= 0.99;

		 }

		 if ( this.waveTime > 0.01 ) {

			//this.waveTime *= 0.8;

		 }

		this.setUniforms( 'uAmp', this.amplitude );
		this.setUniforms( 'uWaveTime', this.waveTime );
		this.setUniforms( 'distortionAmount', this.settings.distortionAmount );
		
		this.setUniforms( 'uEnvMap', this.refractionBuffer.texture );
		this.setUniforms( 'uEnvMapMask', this.refractionMaskBuffer.texture );

	}

}