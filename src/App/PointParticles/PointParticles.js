

import Geometry from './Geometry';
import Material from './Material';
import { Mesh, Points } from 'three';

export default class PointParticles extends Points {

	constructor( { particleCount, settings } ) {

		const geo = new Geometry( particleCount, settings );
		const mat = new Material( particleCount );

		super( geo, mat );

		this.frustumCulled = false;

	}

	setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

}