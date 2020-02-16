import { Points, ShaderMaterial, ShaderLib } from "three";

import Material from './Material'
import Geometry from './Geometry'

import particleDepthFragment from './shaders/particleDepthFragment.glsl'

import particleDepthVertex from './shaders/particleDepthVertex.glsl'

export default class Particles extends Points {

    constructor( { particleCount } ) {

        const geo = new Geometry( { particleCount } );
        const mat = new Material();

        super( geo, mat );        

        this.frustumCulled = false;
        this.receiveShadow = true;
        this.castShadow = true;

        this.customDepthMaterial = new ShaderMaterial( {

            vertexShader: particleDepthVertex, 
            fragmentShader: particleDepthFragment,
            uniforms: mat.uniforms

        });

    }

    setUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

	}

    update( time, dt ) {


    }

}