import Globals from "./Globals"

import { 
	Scene, 
	PerspectiveCamera,
	WebGLRenderer,
	Vector2,
	Clock,
	Color,
	DirectionalLight,
	PCFSoftShadowMap,
	PlaneGeometry,
	MeshStandardMaterial,
	Mesh,
	Vector3,
	DoubleSide,
	MeshBasicMaterial,
	Math as Math3} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PostProcess from '../PostProcess';

import GPGPU from '../GPGPU'
import Particles from "./Particles/Particles";

export default class App {

	constructor() {

		this.renderer = new WebGLRenderer( );
		this.renderer.setPixelRatio( 1 );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb( 50, 50, 50 )' ), 1.0 );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		document.body.appendChild( this.renderer.domElement );

		this.resolution = new Vector2();
		this.renderer.getDrawingBufferSize( this.resolution );		

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
		this.mouse = new Vector2();


		// Post processing
		
		this.postProcess = new PostProcess( this.renderer );

		window.addEventListener( 'mousemove', ( e ) => {

			this.onMouseMove( e );

		} );

		window.addEventListener( 'resize', this.onWindowResize.bind(this) )

		this.tapPosition = new Vector2();
		this.clock = new Clock();		

		this.init();

	}

	init() {

		this.setupScene();
		requestAnimationFrame( this.render.bind( this ) );
		this.onWindowResize();

		// Init GPGPU

		const numParticles = 65536;		

		this.gpgpu = new GPGPU( {

			numParticles,
			renderer: this.renderer

		} );

		this.particles = new Particles( { particleCount: numParticles } );

		this.particles.setUniforms( 'uTexturePosition', this.gpgpu.positionVariable );

		this.scene.add( this.particles );


	}

	onWindowResize() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );

		this.postProcess.resize();

	}

	onMouseMove( e ) { 

		this.mouse.x = e.clientX / window.innerWidth;
		this.mouse.y =  - ( e.clientY  / window.innerHeight ) + 1;
	}

	setupScene() {

		this.camera.position.set( 0, 0, 4 );

		this.floorGeo = new PlaneGeometry( 1000, 1000);
		this.floorMaterial = new MeshBasicMaterial( { color: new Color( 'rgb( 150, 150, 150 )' ) } );
		this.floorMaterial.side = DoubleSide;
		this.floorMesh = new Mesh( this.floorGeo, this.floorMaterial );
		this.floorMesh.rotateX( Math3.degToRad( 90 ) );
		this.floorMesh.position.set( 0, -1, 0 );
		this.floorMesh.receiveShadow = true;
		this.scene.add( this.floorMesh );

		this.directional = new DirectionalLight( 0xffffff, 1.0 );
		this.directional.castShadow = true;

		this.directional.shadow.mapSize.width = 512;  // default
		this.directional.shadow.mapSize.height = 512; // default
		this.directional.shadow.camera.near = 0.5;    // default
		this.directional.shadow.camera.far = 500;     // default

		this.scene.add( this.directional );

	}

	render( now ) {

		const dt = this.clock.getDelta();
		const time = this.clock.getElapsedTime();


		// Display

		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();		
		
		this.postProcess.render( this.scene, this.camera );

		this.gpgpu.compute( dt, time );	
		
		requestAnimationFrame( this.render.bind( this ) );


	}

}
