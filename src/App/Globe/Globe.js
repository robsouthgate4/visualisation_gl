
import Geometry from './Geometry';
import Material from './Material';
import { Mesh, Raycaster, Vector2, CubeRefractionMapping, Vector3, CubeCamera, LinearMipMapLinearFilter, CubeTextureLoader  } from 'three';

export default class Globe extends Mesh {

	constructor( { particleCount = 100, settings, camera, scene, renderer } ) {

		const cubeMapTexture = new CubeTextureLoader()
										.setPath( 'assets/images/env/city/' )
										.load( [
											'px.png',
											'nx.png',
											'py.png',
											'ny.png',
											'pz.png',
											'nz.png'
										] );


		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount, cubeMapTexture );

		super( geo, mat );

		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.raycaster = new Raycaster();
		this.mouse = new Vector2();

		this.scene.background = cubeMapTexture;
		this.scene.background.generateMipmaps = true;

		this.amplitude = 0;
		this.waveTime = 0;
		this.triggerWaveTime = true;

		this.renderOrder = 1;


		window.addEventListener( 'mousedown', ( e ) => {

			this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;


			this.raycaster.setFromCamera( this.mouse, this.camera );

			const intersects = this.raycaster.intersectObjects( this.scene.children );

			const mesh = intersects[ 0 ];

			if ( mesh ) {

				const face = mesh.face;

				const point = mesh.point;

				this.setUniforms( 'uPoint', point );
				
				this.amplitude = 0.6;
				this.waveTime = 0;
				this.triggerWaveTime = true;

			}

			
			
		} );


		this.setupCubeCamera();

		

	}

	setupCubeCamera() {

		this.cubeCamera = new CubeCamera( 1, 100, 1024 );
		this.cubeCamera.renderTarget.texture.generateMipmaps = true;
		this.cubeCamera.renderTarget.texture.minFilter = LinearMipMapLinearFilter;
		this.cubeCamera.renderTarget.texture.mapping = CubeRefractionMapping;
		this.cubeCamera.position.set( 0, 0, 3 );

		this.visible = false;

		this.scene.add( this.cubeCamera );

		this.cubeCamera.update( this.renderer, this.scene );
		

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update( dt ) {

		this.visible = false;

		this.cubeCamera.update( this.renderer, this.scene );
		
		if ( this.triggerWaveTime ) {

			this.waveTime += 0.003;

		}

		if ( this.waveTime >= 6.0 ) {

			this.waveTime = 0.0;

			this.triggerWaveTime = false;

		}

		if ( this.amplitude > 0.03 ) {

			this.amplitude *= 0.99;

		 }

		 if ( this.waveTime > 0.01 ) {

			//this.waveTime *= 0.8;

		 }

		 this.setUniforms( 'uAmp', this.amplitude );
		 this.setUniforms( 'uWaveTime', this.waveTime );
		 this.setUniforms( 'uEnvMap', this.cubeCamera.renderTarget.texture  );
		

	}

}