
import Geometry from './Geometry';
import Material from './Material';
import { Mesh } from 'three';

export default class InstancedParticles extends Mesh {

	constructor( { particleCount } ) {		

		const geo = new Geometry( particleCount );
		const mat = new Material( particleCount );

		super( geo, mat );

		this.time = 0;

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

	update () {

		this.time ++;
		this.material.uniforms.uTime.value = this.time;

	}

}
