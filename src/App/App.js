import Globals from "./Globals"

import { 
	Scene, 
	PerspectiveCamera,
	WebGLRenderer,
	Vector2,
	Clock,
	Color} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Globe from './Globe/Globe';
import Particle from './Particles/Particle';
import PostProcess from '../PostProcess';
import FXAA from '../PostProcess/FXAA';


export default class App {

	constructor() {

		this.renderer = new WebGLRenderer( );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb(0,0,0)' ), 1.0 );
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
		this.controls.enablePan = false;
		this.controls.enableZoom = false;
		this.mouse = new Vector2();

		// Create Sphere geo

		this.globe = new Globe( { camera: this.camera, scene: this.scene, renderer: this.renderer } );
		this.scene.add( this.globe );

		this.particle = new Particle({ camera: this.camera, scene: this.scene });
		this.particle.position.set( 0, 0, -3 );
		this.particle.scale.setScalar( 0.5 );
		this.scene.add( this.particle );


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

		requestAnimationFrame( 

			this.draw.bind( this ) 

		);

		this.onWindowResize();

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

		this.camera.position.set( 0, 0, 3 );

	}

	draw() {

		const dt = this.clock.getDelta();
		const time = this.clock.getElapsedTime();

		this.update( dt, time );

		this.render( dt, time );

		requestAnimationFrame( this.draw.bind( this ) );


	}

	update( dt, time ) {

		this.globe.material.uniforms.uTime.value = time;
		this.globe.update();		

		// Display

		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();		

	}

	render( dt, time ) {		

		this.globe.visible = true;

		// this.renderer.render( this.scene, this.camera )

		this.postProcess.render( this.scene, this.camera );	


	}

}
