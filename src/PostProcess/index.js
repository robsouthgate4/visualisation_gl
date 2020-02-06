import FBOHelper from '../libs/THREE.FBOHelper';

import Triangle from '../Triangle'
import { WebGLRenderTarget, Vector2, ShaderMaterial, Mesh, Camera, OrthographicCamera, Scene  } from 'three';

import triangleVertex from '../shaders/screenTriangle/triangleVert.glsl'
import triangleFragment from '../shaders/screenTriangle/triangleFrag.glsl'

const defaultVertex = triangleVertex;
const defaultFragment = triangleFragment;

export default class PostProcessing {

    constructor( { renderer, screenGeo = new Triangle(), targetOnly = null } ) {
        
        this.renderer = renderer;

        this.targetOnly = targetOnly;

        this.passes = [];

        this.screenGeometry = screenGeo;

        this.camera = new OrthographicCamera();
        this.scene = new Scene();

        const rendererSize = new Vector2();
        this.renderer.getDrawingBufferSize( rendererSize );

        this.width = rendererSize.x;
        this.height = rendererSize.y;

        this.fbo = this.createDoubleFBO();
        this.fbo.read.flipY = true;
        this.fbo.write.flipY = true;

        this.uniform = { value: null };

    }

    addPass( { 

        name = '',
        scene,
        vertex = defaultVertex,
        fragment = defaultFragment,
        uniforms = {},
        textureUniform = 'tMap',
        enabled = true

    } ) {

        // FBO Helper

		this.fbohelper = new FBOHelper( this.renderer );
		this.fbohelper.setSize( this.width, this.height );

        uniforms[ textureUniform ] = { value: this.fbo.read.texture };

        const material = new ShaderMaterial( { 

            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms

        } );

        

        const mesh = new Mesh( this.screenGeometry, material );
        mesh.frustumCulled = false;

        const pass = {

            mesh,
            material,
            uniforms,
            enabled,
            textureUniform,
            scene
        };

        this.passes.push( pass );

        this.fbohelper.attach( this.fbo.write, name )

        return pass;

    }

    createDoubleFBO() {

        return {

            read: new WebGLRenderTarget( this.width, this.height, { depthBuffer: false, stencilBuffer: false  } ),
            write: new WebGLRenderTarget( this.width, this.height, { depthBuffer: false, stencilBuffer: false } ),

            swap: () => {

                let temp = this.read;
                this.read = this.write;
                this.write = temp;

            }

        }

    }

    resize( { width, height, dpr } ) {

        if ( dpr ) this.dpr = dpr;

        if ( width ) {

            this.width = width;
            this.height = height || width;

        }

        dpr = this.dpr || this.renderer.getPixelRatio();
        width = ( this.width || this.renderer.width ) * dpr;
        height = ( this.height || this.renderer.height ) * dpr;

        this.fbo.read.setSize( width, height );
        this.fbo.write.setSize( width, height );

    }

    render( {

        scene,
        camera,
        target = null,
        update = true,
        sort = true,
        frustumCull = true

    } ) {

        const enabledPasses = this.passes.filter( pass => pass.enabled );

        //this.renderer.setRenderTarget( this.fbo.write );
        
        //this.renderer.setRenderTarget( null );

        this.fbo.swap();
        
        // enabledPasses.forEach( ( pass, i ) => {

        //     pass.mesh.material.uniforms[ pass.textureUniform ].value = this.fbo.read.texture;

        //     this.renderer.setRenderTarget( this.fbo.write )
        //     this.renderer.render( pass.scene, camera );
        //     this.renderer.setRenderTarget( null );

        //     this.fbo.swap();

        // } );

        this.renderer.render( scene, camera );

        this.fbohelper.update();

        this.uniform.value = this.fbo.read.texture;

    }

}