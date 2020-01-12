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
import densityFragment from '../shaders/densityFrag.glsl'
import initFragment from '../shaders/initFrag.glsl'


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
		this.canvas = document.getElementById( 'canvas' );
		this.camera = new PerspectiveCamera( ( 70, window.innerWidth / window.innerHeight, 0.01, 50 ) );
		this.camera.near = 0.01;
		this.camera.far = 10;

		// Controls

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;


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

		this.textureWidth = size.x;
		this.textureHeight = size.y;

		// Programs

		const posData = new Float32Array( 4 * this.textureWidth * this.textureHeight );

		for ( let i = 0; i < ( this.textureWidth * this.textureHeight ); i ++ ) {

				posData[ 4 * i + 0 ] = 1.0;
				posData[ 4 * i + 1 ] = 0.0;
				posData[ 4 * i + 2 ] = 0.0;
				posData[ 4 * i + 3 ] = 1.0;

			

		}		

		const initPos = new DataTexture( posData, this.textureWidth, this.textureHeight, RGBAFormat, FloatType );
		initPos.needsUpdate = true;

		// Create the full screen triangle ready for blit

		this.gpuCamera = new Camera();
		this.gpuCamera.position.z = 1;
        this.gpuWidth = 1
		this.gpuHeight = 1
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
		this.scene.add( this.screenMesh );


		// GPGPU
		
		this.density;
		this.densityProperties = {
			amount: 0,
			position: new Vector3()
		};
		this.diffusion;
		this.velocity;
		this.viscosity;

		this.initProgram = new ShaderMaterial({
			vertexShader: baseVertex,
			fragmentShader: initFragment,
			uniforms: {
				uTexture: { value: initPos }
			}
		})

		this.densityProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: densityFragment,
			uniforms: {
				uTexelSize: { value: new Vector2( 1.0 / this.textureWidth, 1.0 / this.textureHeight ) },
				uPosition: { value: new Vector3() }, 
				uAmount: { value: 0 }
			}
		});

		this.velocityProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: velocityFragment,
			uniforms: {
				uTexelSize: { value: new Vector2( 1.0 / this.textureWidth, 1.0 / this.textureHeight ) },
				uTextureVelocity: { type: 't', value: null },
				uTexturePosition: { type: 't', value: null }
			}

		});

		this.positionProgram = new ShaderMaterial({

			vertexShader: baseVertex,
			fragmentShader: positionFragment,
			uniforms: {
				uTexelSize: { value: new Vector2( 1.0 / this.textureWidth, 1.0 / this.textureHeight ) },
				uTextureVelocity: { type: 't', value: null },
				uTexturePosition: { type: 't', value: null },
				uResolution: { type: 'f', value: new Vector2( this.textureWidth, this.textureHeight) },
				uMouse: { value: new Vector2() }
			}

		});

		this.initFrameBuffers();

		window.addEventListener( 'mousemove', ( e ) => {

			this.onMouseMove( e );

		} );


	}

	createFBO( width, height, displayHelper, displayName ) {

		const fbo = new THREE.WebGLRenderTarget( width, height, {
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
		let fbo2 = this.createFBO( width, height, displayHelper, displayName );

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

		this.velocity = this.createDoubleFBO(

			this.textureWidth,
			this.textureHeight,
			true, 
			'Velocity' 

		);

		this.density = this.createDoubleFBO(

			this.textureWidth,
			this.textureHeight,
			true,
			'Density'

		);

		this.position = this.createDoubleFBO(

			this.textureWidth,
			this.textureHeight,
			true,
			'Position'

		);

		this.renderPass(this.initProgram, this.position.read.fbo)

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

	setupScene() {

		this.camera.position.set( 0, 0, 2 );

	}

	getIndex( x, y ) {

		return ( x + y * this.textureWidth )
		
	}

	addDensity ( position, amount ) {

		const index = this.getIndex( position.x, position.y );

		this.densityProperties.position = position;
		this.densityProperties.amount += amount;

	}

	onMouseMove(e) {
		this.mouseX = (e.clientX / this.textureWidth);
		this.mouseY = -(e.clientY / this.textureHeight) + 1;
		console.log(this.mouseY);
	}

	renderPass( program, fbo ) {

		let renderTarget = this.renderer.getRenderTarget();
		this.screenMesh.material = program
		this.renderer.setRenderTarget( fbo )
		this.renderer.render( this.scene, this.gpuCamera );
		this.renderer.setRenderTarget( renderTarget );

	}

	render( now ) {

		const delta = this.clock.getDelta();
		const time = this.clock.getElapsedTime();
		

		// // Position
		//

		
		this.positionProgram.uniforms.uTexturePosition.value = this.position.read.fbo.texture;
		this.positionProgram.uniforms.uMouse.value = new Vector2( this.mouseX, this.mouseY );
		this.renderPass( this.positionProgram, this.position.write.fbo );
		this.position.swap();

		this.displayProgram.uniforms.uTexture.value = this.position.write.fbo.texture;

		this.screenMesh.material = this.displayProgram;

		this.renderer.render( this.scene, this.gpuCamera );
	
		this.fbohelper.update();

		// Display
		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();

		
		requestAnimationFrame( this.render.bind( this ) );


	}

}
