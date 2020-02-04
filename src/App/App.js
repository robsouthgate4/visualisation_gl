// import Globals from "./Globals"
import { 
	Scene, 
	PerspectiveCamera,
	WebGLRenderer,
	Vector2,
	Clock,
	Mesh,
	AmbientLight,
	WebGLRenderTarget,
	NearestFilter,
	RGBAFormat,
	ClampToEdgeWrapping,
	Math as ThreeMath,
	ShaderMaterial,
	Color, 
	DataTexture, 
	PointLight, 
	HalfFloatType, 
	UVMapping, 
	RedFormat,
	Camera, 
	FloatType,
	RGBFormat,
	Vector3,
	TextureLoader} from 'three';

import { WEBGL } from 'three/examples/jsm/WebGL.js';

import FBOHelper from '../libs/THREE.FBOHelper';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Triangle from './Triangle'

// Shaders

import triangleVert from '../shaders/sceenTriangle/triangleVert.glsl'
import triangleFrag from '../shaders/sceenTriangle/triangleFrag.glsl'

import baseVertex from '../shaders/baseVertex.glsl'

import velocityFragment from '../shaders/velocityFrag.glsl'
import positionFragment from '../shaders/positionFrag.glsl'
import passthroughFragment from '../shaders/passthroughFrag.glsl'

import Globe from './Globe/Globe';

import PostProcessing from '../PostProcessing'

export default class App {

	constructor() {

		


		this.renderer = new WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb(0,0,0)' ), 1.0 );
		document.body.appendChild( this.renderer.domElement );

		// Scene

		this.scene = new Scene();
		window.scene = this.scene;
		this.gpuScene = new Scene();
		
		this.canvas = document.getElementById( 'canvas' );
		this.camera = new PerspectiveCamera( ( 70, window.innerWidth / window.innerHeight, 0.01, 50 ) );
		this.camera.near = 0.01;
		this.camera.far = 10;

		// FBO Helper

		this.fbohelper = new FBOHelper( this.renderer );
		this.fbohelper.setSize( window.innerWidth, window.innerHeight );


		this.postProcessing = new PostProcessing( { renderer: this.renderer, scene: this.scene, camera: this.camera, FBOHelper: this.fbohelper } );

		// Controls

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;
		this.mouse = new Vector2();


		// Create Sphere geo

		this.globe = new Globe( {} );
		this.scene.add( this.globe );

		// Particle settings 
 
		this.particleSettings = {
			
			count: Math.sqrt( this.globe.geometry.attributes.position.count ),
			birthRate: 0.5,
			gravity: -0.2,
			lifeRange: [ 1.01, 3.3 ],
			speedRange: [ 0.5,1.0 ],
			minTheta: Math.PI / 2.0 - 0.5, 
			maxTheta: Math.PI / 2.0 + 0.5,
			radius: 1

		};


		window.addEventListener( 'mousemove', ( e ) => {

			this.onMouseMove( e );

		} );

		this.tapPosition = new Vector2();
		this.clock = new Clock();

		

		this.init();

		const size = new Vector2();

		this.renderer.getSize( size );

		this.textureWidth = this.particleSettings.count;
		this.textureHeight = this.particleSettings.count;

		// Programs

		const posData = new Float32Array( 3 * this.textureWidth * this.textureHeight );
		const particleData =  new Float32Array( 4 * this.textureWidth * this.textureHeight );


		const initPosBuffer = new DataTexture( posData, this.textureWidth, this.textureHeight, RGBAFormat, FloatType );
		initPosBuffer.needsUpdate = true;
		initPosBuffer.flipY = true;

		const particleBuffer = new DataTexture( particleData, this.textureWidth, this.textureHeight, RGBAFormat, FloatType );
		particleBuffer.needsUpdate = true;
		particleBuffer.flipY = true;

		// Create the full screen triangle ready for blit

		this.gpuCamera = new Camera();
		this.gpuCamera.position.z = 1;

		this.screenTriangle = new Triangle();

		this.displayProgram = new ShaderMaterial({
			vertexShader: triangleVert,
			fragmentShader: triangleFrag,
			uniforms: {
				uTexture: { type: 't', value: null },
				uResolution: { value: new Vector2( this.textureWidth, this.textureHeight ) },
				uTexelSize: { type: 'v2', value: new Vector2() }
			}
		});

		this.screenMesh = new Mesh( this.screenTriangle, this.displayProgram );
		this.gpuScene.add( this.screenMesh );


		// GPGPU		
	

		this.initProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: passthroughFragment,
			uniforms: {
				uTexture: { value: initPosBuffer }
			}

		})

		this.particleProgram = new ShaderMaterial({
			
			vertexShader: baseVertex,
			fragmentShader: passthroughFragment,
			uniforms: {
				uTexture: { value: particleBuffer }
			}
			
		})

		this.velocityProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: velocityFragment,
			uniforms: {
				uTexelSize: { value: new Vector2( 1.0 / this.textureWidth, 1.0 / this.textureHeight ) },
				uTextureVelocity: { type: 't', value: null },
				uTexturePosition: { type: 't', value: null },
				uTextureParticle: { type: 't', value: particleBuffer },
				uTextureFlow: { type: 't', value: new TextureLoader().load( 'assets/images/flowmap.png' ) },
				uResolution: { value: new Vector2( this.textureWidth, this.textureHeight) },
				uGravity: { value: this.particleSettings.gravity },
				uAge: { value: 0 },
				uLife: { value: this.particleSettings.life },
				uMinTheta: { value: null },
				uMaxTheta: { value: null },
				uMinSpeed: { value: null },
				uMaxSpeed: { value: null },
				uMouse: { value: new Vector2() },
				dt: { value: null },
				time: { value: null },
			}

		});

		this.positionProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: positionFragment,
			uniforms: {
				uTexelSize: { value: new Vector2( 1.0 / this.textureWidth, 1.0 / this.textureHeight ) },
				uTextureVelocity: { type: 't', value: null },
				uTexturePosition: { type: 't', value: null },
				uTextureParticle: { type: 't', value: particleBuffer },
				uTextureOrigin: { type: 't', value: initPosBuffer },
				uResolution: { value: new Vector2( this.textureWidth, this.textureHeight) },
				uGravity: { value: this.particleSettings.gravity },
				uAge: { value: 0 },
				uLife: { value: this.particleSettings.life },
				uMinTheta: { value: null },
				uMaxTheta: { value: null },
				uMinSpeed: { value: null },
				uMaxSpeed: { value: null },
				uMouse: { value: new Vector2() },
				dt: { value: null },
				time: { value: null },
			}

		});

		this.initFrameBuffers();
		

	}

	createFBO( width, height, displayHelper, displayName ) {

		const fbo = new WebGLRenderTarget( width, height, {
			wrapS: ClampToEdgeWrapping,
			wrapT: ClampToEdgeWrapping,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
			type: FloatType,
			stencilBuffer: false,
			depthBuffer: false
		});
	
		fbo.texture.generateMipmaps = false;

		if ( displayHelper ) {

			this.fbohelper.attach( fbo, displayName );

		}

		return {
			fbo,
			helper: this.fbohelper
		};

	}

	createDoubleFBO( width, height, displayHelper, displayName) {

		let fbo1 = this.createFBO( width, height, displayHelper, displayName );
		fbo1.id = 0;
		
		let fbo2 = this.createFBO( width, height, displayHelper, displayName );
		fbo2.id = 1;

		return {

			get read() {

				return fbo1;

			},
			get write() {

				return fbo2;

			},
			swap() {

				let temp = fbo1;
				fbo1 = fbo2;
				fbo2 = temp;

			}

		};

	}

	initFrameBuffers( ) {
		
		this.origin = this.createFBO(

			this.textureWidth,
			this.textureHeight,
			true, 
			'Origin' 

		)

		this.velocity = this.createDoubleFBO(

			this.textureWidth,
			this.textureHeight,
			true, 
			'Velocity' 

		);

		this.position = this.createDoubleFBO(

			this.textureWidth,
			this.textureHeight,
			true,
			'Position'

		);

		this.particle = this.createFBO(

			this.textureWidth,
			this.textureHeight,
			true,
			'Particle'

		)

		// Blit original particle positions

		this.renderPass( this.initProgram, this.origin.fbo );
		this.renderPass( this.initProgram, this.position.read.fbo );
		
		this.renderPass( this.particleProgram, this.particle.fbo );

	}

	init() {

		this.setupScene();
		requestAnimationFrame( this.render.bind( this ) );
		this.onWindowResize();

	}

	onWindowResize() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	onMouseMove( e ) { 

		this.mouse.x = e.clientX / window.innerWidth;
		this.mouse.y =  - ( e.clientY  / window.innerHeight ) + 1;
	}

	setupScene() {

		this.camera.position.set( 0, 0, 4 );

	}

	getIndex( x, y ) {

		return ( x + y * this.textureWidth )
		
	}

	addDensity ( position, amount ) {

		const index = this.getIndex( position.x, position.y );

		this.densityProperties.position = position;
		this.densityProperties.amount += amount;

	}

	renderPass( program, fbo ) {

		let renderTarget = this.renderer.getRenderTarget();
		this.screenMesh.material = program
		this.renderer.setRenderTarget( fbo )
		this.renderer.render( this.gpuScene, this.gpuCamera );
		this.renderer.setRenderTarget( renderTarget );

	}

	render( now ) {

		const dt = this.clock.getDelta();
		const time = this.clock.getElapsedTime();


		//this.velocity.swap();

		
		// this.velocityProgram.uniforms.uTexturePosition.value = this.position.read.fbo.texture;
		// this.velocityProgram.uniforms.uTextureVelocity.value = this.velocity.write.fbo.texture;
		// this.velocityProgram.uniforms.uTextureParticle.value = this.particle.fbo.texture;
		// this.velocityProgram.uniforms.uMouse.value = this.mouse;
		// this.velocityProgram.uniforms.uGravity.value = dt;
		// this.velocityProgram.uniforms.time.value = time;
		// this.velocityProgram.uniforms.dt.value = dt;

		
		// this.renderPass( this.velocityProgram, this.velocity.read.fbo );	
		
		

		// this.position.swap();

		// this.positionProgram.uniforms.uTextureVelocity.value = this.velocity.read.fbo.texture;
		// this.positionProgram.uniforms.uTexturePosition.value = this.position.write.fbo.texture;
		// this.positionProgram.uniforms.uTextureParticle.value = this.particle.fbo.texture;
		// this.positionProgram.uniforms.uMouse.value = this.mouse;
		// this.positionProgram.uniforms.time.value = time;
		// this.positionProgram.uniforms.dt.value = dt;


		this.globe.material.uniforms.uTime.value = time;
		this.globe.update();


		this.renderPass( this.positionProgram, this.position.read.fbo );

		this.renderer.render( this.scene, this.camera );

		this.postProcessing.render();
	
		this.fbohelper.update();

		// Display

		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();

		
		requestAnimationFrame( this.render.bind( this ) );


	}

}
