import { WebGLRenderTarget, Vector2, ShaderMaterial, Mesh, Camera, OrthographicCamera, Scene, RGBFormat, LinearFilter, DataTexture, RGBAFormat, FloatType, ClampToEdgeWrapping, UVMapping, NearestFilter, HalfFloatType } from 'three';
import Triangle from '../Triangle';


import triangleVertex from '../shaders/screenTriangle/triangleVert.glsl';
import triangleFragment from '../shaders/screenTriangle/triangleFrag.glsl';

const defaultVertex = triangleVertex;
const defaultFragment = triangleFragment;


export default class GPGPU {

	constructor( {
		// Always pass in array of vec4s (RGBA values within texture)
		data = new Float32Array( 16 ),
		geometry = new Triangle(),
        type = HalfFloatType, // Pass in gl.FLOAT to force it, defaults to gl.HALF_FLOAT
        renderer,
        name = '',
        fboHelper
	} ) {

        this.renderer = renderer;
        this.name = name;
        this.fboHelper = fboHelper;

		const initialData = data;
		this.passes = [];
		this.geometry = geometry;
        this.dataLength = initialData.length / 4;
        
        this.scene = new Scene();
        this.dummyCamera = new OrthographicCamera();

		// Windows and iOS only like power of 2 textures
		// Find smallest PO2 that fits data
		this.size = Math.pow( 2, Math.ceil( Math.log( Math.ceil( Math.sqrt( this.dataLength ) ) ) / Math.LN2 ) );

		// Create coords for output texture
		this.coords = new Float32Array( this.dataLength * 2 );

		for ( let i = 0; i < this.dataLength; i ++ ) {

			const x = ( i % this.size ) / this.size; // to add 0.5 to be center pixel ?
			const y = Math.floor( i / this.size ) / this.size;
			this.coords.set( [ x, y ], i * 2 );

		}

		// Use original data if already correct length of PO2 texture, else copy to new array of correct length
		const floatArray = ( () => {

			if ( initialData.length === this.size * this.size * 4 ) {

				return initialData;

			} else {

				const a = new Float32Array( this.size * this.size * 4 );
				a.set( initialData );

				return a;

			}

        } )();


		this.dataTexture = new DataTexture(
			floatArray,
			this.size,
			this.size,
			RGBAFormat,
			FloatType,
			UVMapping,
			ClampToEdgeWrapping,
			ClampToEdgeWrapping,
			NearestFilter,
			NearestFilter
		);

		this.material = new ShaderMaterial( {

			fragmentShader: defaultFragment,
			vertexShader: defaultVertex,
			uniforms: {
				uTexture: { value: null },
				uResolution: { value: new Vector2( this.size, this.size ) }
			}

		} );


		// Create FBOs

		const options = {
			minFilter: NearestFilter,
			format: RGBAFormat,
			type: FloatType,
			depthBuffer: false,
			stencilBuffer: false
		};

		this.fbo = {
			read: new WebGLRenderTarget( this.size, this.size, options ),
			write: new WebGLRenderTarget( this.size, this.size, options ),
			swap: () => {

				let temp = this.fbo.read;
				this.fbo.read = this.fbo.write;
				this.fbo.write = temp;
				this.dataTexture = this.fbo.read.texture;

			},
		};

        this.mesh = new Mesh( this.geometry, this.material );
        
        
        this.fboHelper.setSize( this.size, this.size );

        this.fboHelper.attach(  this.fbo.read, ` ${ this.name } read` );
        this.fboHelper.attach(  this.fbo.write, ` ${ this.name } write`, );



	}

	addPass( {
		vertex = defaultVertex,
		fragment = defaultFragment,
		uniforms = {},
		textureUniform = 'uTexture',
		enabled = true,
	} ) {

		uniforms[ textureUniform ] = this.dataTexture;

		const material = new ShaderMaterial( {

			vertexShader: vertex,
			fragmentShader: fragment,
			uniforms: uniforms

		} );

		const pass = {
			material,
			uniforms,
			enabled,
			textureUniform,
		};

		this.passes.push( pass );
		return pass;

	}

	render() {

        const enabledPasses = this.passes.filter( pass => pass.enabled );

		enabledPasses.forEach( ( pass, i ) => {

            this.renderer.setRenderTarget( this.fbo.write );            
            this.renderer.render( this.scene, this.dummyCamera );
            this.renderer.setRenderTarget( null );

            this.mesh.material = pass.material;
            
            this.fbo.swap();
            
		});
	}

}
