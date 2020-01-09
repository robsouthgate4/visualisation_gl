// import Globals from "./Globals"
import { Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, ClampToEdgeWrapping, SphereBufferGeometry, RepeatWrapping, BufferAttribute, BufferGeometry, PointsMaterial, Points, Math as ThreeMath, BoxBufferGeometry, PlaneBufferGeometry, ShaderMaterial, SphereGeometry, Color, TextureLoader, IcosahedronGeometry, ObjectLoader, IcosahedronBufferGeometry, DepthTexture, OrthographicCamera, UniformsUtils, RGBFormat, LinearFilter, UnsignedShortType, UniformsLib, DataTexture, PointLight, CubeTextureLoader, CubeReflectionMapping, sRGBEncoding, HalfFloatType, UVMapping, RedFormat, Camera } from 'three';

import FBOHelper from '../libs/THREE.FBOHelper';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Triangle from './Triangle'
import triangleVert from '../shaders/sceenTriangle/triangleVert.glsl'
import triangleFrag from '../shaders/sceenTriangle/triangleFrag.glsl'

export default class App {

	constructor() {

		// Renderer

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

		// Create the full screen triangle ready for blit

		this.gpuCamera = new Camera();
		this.gpuCamera.position.z = 1;
        this.gpuWidth = 1
		this.gpuHeight = 1
		this.screenTriangle = new Triangle();
		this.screenMat = new ShaderMaterial({
			vertexShader: triangleVert,
			fragmentShader: triangleFrag
		});
		this.screenMesh = new Mesh( this.screenTriangle, this.screenMat );
		this.scene.add( this.screenMesh );


		// GPGPU

		this.textureWidth;
		this.textureWidth;
		this.density;
		this.velocity;
		this.divergence;
		this.curl;
		this.pressure;

		this.initFrameBuffers();


	}

	createFBO( textureId, width, height, internalFormat, format, type, param, displayHelper, displayName ) {

		const texture = new DataTexture(
			new Float32Array(),
			width,
			height,
			format,
			type,
			UVMapping,
			ClampToEdgeWrapping,
			ClampToEdgeWrapping,
			param,
			param,
		)

		texture.internalFormat = internalFormat;

		let fbo = new WebGLRenderTarget( width, height );
		fbo.texture = texture;

		if ( displayHelper ) {

			this.fbohelper.attach( fbo, displayName );

		}

		return [ texture, fbo, textureId ];

	}

	createDoubleFBO( textureId, width, height, internalFormat, format, type, param, ) {

		let fbo1 = this.createFBO( textureId, width, height, internalFormat, format, type, param, displayName = '' );
		let fbo2 = this.createFBO( textureId + 1, width, height, internalFormat, format, type, param, displayName = '' );

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

		const size = new Vector2();

		this.renderer.getSize( size );

		this.textureWidth = size.x;
		this.textureHeight = size.y;

		this.curl = this.createFBO(
			5,
			this.textureWidth,
			this.textureHeight,
			RedFormat,
			RGBAFormat,
			HalfFloatType,
			NearestFilter,
			true,
			'Curl'
		);

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

	render( now ) {

		const delta = this.clock.getDelta();
		const time = this.clock.getElapsedTime();

		this.camera.lookAt( 0, 0, 0 );

		this.renderer.render( this.scene, this.camera );

		this.fbohelper.update();
		this.controls.update();

		requestAnimationFrame( this.render.bind( this ) );


	}

}
