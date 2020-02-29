
import Geometry from './Geometry';
import Material from './Material';
import { Mesh, Raycaster, Vector2 } from 'three';
import { Vector3 } from 'three/build/three.module';

export default class Globe extends Mesh {

	constructor( { particleCount = 100, settings, camera, scene } ) {

		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount );

		super( geo, mat );

		this.scene = scene;
		this.camera = camera;
		this.raycaster = new Raycaster();
		this.mouse = new Vector2();

		this.amplitude = 0;
		this.waveTime = 0;
		this.triggerWaveTime = true;


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

		

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update( dt ) {
		
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
		

	}

}