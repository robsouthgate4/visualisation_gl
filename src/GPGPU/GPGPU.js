import { Scene, Mesh, PlaneBufferGeometry, OrthographicCamera } from "three"

export default class GPGPU {

    constructor({renderer}) {
        this.renderer = renderer
        this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)
        this.scene = new Scene()
        this.mesh = new Mesh(new PlaneBufferGeometry(1,1))
    }

    render(scene, camera, target) {
        this.renderer.render(scene, camera, target, false)
    }

    pass(shader, target) {
        this.mesh.material = shader.material
        this.renderer.render(this.scene, this.camera, target, false)
    }

    out(shader) {
        this.mesh.material = shader.material
        this.renderer.render(this.scene, this.camera)
    }

}