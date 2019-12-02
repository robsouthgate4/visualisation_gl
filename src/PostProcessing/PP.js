import { OrthographicCamera, Scene, Mesh, PlaneBufferGeometry } from "three";

export default class PP {

	constructor( renderer ) {

		this.renderer = renderer;
		this.camera = new OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );
		this.scene = new Scene();
		this.mesh = new Mesh( new PlaneBufferGeometry( 1, 1 ) );
		this.scene.add( this.mesh );

	}	
     
     
	render( scene, camera, target ) {

        // Render the passed scene to a render target

		this.renderer.setRenderTarget( target );
		this.renderer.render( scene, camera );
		this.renderer.setRenderTarget( null );

	}	
    
     
	pass( shader, target ) {

        // Add a render pass

		this.mesh.material = shader.material;
		this.renderer.setRenderTarget( target );
		this.renderer.render( this.scene, this.camera );
		this.renderer.setRenderTarget( null );

	}

	
	out( shader ) {

        // Render the final output to the full squeen quad

		this.mesh.material = shader.material;
		this.renderer.render( this.scene, this.camera );

	}

}
