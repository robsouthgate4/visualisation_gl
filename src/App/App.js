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
	AmbientLight,
	ShadowMaterial,
	TextureLoader} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PostProcess from '../PostProcess';

import GPGPU from '../GPGPU'
import Particles from "./Particles/Particles";

export default class App {

	constructor() {

		this.renderer = new WebGLRenderer( { logarithmicDepthBuffer: true } );
		this.renderer.setPixelRatio( 1 );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( new Color( 'rgb( 20, 20, 20 )' ), 1.0 );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		
		
		document.body.appendChild( this.renderer.domElement );

		this.resolution = new Vector2();
		this.renderer.getDrawingBufferSize( this.resolution );		

		// Scene

		this.scene = new Scene();
		window.scene = this.scene;
		
		this.canvas = document.getElementById( 'canvas' );
		this.camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );

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
		this.particles.position.set( 0, 2, 0 );

		this.particles.setMaterialUniforms( 'uTexturePosition', this.gpgpu.positionVariable );
		this.particles.setMaterialDistancehUniforms( 'uTexturePosition', this.gpgpu.positionVariable );


		this.particles.setMaterialUniforms( 'uTextureMatCap', new TextureLoader().load( 'assets/images/matcap5.png' ));

		this.scene.add( this.particles );


		const sphereGeo =  new SphereGeometry( 0.1, 24, 24, );
		
		const mat = new MeshStandardMaterial( {
			color: new Color( 'rgb( 10, 10, 10 )' )
		} );

		const sphereMesh = new Mesh( sphereGeo, mat );

		sphereMesh.position.set( 0, 2, -0.5 );
		sphereMesh.castShadow = true;
		sphereMesh.receiveShadow = true;
		sphereMesh.frustumCulled = false

		this.scene.add( sphereMesh );

		this.camera.position.set( 0, 6, 4 );	
		//this.camera.lookAt( this.particles.position );

		this.controls.update();


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

		this.floorGeo = new PlaneGeometry( 400, 400 );
		this.floorMaterial = new MeshStandardMaterial( { color: new Color( 'rgb( 170, 160, 150 )' ) } );
		this.floorMaterial.roughness = 0.7;
		this.floorMaterial.metalness = 1.0;
		this.floorMaterial.side = DoubleSide;
		this.floorMesh = new Mesh( this.floorGeo, this.floorMaterial );
		this.floorMesh.rotateX( Math3.degToRad( 90 ) );
		this.floorMesh.position.set( 0, 0, 0 );
		//this.floorMesh.receiveShadow = true;
		//this.scene.add( this.floorMesh );

		this.shadowPlaneGeo = this.floorGeo.clone();
		this.shadowPlaneMaterial = new ShadowMaterial();
		this.shadowPlaneMaterial.opacity = 0.2;
		this.shadowPlaneMesh = new Mesh( this.shadowPlaneGeo, this.shadowPlaneMaterial );
		this.shadowPlaneMesh.rotateX( Math3.degToRad( -90 ) );
		this.shadowPlaneMesh.position.set( 0, 0, 0 );
		this.shadowPlaneMesh.receiveShadow = true;
		this.scene.add( this.shadowPlaneMesh );

		this.directional = new DirectionalLight( 0xffffff, 0.5 );
		this.directional.position.set(0, 100, 0 );
		this.directional.castShadow = true;

		this.directional.shadow.mapSize.width = 1024; 
		this.directional.shadow.mapSize.height = 1024;
		this.directional.shadow.camera.near = 1;   
		this.directional.shadow.camera.far = 1000;    

		this.pointLight = new PointLight( 0xffffff, 1);
		this.pointLight.castShadow = true;
		this.pointLight.position.set(0, 5.0, 0);

		this.pointLight.shadow.mapSize.width = 1024; 
		this.pointLight.shadow.mapSize.height = 1024;
		this.pointLight.shadow.camera.near = 1;   
		this.pointLight.shadow.camera.far = 1000;    
		this.pointLight.shadow.bias = 0.00005;

		const d = 300;

		this.pointLight.shadow.camera.left = - d;
		this.pointLight.shadow.camera.right = d;
		this.pointLight.shadow.camera.top = d;
		this.pointLight.shadow.camera.bottom = - d;

		//this.pointLight.shadow.bias = 0.0001;
		this.pointLight.shadow.radius= 4;

		const helper = new PointLightHelper( this.pointLight, 1, new Color(0xffffff) );

		this.ambient = new AmbientLight( 0x333333 );

		this.scene.add( this.pointLight, helper, this.ambient, this.directional );

	}

	render( now ) {

		const dt = this.clock.getDelta();
		const time = this.clock.getElapsedTime();

		// this.directional.position.x = Math.sin( time * 0.1 ) * 10.0;
		//this.pointLight.position.z = Math.cos( time * 0.1 ) * 10.0;

		//this.pointLight.position.z = 5.3 + Math.sin( uTime * )

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
