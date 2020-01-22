
import Geometry from './Geometry';
import Material from './Material';
import { Mesh } from 'three';

export default class InstancedParticles extends Mesh {

	constructor( { particleCount, settings } ) {

		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount );

		super( geo, mat );

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

}