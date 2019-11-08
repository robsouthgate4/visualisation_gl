// import Globals from "./Globals"
import {Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, ClampToEdgeWrapping} from 'three'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import GPGPU from "../GPGPU/GPGPU"
import SimulationShader from "../GPGPU/SimulationShader"

import FBOHelper from '../libs/THREE.FBOHelper'

console.log(FBOHelper)


export default class App {

    constructor() {

        this.scene = new Scene()
        this.canvas = document.getElementById('canvas')
        this.camera = new PerspectiveCamera(( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ) )

        this.renderer = new WebGLRenderer()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        document.body.appendChild( this.renderer.domElement )

        this.then = 0
        this.tapPosition = new Vector2()
        this.raycaster = new Raycaster()
        this.loadingManager = new LoadingManager()
        this.clock =  new Clock()

        this.gpgpu = new GPGPU({renderer: this.renderer})
        console.log(this.gpgpu)

        this.simulationShader = new GPGPU.SimulationShader()
        console.log(this.simulationShader)

        this.fboWidth = 512
        this.fboHeight = 512        

        this.rtTexturePos = new WebGLRenderTarget( this.fboWidth, this.fboHeight, {
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            type: FloatType,
            depthBuffer: false,
            stencilBuffer: false
        })

        this.rtTexturePos.texture.generateMipmaps = false

        this.rtTexturePos2 = this.rtTexturePos.clone()


        this.fbohelper = new FBOHelper(this.renderer)
        this.fbohelper.setSize(this.fboWidth, this.fboHeight)
        this.fbohelper.attach(this.rtTexturePos, 'Positions 1')

        // console.log(this.simulationShader)

        // console.log(this.gpgpu)

        this.init()       
        
    }

    init() {

        this._setupScene()
        requestAnimationFrame(this.render.bind(this))

    }

    _setupScene() {

        this.surface = new Mesh(
            new PlaneGeometry(100, 100, 1, 1),
            new MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 1.0,
                side: DoubleSide
            })
        )

        this.surface.rotateX(-Math.PI / 2)
        this.surface.position.set(0, 0, 0)
        this.scene.add(this.surface)

        this.scene.add(new AmbientLight(0x404040, 5))
        this.scene.add(new DirectionalLight(0xffffff, 1))

        this.camera.position.set(0, 3, 10)

    }

    render(now) {

        // this.gpgpu.pass( this.simulationShader.setPositionTexture( this.rtTexturePos ), this.rtTexturePos2 )
        // this.gpgpu.render( this.scene, this.camera, this.rtTexturePos )

        // Globals.deltaTime = this.clock.getDelta()
        // Globals.elapsedTime = this.clock.getElapsedTime()
        requestAnimationFrame(this.render.bind(this))


        this.fbohelper.update()

    }
}