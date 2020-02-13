import { Points } from "three";

import Material from './Material'
import Geometry from './Geometry'

export default class Particles extends Points {

    constructor( { particleCount } ) {

        const geo = new Geometry( { particleCount } );
        const mat = new Material();

        super( geo, mat );        

        this.frustumCulled = false;
        this.receiveShadow = true;
        this.castShadow = true;

    }

    setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

    update( time, dt ) {


    }

}