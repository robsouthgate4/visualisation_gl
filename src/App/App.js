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
import InstancedParticles from './Particles/InstancedParticles';

export default class App {

	constructor() {

		// Particle settings 

		this.particleSettings = {
			
			count: 512,
			birthRate: 0.5,
			gravity: -0.1,
			lifeRange: [ 1.01, 2.15 ],
			speedRange: [ 0.5, 1.0 ],
			minTheta: Math.PI / 2.0 - 0.5, 
			maxTheta: Math.PI / 2.0 + 0.5

		};


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

		// Controls

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;
		this.mouse = new Vector2();

		window.addEventListener( 'mousemove', ( e ) => {

			this.onMouseMove( e );

		} );

		this.tapPosition = new Vector2();
		this.clock = new Clock();

		// FBO Helper

		this.fbohelper = new FBOHelper( this.renderer );
		this.fbohelper.setSize( window.innerWidth, window.innerHeight );

		const ambientLight = new AmbientLight( 0xFFFFFF, 0.01 );
		this.scene.add( ambientLight );

		const pointLight = new PointLight( 0xFFFFFF, 1, 100 );
		pointLight.position.set( 10, 0, 10 );
		this.scene.add( pointLight );

		const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		this.scene.add( directionalLight );

		this.init();

		const size = new Vector2();

		this.renderer.getSize( size );

		this.textureWidth = this.particleSettings.count;
		this.textureHeight = this.particleSettings.count;

		// Programs

		const posData = new Float32Array( 4 * this.textureWidth * this.textureHeight );
		const lifeData =  new Float32Array( 4 * this.textureWidth * this.textureHeight );

		for ( let i = 0; i < ( this.textureWidth * this.textureHeight ); i ++ ) {

				posData[ 4 * i + 0 ] = 0;
				posData[ 4 * i + 1 ] = 0;
				posData[ 4 * i + 2 ] = 0;
				posData[ 4 * i + 3 ] = 1.0;

				const minAge = this.particleSettings.lifeRange[0];
				const maxAge = this.particleSettings.lifeRange[1];

				lifeData[ 4 * i + 0 ] = minAge + Math.random() * ( maxAge - minAge );
				lifeData[ 4 * i + 1 ] = 0;
				lifeData[ 4 * i + 2 ] = 0;
				lifeData[ 4 * i + 3 ] = 0;

		}

		console.log( lifeData );

		const initPosBuffer = new DataTexture( posData, this.textureWidth, this.textureHeight, RGBAFormat, FloatType );
		initPosBuffer.needsUpdate = true;
		initPosBuffer.flipY = true;

		const lifeBuffer = new DataTexture( lifeData, this.textureWidth, this.textureHeight, RGBAFormat, FloatType );
		lifeBuffer.needsUpdate = true;
		lifeBuffer.flipY = true;

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


		// Create life buffer data


		// GPGPU		
		
		this.density = 1.0;

		this.initProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: passthroughFragment,
			uniforms: {
				uTexture: { value: initPosBuffer }
			}

		})

		this.lifeProgram = new ShaderMaterial({
			
			vertexShader: baseVertex,
			fragmentShader: passthroughFragment,
			uniforms: {
				uTexture: { value: lifeBuffer }
			}
			
		})

		this.velocityProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: velocityFragment,
			uniforms: {
				uTexelSize: { value: new Vector2( 1.0 / this.textureWidth, 1.0 / this.textureHeight ) },
				uTextureVelocity: { type: 't', value: null },
				uTexturePosition: { type: 't', value: null },
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
				uTextureLife: { type: 't', value: lifeBuffer },
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

		this.life = this.createFBO(

			this.textureWidth,
			this.textureHeight,
			true,
			'Life'

		)

		// Blit original particle positions

		this.renderPass( this.initProgram, this.origin.fbo );
		this.renderPass( this.initProgram, this.position.read.fbo );
		this.renderPass( this.lifeProgram, this.life.fbo );

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

		this.camera.position.set( 0, 0, 2 );

		// Add Particles

		this.particles = new InstancedParticles( { 

			particleCount: this.particleSettings.count * this.particleSettings.count,
			settings: this.particleSettings

		 } );

		 this.particles.setUniforms( 'uResolution', new Vector2( this.particleSettings.count, this.particleSettings.count ) );

		 this.scene.add( this.particles );

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

		this.velocityProgram.uniforms.uTextureVelocity.value = this.velocity.read.fbo.texture;
		this.velocityProgram.uniforms.uTexturePosition.value = this.position.write.fbo.texture;
		this.velocityProgram.uniforms.uMouse.value = this.mouse;
		this.velocityProgram.uniforms.uGravity.value = dt;
		this.velocityProgram.uniforms.time.value = time;
		this.velocityProgram.uniforms.dt.value = dt;		
		this.renderPass( this.velocityProgram, this.velocity.write.fbo );
		this.velocity.swap();
		
		this.positionProgram.uniforms.uTextureVelocity.value = this.velocity.write.fbo.texture;
		this.positionProgram.uniforms.uTexturePosition.value = this.position.read.fbo.texture;
		this.positionProgram.uniforms.uTextureLife.value = this.life.fbo.texture;
		this.positionProgram.uniforms.uMouse.value = this.mouse;
		this.positionProgram.uniforms.time.value = time;
		this.positionProgram.uniforms.dt.value = dt;
		this.renderPass( this.positionProgram, this.position.write.fbo );
		this.position.swap();


		this.particles.setUniforms( 'uTexturePosition', this.position.write.fbo.texture );
		this.particles.setUniforms( 'uTextureVelocity', this.position.write.fbo.texture );
		

		//this.displayProgram.uniforms.uTexture.value = this.position.write.fbo.texture;

		//this.screenMesh.material = this.displayProgram;

		this.renderer.render( this.scene, this.camera );
	
		this.fbohelper.update();

		// Display
		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();

		
		requestAnimationFrame( this.render.bind( this ) );


	}

}
