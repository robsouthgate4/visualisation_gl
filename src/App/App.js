import Globals from "./Globals"
import {Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight} from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import GPGPU from "../GPGPU/GPGPU"
import SimulationShader from "../GPGPU/SimulationShader"

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

        this.simulationShader = new GPGPU.SimulationShader()

        console.log(this.simulationShader)

        // console.log(this.gpgpu)

        this.init()       
        
    }

    init() {

        Globals.camera = this.camera

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

        Globals.deltaTime = this.clock.getDelta()
        Globals.elapsedTime = this.clock.getElapsedTime()
        requestAnimationFrame(this.render.bind(this))

    }
}