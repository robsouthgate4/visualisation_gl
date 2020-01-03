import { InstancedBufferGeometry, BufferAttribute, InstancedBufferAttribute, BoxGeometry, BoxBufferGeometry, Math as ThreeMath } from "three";

export default class Geometry extends InstancedBufferGeometry {

	constructor( particleCount ) {

		super();

		// Create Geometry

		const boxGeometry = new BoxBufferGeometry( 1, 1, 1 );

		Object.keys(boxGeometry.attributes).forEach( attributeName => {
			
			this.attributes[attributeName] = boxGeometry.attributes[attributeName];

		} );

		this.index = boxGeometry.index;

		// Create instanced params

		const indices = new Uint16Array( particleCount );
		const offsets = new Float32Array( particleCount * 3 );
		const colors = new Float32Array( particleCount * 3 );
		const scale = new Float32Array( particleCount );
		const angles = new Float32Array( particleCount );

		for ( let i = 0; i < particleCount; i ++ ) {

			offsets[ i * 3 + 0 ] = Math.random() * 2;
			offsets[ i * 3 + 1 ] = Math.random() * 2;
			offsets[ i * 3 + 2 ] = Math.random() * 2;

			colors[ i * 3 + 0 ] = Math.random();
			colors[ i * 3 + 1 ] = Math.random();
			colors[ i * 3 + 2 ] = Math.random();

			scale[ i ] = Math.random() + 1;

			indices[ i ] = i;

			angles[ i ] = ThreeMath.degToRad( Math.random() * 360 );

		}

		this.setAttribute( 'pindex', new InstancedBufferAttribute( indices, 1, false ) );
		this.setAttribute( 'offset', new InstancedBufferAttribute( offsets, 3, false ) );
		this.setAttribute( 'angle', new InstancedBufferAttribute( angles, 1, false ) );
		this.setAttribute( 'scale', new InstancedBufferAttribute( scale, 1, false ) );

	}

}
