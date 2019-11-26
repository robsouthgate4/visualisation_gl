import { InstancedBufferGeometry, BufferAttribute, InstancedBufferAttribute } from "three";

export default class Geometry extends InstancedBufferGeometry {

    constructor( particleCount ) {
        super()
        
        /**
         * Create geo
         */

        const positions = new BufferAttribute(new Float32Array(4 * 3), 3)
        positions.setXYZ(0, -0.5, 0.5, 0.0)
        positions.setXYZ(1, 0.5, 0.5, 0.0)
        positions.setXYZ(2, -0.5, -0.5, 0.0)
        positions.setXYZ(3, 0.5, -0.5, 0.0)

        const uvs = new BufferAttribute(new Float32Array(4 * 2), 2)
        uvs.setXYZ(0, 0.0, 0.0)
        uvs.setXYZ(1, 1.0, 0.0)
        uvs.setXYZ(2, 0.0, 1.0)
        uvs.setXYZ(3, 1.0, 1.0)

        this.setAttribute('position', positions)
        this.setAttribute('uv', uvs)
        
        this.setIndex(new BufferAttribute(new Uint16Array([0,2,1,2,3,1]), 1))

        // Create instanced params

        const indices = new Uint16Array(particleCount)
        const offsets = new Float32Array(particleCount * 3)
        const angles = new Float32Array(particleCount)

        for (let i = 0; i < particleCount; i++) {
            
            offsets[i * 3 + 0] = Math.random() * 2
            offsets[i * 3 + 1] = Math.random() * 2
            offsets[i * 3 + 2] = Math.random() * 2

            indices[i] = i

            angles[i] =  Math.random() * Math.PI

        }

        this.setAttribute('pindex', new InstancedBufferAttribute(indices, 1, false))
        this.setAttribute('offset', new InstancedBufferAttribute(offsets, 3, false))
        this.setAttribute('angle', new InstancedBufferAttribute(angles, 1, false))

    }

}