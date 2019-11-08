import GPGPU from "./GPGPU"
import { ShaderMaterial } from "three"

import vertexShader from '../shaders/simulationVert.glsl'
import fragmentShader from '../shaders/simulationFrag.glsl'

export default class SimulationShader {

    constructor() {

        this.material = new ShaderMaterial({
            uniforms: {
                tPositions: { type: "t", value: null },
                tOrigins: { type: "t", value: null },
                opacity: { type: "f", value: 0 },
                timer: { type: "f", value: 0 }
            },
            vertexShader,
            fragmentShader
        })
        
    }

    setPositionTexture(positions) {
        this.material.uniforms.tPositions.value = positions
        return this
    }

    setOriginsTexture( origins ) {
        this.material.uniforms.tOrigins.value = origins
        return this
    }

    setOpacity( opacity ) {
        this.material.uniforms.opacity.value = opacity;
        return this
    }

    setTimer( timer ) {
        this.material.uniforms.timer.value = timer
        return this
    }

}

Object.assign(GPGPU, { SimulationShader });