
import Triangle from '../Triangle'
import { WebGLRenderTarget, Vector2, ShaderMaterial, Mesh, Camera, OrthographicCamera, Scene, RGBFormat, LinearFilter, ShadowMaterial } from 'three';

import triangleVertex from './shaders/screenTriangle/triangleVert.glsl';
import triangleFragment from './shaders/screenTriangle/triangleFrag.glsl';

const defaultVertex = triangleVertex;
const defaultFragment = triangleFragment;

import brightnessFragment from './shaders/brightnessFragment.glsl';
import blurFragment from './shaders/blurFragment.glsl';
import mixFragment from './shaders/mixFragment.glsl';
import fxaaFragment from './shaders/fxaaFragment.glsl';


export default class PostProcess {

    constructor( renderer, particles, fboHelper ) {       

        this.renderer = renderer;

        this.fboHelper = fboHelper;

        this.particles = particles;       

        this.scene =  new Scene();

        this.dummyCamera = new OrthographicCamera();

        this.geometry = new Triangle();

        this.resolution = new Vector2();

        this.renderer.getDrawingBufferSize( this.resolution );

        this.material = new ShaderMaterial( {

            fragmentShader: defaultFragment,
            vertexShader: defaultVertex,
            uniforms: {
                uTexture: { value: null },
                uResolution: { value: new Vector2( window.innerWidth, window.innerHeight ) }
            }

        } );

        this.brightnessMaterial = new ShaderMaterial( {
            vertexShader: defaultVertex,
            fragmentShader: brightnessFragment,
            uniforms: {
                uTexture: { value: null },
                uResolution: { value: new Vector2( window.innerWidth, window.innerHeight ) }
            }
        } );

        this.blurMaterial = new ShaderMaterial( {
            vertexShader: defaultVertex,
            fragmentShader: blurFragment,
            uniforms: {
                uTexture: { value: null },
                uResolution: { value: new Vector2( window.innerWidth, window.innerHeight ) },
                uDelta: { value: new Vector2() }
            }
        } );

        this.compositeMaterial = new ShaderMaterial( {
            vertexShader: defaultVertex,
            fragmentShader: mixFragment,
            uniforms: {
                uTexture1: { value: null },
                uTexture2: { value: null },
                uResolution: { value: new Vector2( window.innerWidth, window.innerHeight ) },
            }
        } );

        this.fxaaMaterial = new ShaderMaterial( {
            vertexShader: defaultVertex,
            fragmentShader: fxaaFragment,
            uniforms: {
                uTexture: { value: null },
                uResolution: { value: new Vector2( window.innerWidth, window.innerHeight ) },
            }
        } );

        this.mesh = new Mesh( this.geometry, this.material );

        this.scene.add( this.mesh );

        this.baseSceneRT = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
        this.baseSceneRT.texture.generateMipmaps = false;

        this.fxaaRT = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
        this.fxaaRT.texture.generateMipmaps = false;        

        this.hBlurRT = new WebGLRenderTarget( window.innerWidth / 8, window.innerHeight / 8, { minFilter: LinearFilter } );
        this.hBlurRT.texture.generateMipmaps = false;

        this.vBlurRT = new WebGLRenderTarget( window.innerWidth / 8, window.innerHeight / 8, { minFilter: LinearFilter } );
        this.vBlurRT.texture.generateMipmaps = false;

        this.motionRT = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
        this.motionRT.texture.generateMipmaps = false;        

        this.fboHelper.attach( this.baseSceneRT, 'Scene' );
        this.fboHelper.attach( this.hBlurRT, 'H blur' );
        this.fboHelper.attach( this.vBlurRT, 'V blur' );
        this.fboHelper.attach( this.fxaaRT, 'fxaa' );
        this.fboHelper.attach( this.motionRT, 'motion' );

    }

    resize() {

        this.fxaaRT.setSize( window.innerWidth, window.innerHeight );
        this.baseSceneRT.setSize( window.innerWidth, window.innerHeight );
        this.hBlurRT.setSize( window.innerWidth / 8, window.innerHeight / 8 );
        this.vBlurRT.setSize( window.innerWidth / 8, window.innerHeight / 8 );

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    render ( scene, camera ) {        
        
        // Render initial scene

        this.renderer.setRenderTarget( this.baseSceneRT );
        this.renderer.render( scene, camera );
        this.renderer.setRenderTarget( null );

        this.fxaaMaterial.uniforms.uTexture.value = this.baseSceneRT.texture;
        
        this.mesh.material = this.fxaaMaterial;

        // Render FXAA

        this.renderer.setRenderTarget( this.fxaaRT );
        this.renderer.render( this.scene, this.dummyCamera );
        this.renderer.setRenderTarget( null );

        // this.particles.material = this.particles.motionMaterial;

        // this.renderer.setRenderTarget( this.motionRT );
        // this.renderer.render( this.scene, this.dummyCamera );
        // this.renderer.setRenderTarget( null );


        this.brightnessMaterial.uniforms.uTexture.value = this.fxaaRT.texture;
        
        this.mesh.material = this.brightnessMaterial;

        // Render brightness

        this.renderer.setRenderTarget( this.hBlurRT );
        this.renderer.render( this.scene, this.dummyCamera );
        this.renderer.setRenderTarget( null );        
        

        for ( var i = 0; i < 16; i ++ ) {

            // Horizontal blur

            this.blurMaterial.uniforms.uTexture.value = this.hBlurRT.texture;
            this.blurMaterial.uniforms.uDelta.value = new Vector2( 1 / this.hBlurRT.width, 0 );

            this.mesh.material = this.blurMaterial;

            this.renderer.setRenderTarget( this.vBlurRT )
            this.renderer.render( this.scene, this.dummyCamera);
            this.renderer.setRenderTarget( null );

            // Verical blur

            this.blurMaterial.uniforms.uTexture.value = this.vBlurRT.texture;
            this.blurMaterial.uniforms.uDelta.value = new Vector2( 0, 1 / this.hBlurRT.height );

            this.mesh.material = this.blurMaterial;

            this.renderer.setRenderTarget( this.hBlurRT );
            this.renderer.render( this.scene, this.dummyCamera);
            this.renderer.setRenderTarget( null );           

        }

        // Composite

        this.compositeMaterial.uniforms.uTexture1.value = this.fxaaRT.texture; // fxaa
        this.compositeMaterial.uniforms.uTexture2.value = this.hBlurRT.texture; // combined blur

        this.mesh.material = this.compositeMaterial;

        this.renderer.render( this.scene, this.dummyCamera );

    }

}