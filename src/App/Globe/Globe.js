
import Geometry from './Geometry';
import Material from './Material';
import { Mesh } from 'three';

export default class Globe extends Mesh {

	constructor( { particleCount = 100, settings } ) {

		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount );

		super( geo, mat );

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update( dt ) {

		this.rotation.y += 0.02;

	}

}