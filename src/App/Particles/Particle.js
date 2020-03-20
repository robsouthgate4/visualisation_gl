
import Geometry from './Geometry';
import Material from './Material';
import { Mesh, Raycaster, Vector2 } from 'three';
import { Vector3 } from 'three/build/three.module';

import Gui from "../../Engine/Gui";


export default class Particle extends Mesh {

	constructor( { particleCount = 10, settings, camera, scene } ) {

		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount );

		super( geo, mat );

		this.scene = scene;
		this.camera = camera;

		this.mouse = new Vector2();
		this.raycaster = new Raycaster();

		// window.addEventListener( 'mousedown', ( e ) => {

		// 	this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
		// 	this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

		// 	this.raycaster.setFromCamera( this.mouse, this.camera );

		// 	const intersects = this.raycaster.intersectObjects( this.scene.children );

		// 	const mesh = intersects[ 0 ];

		// 	if ( mesh ) {

		// 		const face = mesh.face;

		// 		const point = mesh.point;

		// 		this.setUniforms( 'uPoint', point );

		// 	}			
			
		// } );
		

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update( dt, time ) {		

	}

}