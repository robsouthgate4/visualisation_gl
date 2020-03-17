import FBOHelper from '../libs/THREE.FBOHelper';

import Triangle from '../Triangle'
import { WebGLRenderTarget, Vector2, ShaderMaterial, Mesh, Camera, OrthographicCamera, Scene, RGBFormat, LinearFilter } from 'three';

import triangleVertex from '../shaders/screenTriangle/triangleVert.glsl'
import triangleFragment from '../shaders/screenTriangle/triangleFrag.glsl'

const defaultVertex = triangleVertex;
const defaultFragment = triangleFragment;

import brightnessFragment from '../shaders/brightnessFragment.glsl'
import blurFragment from '../shaders/blurFragment.glsl'
import mixFragment from '../shaders/mixFragment.glsl'
import fxaaFragment from '../shaders/fxaaFragment.glsl'


export default class PostProcess {

    constructor( renderer ) {       

        this.renderer = renderer;
       
        this.fboHelper = new FBOHelper( this.renderer );

        this.scene =  new Scene();

        this.dummyCamera = new OrthographicCamera();

        this.geometry = new Triangle();

        this.resolution = new Vector2();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.getDrawingBufferSize( this.resolution );

        this.fboHelper.setSize( window.innerWidth, window.innerHeight );

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

        this.rtPost0 = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
        this.rtPost0.texture.generateMipmaps = false;

        this.rtPost1 = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter } );
        this.rtPost1.texture.generateMipmaps = false;

        this.rtPost2 = new WebGLRenderTarget( window.innerWidth / 8, window.innerHeight / 8, { minFilter: LinearFilter } );
        this.rtPost2.texture.generateMipmaps = false;

        this.rtPost3 = new WebGLRenderTarget( window.innerWidth / 8, window.innerHeight / 8, { minFilter: LinearFilter } );
        this.rtPost3.texture.generateMipmaps = false;

        // this.fboHelper.attach( this.rtPost1, 'Scene' );
        // this.fboHelper.attach( this.rtPost2, 'H blur' );
        // this.fboHelper.attach( this.rtPost3, 'V blur' );
        // this.fboHelper.attach( this.rtPost0, 'fxaa' );

    }

    resize() {

        this.rtPost0.setSize( window.innerWidth, window.innerHeight );
        this.rtPost1.setSize( window.innerWidth, window.innerHeight );
        this.rtPost2.setSize( window.innerWidth / 8, window.innerHeight / 8 );
        this.rtPost3.setSize( window.innerWidth / 8, window.innerHeight / 8 );

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    render ( scene, camera ) {        
        
        // Render initial scene

        this.renderer.setRenderTarget( this.rtPost1 );
        this.renderer.render( scene, camera );
        this.renderer.setRenderTarget( null );

        this.fxaaMaterial.uniforms.uTexture.value = this.rtPost1.texture;
        
        this.mesh.material = this.fxaaMaterial;

        // Render FXAA

        this.renderer.setRenderTarget( this.rtPost0 );
        this.renderer.render( this.scene, this.dummyCamera );
        this.renderer.setRenderTarget( null );

        this.brightnessMaterial.uniforms.uTexture.value = this.rtPost0.texture;
        
        this.mesh.material = this.brightnessMaterial;

        // Render brightness

        this.renderer.setRenderTarget( this.rtPost2 );
        this.renderer.render( this.scene, this.dummyCamera );
        this.renderer.setRenderTarget( null );        
        

        for ( var i = 0; i < 16; i ++ ) {

            // Horizontal blur

            this.blurMaterial.uniforms.uTexture.value = this.rtPost2.texture;
            this.blurMaterial.uniforms.uDelta.value = new Vector2( 1 / this.rtPost2.width, 0 );

            this.mesh.material = this.blurMaterial;

            this.renderer.setRenderTarget( this.rtPost3 )
            this.renderer.render( this.scene, this.dummyCamera);
            this.renderer.setRenderTarget( null );

            // Verical blur

            this.blurMaterial.uniforms.uTexture.value = this.rtPost3.texture;
            this.blurMaterial.uniforms.uDelta.value = new Vector2( 0, 1 / this.rtPost2.height );

            this.mesh.material = this.blurMaterial;

            this.renderer.setRenderTarget( this.rtPost2 );
            this.renderer.render( this.scene, this.dummyCamera);
            this.renderer.setRenderTarget( null );           

        }

        // Composite

        this.compositeMaterial.uniforms.uTexture1.value = this.rtPost0.texture; // fxaa
        this.compositeMaterial.uniforms.uTexture2.value = this.rtPost2.texture; // combined blur

        this.mesh.material = this.compositeMaterial;

        this.renderer.render( this.scene, this.dummyCamera );        

        this.fboHelper.update();

    }

}