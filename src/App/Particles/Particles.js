import { Points, ShaderMaterial, ShaderLib, NoBlending, BackSide, DoubleSide } from "three";

import Material from './Material';
import Geometry from './Geometry';

import particleDepthFragment from './shaders/particleDepthFragment.glsl';
import particleDepthVertex from './shaders/particleDepthVertex.glsl';

import particleDistanceFragment from './shaders/particleDistanceFragment.glsl';
import particleDistanceVertex from './shaders/particleDistanceVertex.glsl';

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
            uniforms: mat.uniforms,
            //blending: NoBlending,
            side: BackSide
        });

        this.customDistanceMaterial = new ShaderMaterial( {

            vertexShader: particleDistanceVertex, 
            fragmentShader: particleDistanceFragment,
            uniforms: mat.uniforms,
            //blending: NoBlending,
            side: DoubleSide
        });

    }

    setMaterialUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

    }
    
    setMaterialDistancehUniforms( uniformName, value ) {

        this.customDistanceMaterial.uniforms[ uniformName ].value = value;
        this.customDepthMaterial.uniforms[ uniformName ].value = value;

	}

    update( time, dt ) {


    }

}