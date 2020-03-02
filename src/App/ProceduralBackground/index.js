
import Material from './Material';
import { Mesh, Raycaster, Vector2 } from 'three';
import { Vector3 } from 'three/build/three.module';

import Triangle from '../../Triangle'

export default class ProceduralBackground extends Mesh {

	constructor( ) {

		const geo = new Triangle();
		const mat = new Material();

		super( geo, mat );

		this.renderOrder = -10000;
		

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update( dt ) {
		

	}

}