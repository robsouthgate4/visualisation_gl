import { InstancedBufferGeometry, BufferAttribute, InstancedBufferAttribute, BufferGeometry, SphereBufferGeometry } from "three";

export default class Geometry extends BufferGeometry {

	constructor( particleCount, settings ) {

		super();

		const sphereBufferGeo = new SphereBufferGeometry(1, 128, 128);

		Object.keys(sphereBufferGeo.attributes).forEach( attributeName => {
			
			this.attributes[attributeName] = sphereBufferGeo.attributes[attributeName];

		} );

		this.index = sphereBufferGeo.index;

	}

}