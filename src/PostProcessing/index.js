import { ShaderMaterial, WebGLRenderTarget, LinearFilter, ClampToEdgeWrapping, RGBFormat, UnsignedByteType, RGBAFormat } from "three";

import Triangle from './Triangle';

import triangleVert from '../shaders/sceenTriangle/triangleVert.glsl';
import triangleFrag from '../shaders/sceenTriangle/triangleFrag.glsl';

import { FilmShader } from "three/examples/jsm/shaders/FilmShader.js";
import { UniformsUtils, Vector2, Mesh } from "three/build/three.module";
import FBOHelper from "../libs/THREE.FBOHelper";



export default class PostProcessing {

    constructor( { renderer, scene, camera, FBOHelper } ) {

        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        this.fboHelper = FBOHelper;

        var shader = FilmShader;

        this.uniforms = UniformsUtils.clone( shader.uniforms );

        this.material = new ShaderMaterial( {

            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        } );


        this.screenTriangle = new Triangle();

		this.displayProgram = new ShaderMaterial({
			vertexShader: triangleVert,
			fragmentShader: triangleFrag,
			uniforms: {
				uTexture: { type: 't', value: null },
				uResolution: { value: new Vector2( window.innerWidth, window.innerHeight ) },
				uTexelSize: { type: 'v2', value: new Vector2() }
			}
		});

        this.screenMesh = new Mesh( this.screenTriangle, this.displayProgram );
        
        this.target = new WebGLRenderTarget(1, 1, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT:ClampToEdgeWrapping,
            format: RGBAFormat,
            type: UnsignedByteType,
            stencilBuffer: false,
            depthBuffer: true
        }); 

        this.target.setSize( window.innerWidth, window.innerHeight );

        this.fboHelper.attach( this.target, 'Post Processing' );


        //this.scene.add( this.screenMesh );


    }

    render() {

        this.renderer.setRenderTarget( this.target );
        this.renderer.render( this.scene, this.camera );
        this.renderer.setRenderTarget( null );

    }

}