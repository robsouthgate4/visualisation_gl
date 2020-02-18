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
	Math as Math3,
	SphereGeometry,
	PointLight,
	PointLightHelper,
	AmbientLight} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PostProcess from '../PostProcess';

import GPGPU from '../GPGPU'
import Particles from "./Particles/Particles";

export default class App {

	constructor() {

		this.renderer = new WebGLRenderer( { logarithmicDepthBuffer: true } );
		this.renderer.setPixelRatio( 1 );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb( 90, 90, 90 )' ), 1.0 );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		
		
		document.body.appendChild( this.renderer.domElement );

		this.resolution = new Vector2();
		this.renderer.getDrawingBufferSize( this.resolution );		

		// Scene

		this.scene = new Scene();
		window.scene = this.scene;
		
		this.canvas = document.getElementById( 'canvas' );
		this.camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );

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

		const numParticles = 262144;		

		this.gpgpu = new GPGPU( {

			numParticles,
			renderer: this.renderer

		} );

		this.particles = new Particles( { particleCount: numParticles } );
		this.particles.position.set( 0, 2, 0 );

		this.particles.setMaterialUniforms( 'uTexturePosition', this.gpgpu.positionVariable );
		this.particles.setMaterialDistancehUniforms( 'uTexturePosition', this.gpgpu.positionVariable );

		this.scene.add( this.particles );


		const sphereGeo =  new SphereGeometry( 1, 24, 24 );
		const mat = new MeshStandardMaterial( {
			color: new Color( 'rgb( 155, 155, 155 )' )
		} );
		const sphereMesh = new Mesh( sphereGeo, mat );
		sphereMesh.position.set( 0, 1, 0 );
		sphereMesh.castShadow = true;
		//this.scene.add( sphereMesh );

		this.camera.lookAt( sphereMesh.position.clone().add( new Vector3( 0, 1, 0 )) )


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

		this.camera.position.set( 0, 3, 6 );		

		this.floorGeo = new PlaneGeometry( 400, 400 );
		this.floorMaterial = new MeshStandardMaterial( { color: new Color( 'rgb( 170, 160, 150 )' ) } );
		this.floorMaterial.roughness = 0.7;
		this.floorMaterial.metalness = 1.0;
		this.floorMaterial.side = DoubleSide;
		this.floorMesh = new Mesh( this.floorGeo, this.floorMaterial );
		this.floorMesh.rotateX( Math3.degToRad( 90 ) );
		this.floorMesh.position.set( 0, 0, 0 );
		this.floorMesh.receiveShadow = true;
		this.scene.add( this.floorMesh );

		this.directional = new DirectionalLight( 0xffffff, 0.5 );
		this.directional.position.set( 500, 500, 0 );
		this.directional.castShadow = true;

		this.directional.shadow.mapSize.width = 2048;  // default
		this.directional.shadow.mapSize.height = 2048; // default
		this.directional.shadow.camera.near = 1;    // default
		this.directional.shadow.camera.far = 700;     // default

		this.pointLight = new PointLight( 0xffffff, 1);
		this.pointLight.castShadow = true;
		this.pointLight.position.set(0, 5.3, 0);

		this.pointLight.shadow.mapSize.width = 2048; 
		this.pointLight.shadow.mapSize.height = 2048;
		this.pointLight.shadow.camera.near = 1;   
		this.pointLight.shadow.camera.far = 1000;    
		this.pointLight.shadow.bias = 0.0001;

		//this.pointLight.shadow.bias = 0.0001;
		this.pointLight.shadow.radius= 1;

		const helper = new PointLightHelper( this.pointLight, 1, new Color(0xffffff) );

		this.ambient = new AmbientLight( 0x333333 );

		this.scene.add( this.pointLight, helper, this.ambient, this.directional );

	}

	render( now ) {

		const dt = this.clock.getDelta();
		const time = this.clock.getElapsedTime();

		// this.directional.position.x = Math.sin( time * 0.1 ) * 10.0;
		//this.pointLight.position.z = Math.cos( time * 0.1 ) * 10.0;

		// Display

		this.controls.update();		
		
		this.postProcess.render( this.scene, this.camera );

		this.gpgpu.compute( dt, time );	

		this.particles.setMaterialUniforms( 'uTexturePosition', this.gpgpu.getRenderTexture( this.gpgpu.positionVariable ) );
		this.particles.setMaterialUniforms( 'uTextureVelocity', this.gpgpu.getRenderTexture( this.gpgpu.velocityVariable ) );
		
		this.particles.setMaterialDistancehUniforms( 'uTexturePosition', this.gpgpu.getRenderTexture( this.gpgpu.positionVariable ) );
		this.particles.setMaterialDistancehUniforms( 'uTextureVelocity', this.gpgpu.getRenderTexture( this.gpgpu.velocityVariable ) );
		
		requestAnimationFrame( this.render.bind( this ) );


	}

}
