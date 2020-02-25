import { Points, ShaderMaterial, ShaderLib, NoBlending, BackSide, DoubleSide } from "three";

import Material from './Material';
import Geometry from './Geometry';

import particleDepthFragment from './shaders/particleDepthFragment.glsl';
import particleDepthVertex from './shaders/particleDepthVertex.glsl';

import particleDistanceFragment from './shaders/particleDistanceFragment.glsl';
import particleDistanceVertex from './shaders/particleDistanceVertex.glsl';

import MotionMaterial from '../../PostProcess/materials/MotionMaterial';

export default class Particles extends Points {

    constructor( { particleCount } ) {

        const geo = new Geometry( { particleCount } );
        const mat = new Material();
        const motionMaterial = new MotionMaterial();

        super( geo, motionMaterial );        

       // this.receiveShadow = true;
        //this.castShadow = true;





        // this.customDistanceMaterial = new ShaderMaterial( {

        //     vertexShader: particleDistanceVertex, 
        //     fragmentShader: particleDistanceFragment,
        //     uniforms: mat.uniforms,
        //     depthTest: true,
        //     depthWrite: true,
        //     blending: NoBlending,
        //     side: BackSide

        // });

        

    }

    setMaterialMotionUniforms( uniformName, value ) {

        this.material.uniforms[ uniformName ].value = value;

    }

    setMaterialUniforms( uniformName, value ) {

		this.material.uniforms[ uniformName ].value = value;

    }
    
    setMaterialDistanceUniforms( uniformName, value ) {

       //this.customDistanceMaterial.uniforms[ uniformName ].value = value;
        //this.customDepthMaterial.uniforms[ uniformName ].value = value;

	}

    update( time, dt ) {


    }

}