import { Points, BufferGeometry, BufferAttribute } from "three";


export default class Geometry extends BufferGeometry {

    constructor( { particleCount } ) {

        super();

		// Create Geometry


		const indices = new Uint16Array( particleCount );
		const colors = new Float32Array( particleCount * 3 );
		const scales = new Float32Array( particleCount );
        const lifes = new Float32Array( particleCount );
		const positions = new Float32Array( particleCount * 3 );

		for ( let i = 0; i < particleCount; i ++ ) {

            positions[ i * 3 + 0 ] = ( i % Math.sqrt( particleCount ) ) / Math.sqrt( particleCount );
			positions[ i * 3 + 1 ] = ~~( i / Math.sqrt( particleCount ) ) / Math.sqrt( particleCount );
			positions[ i * 3 + 2 ] = 0;

			colors[ i * 3 + 0 ] = Math.random();
			colors[ i * 3 + 1 ] = Math.random();
			colors[ i * 3 + 2 ] = Math.random();

			scales[ i ] = Math.random() + 1;

			// lifes[i] = settings.lifeRange[ 0 ] + Math.random() * ( settings.lifeRange[ 1 ] - settings.lifeRange[ 0 ] );

			indices[ i ] = i;

        }

		this.setAttribute( 'pindex', new BufferAttribute( indices, 1, false ) );
		this.setAttribute( 'position', new BufferAttribute( positions, 3, false ) );
		this.setAttribute( 'aColor', new BufferAttribute( colors, 3, false ) );
		this.setAttribute( 'aScale', new BufferAttribute( scales, 1, false ) );
		this.setAttribute( 'aLife', new BufferAttribute( lifes, 1, false ) );

    }

}