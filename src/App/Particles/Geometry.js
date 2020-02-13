import { Points, BufferGeometry, BufferAttribute } from "three";


export default class Geometry extends BufferGeometry {

    constructor( { particleCount } ) {

        super();

		// Create Geometry

		const positions = new Float32Array( particleCount * 3 ); 
		this.setAttribute( 'position', new BufferAttribute( positions, 3 ) );


		const indices = new Uint16Array( particleCount );
		const offsets = new Float32Array( particleCount * 3 );
		const scales = new Float32Array( particleCount );
        const lifes = new Float32Array( particleCount );
		const references = new Float32Array( particleCount * 2 );
		
		console.log( Math.sqrt( particleCount ) )

		for ( let i = 0; i < particleCount; i ++ ) {

            references[ i * 3 + 0 ] = ( i % Math.sqrt( particleCount ) ) / Math.sqrt( particleCount );
            references[ i * 3 + 1 ] = ~~( i / Math.sqrt( particleCount ) ) / Math.sqrt( particleCount );

			offsets[ i * 3 + 0 ] = Math.random() * 2 - 1;
			offsets[ i * 3 + 1 ] = Math.random() * 2 - 1;
			offsets[ i * 3 + 2 ] = Math.random() * 2 - 1;

			scales[ i ] = Math.random() + 1;

			// lifes[i] = settings.lifeRange[ 0 ] + Math.random() * ( settings.lifeRange[ 1 ] - settings.lifeRange[ 0 ] );

			indices[ i ] = i;

        }
        
        console.log( references );

        this.setAttribute( 'pindex', new BufferAttribute( indices, 1, false ) );
        this.setAttribute( 'aReference', new BufferAttribute( references, 2, false ) );
		this.setAttribute( 'aOffset', new BufferAttribute( offsets, 3, false ) );
		this.setAttribute( 'aScale', new BufferAttribute( scales, 1, false ) );
		this.setAttribute( 'aLife', new BufferAttribute( lifes, 1, false ) );

    }

}