import Globals from "./Globals"

import { 
	Scene, 
	PerspectiveCamera,
	WebGLRenderer,
	Vector2,
	Clock,
	Color, MathUtils, Spherical, Vector3, Group} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Globe from './Globe/Globe';
import Particle from './Particles/Particle';
import PostProcess from '../PostProcess';
import FXAA from '../PostProcess/FXAA';
import FBOHelper from "../libs/THREE.FBOHelper";


export default class App {

	constructor() {

		this.numberOfParticles = 20;
		this.particles = [];

		this.renderer = new WebGLRenderer( );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb(0,0,0)' ), 1.0 );
		document.body.appendChild( this.renderer.domElement );

		this.resolution = new Vector2();
		this.renderer.getDrawingBufferSize( this.resolution );

		this.fboHelper = new FBOHelper( this.renderer );

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
		//this.controls.enableZoom = false;
		this.mouse = new Vector2();

		// Create Sphere geo

		this.globe = new Globe( { camera: this.camera, scene: this.scene, renderer: this.renderer, fboHelper: this.fboHelper } );
		this.scene.add( this.globe );



		// Post processing
		
		this.postProcess = new PostProcess( this.renderer, this.fboHelper );

		window.addEventListener( 'mousemove', ( e ) => {

			this.onMouseMove( e );

		} );

		window.addEventListener( 'resize', this.onWindowResize.bind(this) )

		this.tapPosition = new Vector2();
		this.clock = new Clock();		

		this.init();

		this.particleGroup = new Group();
		this.createParticles();

	}

	createParticles() {

		

		for (let i = 0; i < this.numberOfParticles; i++) {

			const particle = new Particle({ camera: this.camera, scene: this.scene });

			const lon = MathUtils.randFloat( -90, 90 )
			const lat = MathUtils.randFloat( -180, 180 );

			console.log( lon ) 

			const radius = MathUtils.randFloat( 0.5, 0.8);

			//const particlePos = this.polarToCartesian( lon, lat, radius );

			const RAD2DEG = 180 / Math.PI;
			const DEG2RAD = Math.PI / 180;

			const phi = ( 90 - lat ) * DEG2RAD;
			const theta = ( lon + 180 ) * DEG2RAD;

			const particlePos = new Vector3().setFromSphericalCoords( radius, phi, theta  );

			particle.position.set( particlePos.x, particlePos.y, particlePos.z );
			particle.lat = lat;
			particle.lon = lon;
			particle.radius = radius;

			const dir = [ -1, 1 ];
			particle.direction = dir[ Math.round( MathUtils.randFloat( 0, 1 ) ) ]

			particle.scale.setScalar( 0.4 );

			this.particles.push( particle );

			this.particleGroup.add( particle );
			
			
		}

		this.scene.add( this.particleGroup );

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

		this.particles.forEach( ( particle ) => {
			
			const RAD2DEG = 180 / Math.PI;
			const DEG2RAD = Math.PI / 180;
			
			//const lat += 0.1;

			let lat = particle.lat + ( 10 * particle.direction  ) * dt;
			let lon = particle.lon + ( 10 * particle.direction  ) * dt;
			let radius = particle.radius

			particle.lat = lat;
			particle.lon = lon;

			const phi = ( 90 - lat ) * DEG2RAD;
			const theta = ( lon + 180 ) * DEG2RAD;

			const particlePos = new Vector3().setFromSphericalCoords( radius, phi, theta  );

			particle.position.set( particlePos.x, particlePos.y, particlePos.z );
			

		} );
		
		// Display

		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();	
		
		this.globe.material.uniforms.uTime.value = time;
		this.globe.update();

	}

	render( dt, time ) {

		this.camera.updateProjectionMatrix();

		//this.renderer.render( this.scene, this.camera );

		this.postProcess.render( this.scene, this.camera );


	}

}
