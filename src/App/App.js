// import Globals from "./Globals"
import { Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, ClampToEdgeWrapping, SphereBufferGeometry, RepeatWrapping, BufferAttribute, BufferGeometry, PointsMaterial, Points, Math as ThreeMath, BoxBufferGeometry, PlaneBufferGeometry, ShaderMaterial, SphereGeometry, Color, TextureLoader, IcosahedronGeometry, ObjectLoader, IcosahedronBufferGeometry, DepthTexture, OrthographicCamera, UniformsUtils, RGBFormat, LinearFilter, UnsignedShortType, UniformsLib, DataTexture } from 'three';
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils';
import FBOHelper from '../libs/THREE.FBOHelper';

import fragShaderPosition from '../shaders/positionFrag.glsl';
import fragShaderVelocity from '../shaders/velocityFrag.glsl';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PP from '../PostProcessing/PP';

import CopyShader from '../PostProcessing/CopyShader';
import BlurShader from '../PostProcessing/BlurShader';
import MixShader from '../PostProcessing/MixShader';
import InstancedParticles from './Particles/InstancedParticles';

export default class App {

	constructor() {

		// Renderer

		this.renderer = new WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb(0,0,0)' ), 1.0 );
		document.body.appendChild( this.renderer.domElement );
		
		// Scene

		this.scene = new Scene();
		this.canvas = document.getElementById( 'canvas' );
		this.camera = new PerspectiveCamera( ( 70, window.innerWidth / window.innerHeight, 0.01, 50 ) );
		this.camera.near = 0.01;
		this.camera.far = 10;

		// Post Processing

		this.copyShader;
		this.blurShader;
		this.mixShader;

		// GPGPU

		this.size = 256;
		this.gpuCompute;
		this.dtPosition;
		this.originsTexture;
		this.positionVariable;
		this.velocityVariable;

		this.bounds = 400;
		this.boundsHalf = this.bounds / 2;

		// Controls

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;


		this.tapPosition = new Vector2();
		this.clock = new Clock();

		// FBO Helper

		this.fbohelper = new FBOHelper( this.renderer );
		this.fbohelper.setSize( window.innerWidth, window.innerHeight );	

		// Postprocessing

		this.initPostProcessing();

		// GPGPU

		this.initGPGPU();

		// Instanced particles

		this.initParticles();


		this.init();

	}

	init() {

		this.setupScene();
		requestAnimationFrame( this.render.bind( this ) );
		this.onWindowResize();

	}

	initGPGPU() {		

		this.gpuCompute = new GPUComputationRenderer( this.size, this.size, this.renderer );
		
		// GPGPU Initial state float textures

		this.dtPosition = this.gpuCompute.createTexture();
		const posArray = this.dtPosition.image.data;

		this.dtVelocity = this.gpuCompute.createTexture();
		const velArray = this.dtVelocity.image.data;

		// Position data

		const shapePointCloud = GeometryUtils.randomPointsInGeometry( new IcosahedronGeometry( 0.4, 4 ), posArray.length );

		for ( let i = 0, l = posArray.length; i < l; i += 4 ) {

			const x = shapePointCloud[ i ].x;
			const y = shapePointCloud[ i ].y;
			const z = shapePointCloud[ i ].z;
			posArray[ i + 0 ] = x;
			posArray[ i + 1 ] = y;
			posArray[ i + 2 ] = z;
			posArray[ i + 3 ] = 0;

		}

		// Velocity data

		for ( let i = 0, l = velArray.length; i < l; i += 4 ) {

			const x = 0;
			const y = 0;
			const z = 0;
			velArray[ i + 0 ] = x;
			velArray[ i + 1 ] = y;
			velArray[ i + 2 ] = z;
			velArray[ i + 3 ] = 1;

		}

		// Texture Variables

		this.velocityVariable = this.gpuCompute.addVariable( "textureVelocity", fragShaderVelocity, this.dtVelocity );
		this.positionVariable = this.gpuCompute.addVariable( "texturePosition", fragShaderPosition, this.dtPosition );

		this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.velocityVariable, this.positionVariable ] );
		this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.velocityVariable, this.positionVariable ] );

		this.positionUniforms = this.positionVariable.material.uniforms;
		this.velocityUniforms = this.velocityVariable.material.uniforms;

		this.positionUniforms[ "time" ] = { value: 0.0 };
		this.positionUniforms[ "delta" ] = { value: 0.0 };
		this.positionUniforms[ "textureOrigins" ] = { type: 't', value: this.originsTexture };

		this.velocityUniforms[ "time" ] = { value: 0.0 };
		this.velocityUniforms[ "delta" ] = { value: 0.0 };
		this.velocityVariable.material.defines.BOUNDS = this.bounds.toFixed( 2 );

		this.positionVariable.wrapS = ClampToEdgeWrapping;
		this.positionVariable.wrapT = ClampToEdgeWrapping;

		this.velocityVariable.wrapS = ClampToEdgeWrapping;
		this.velocityVariable.wrapT = ClampToEdgeWrapping;

		const error = this.gpuCompute.init();

		if ( error != null ) {

			console.log( error );

		}
		
		this.fbohelper.attach( this.gpuCompute.getCurrentRenderTarget( this.positionVariable ), 'Positions' );
		this.fbohelper.attach( this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ), 'Velocity' );

	}

	initParticles() {

		// Create instanced particles

		this.particles = new InstancedParticles( { particleCount: this.size * this.size } );
		this.scene.add( this.particles );

		const posTexture = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture

		this.particles.setUniforms( 'uPositionTexture', this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture );

	}

	initPostProcessing() {

		// Setup postprocessing
		
		this.pp = new PP( this.renderer );

		this.copyShader = new PP.CopyShader();
		this.blurShader = new PP.BlurShader();
		this.mixShader = new PP.MixShader();		

		this.rtPost1 = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
		this.rtPost1.texture.generateMipmaps = false;

		this.rtPost2 = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
		this.rtPost2.texture.generateMipmaps = false;

		this.rtPost3 = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
		this.rtPost3.texture.generateMipmaps = false;

		this.rtDepth = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: NearestFilter, magFilter: NearestFilter } );
		this.rtDepth.texture.generateMipmaps = false;
		this.rtDepth.texture.format = RGBFormat;
		this.rtDepth.stencilBuffer = false;
		this.rtDepth.depthBuffer = true;
		this.rtDepth.depthTexture = new DepthTexture();
		this.rtDepth.depthTexture.type = UnsignedShortType;

		this.mixShader.material.uniforms.cameraNear.value = this.camera.near;
		this.mixShader.material.uniforms.cameraFar.value = this.camera.far;
		this.mixShader.material.uniforms.tDepth.value = this.rtDepth.depthTexture;

		// this.fbohelper.attach(this.rtPost1, 'Post 1')
		// this.fbohelper.attach(this.rtPost2, 'Post 2')
		// this.fbohelper.attach(this.rtPost3, 'Post 3')
		// this.fbohelper.attach(this.rtDepth, 'Depth')

	}

	onWindowResize() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}



	setupScene() {		

		this.camera.position.set( 0, 0, 2 );

	}

	render( now ) {

		const delta = this.clock.getDelta();
		const time = this.clock.getElapsedTime();

		this.positionUniforms[ "time" ].value = time;
		this.positionUniforms[ "delta" ].value = delta;
		this.positionUniforms[ "textureOrigins" ].value = this.originsTexture;

		this.velocityUniforms[ "time" ].value = time;
		this.velocityUniforms[ "delta" ].value = delta;

		this.gpuCompute.compute();

		// update particle uniforms

		this.particles.setUniforms( 'uPositionTexture', this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture );
		this.particles.setUniforms( 'uVelocityTexture', this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture );


		// this.particleMaterial.uniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture
		// this.particleMaterial.uniforms.time.value = time
		// this.particleMaterial.uniforms.delta.value = delta


		// this.camera.position.x = Math.sin(time * 0.1) * 50.0 * delta;
		// this.camera.position.z = Math.cos(time * 0.1) * 50.0 * delta;

		this.camera.lookAt( 0, 0, 0 );

		// Post processing

		this.pp.render( this.scene, this.camera, this.rtDepth );
		this.pp.render( this.scene, this.camera, this.rtPost1 );

		this.copyShader.setTexture( this.rtPost1 );
		this.pp.pass( this.copyShader, this.rtPost2 );

		for ( let i = 0; i < 16; i ++ ) {

			/* Blur on the X */
			this.blurShader.setTexture( this.rtPost2 );
			this.blurShader.setDelta( 1 / this.rtPost2.width, 0 );
			this.pp.pass( this.blurShader, this.rtPost3 );

			/* Blur on the Y */
			this.blurShader.setTexture( this.rtPost3 );
			this.blurShader.setDelta( 0, 1 / this.rtPost2.height );
			this.pp.pass( this.blurShader, this.rtPost2 );

		}

		this.mixShader.setTextures( this.rtPost1, this.rtPost2 );

		this.pp.out( this.mixShader );

		//this.renderer.render(this.scene, this.camera)

		this.fbohelper.update();
		this.controls.update();

		requestAnimationFrame( this.render.bind( this ) );


	}

}
