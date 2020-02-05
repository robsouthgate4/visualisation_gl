
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

		window.addEventListener( 'mousedown', ( e ) => {

			this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;


			this.raycaster.setFromCamera( this.mouse, this.camera );

			const intersects = this.raycaster.intersectObjects( this.scene.children );
			

			const mesh = intersects[ 0 ];

			if ( mesh ) {

				console.log( mesh );

				const face = mesh.face;

				const point = mesh.point;

				this.setUniforms( 'uPoint', point );

				// const vertices = mesh.object.geometry.vertices;
				// const v = new Vector3();

				

				// v.x = ( vertices[face.a].x + vertices[face.b].x + vertices[face.c].x ) / 3;
				// v.y = ( vertices[face.a].y + vertices[face.b].y + vertices[face.c].y ) / 3;
				// v.z = ( vertices[face.a].z + vertices[face.b].z + vertices[face.c].z ) / 3;

				// console.log( v );

			}

			
			
		} );

		

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update( dt ) {

		//this.rotation.y += 0.02;

	}

}