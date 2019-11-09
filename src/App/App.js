// import Globals from "./Globals"
import {Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, ClampToEdgeWrapping,  SphereBufferGeometry, RepeatWrapping, BufferAttribute, BufferGeometry, PointsMaterial, Points, Math as ThreeMath} from 'three'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

import {GPUComputationRenderer} from 'three/examples/jsm/misc/GPUComputationRenderer'

import {GeometryUtils} from 'three/examples/jsm/utils/GeometryUtils'
import FBOHelper from '../libs/THREE.FBOHelper'

import fragShaderPosition from '../shaders/positionFrag.glsl'
import fragShaderVelocity from '../shaders/velocityFrag.glsl'




export default class App {

    constructor() {

        this.scene = new Scene()
        this.canvas = document.getElementById('canvas')
        this.camera = new PerspectiveCamera(( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ) )

        this.renderer = new WebGLRenderer({ antialias: true, alpha: false })
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        document.body.appendChild( this.renderer.domElement )

        this.bounds = 400
        this.boundsHalf = this.bounds / 2

        this.tapPosition = new Vector2()
        this.raycaster = new Raycaster()
        this.loadingManager = new LoadingManager()
        this.clock =  new Clock()

        this.size = 256

        this.gpuCompute = new GPUComputationRenderer(this.size, this.size, this.renderer)        

        this.dtPosition = this.gpuCompute.createTexture()
        const posArray = this.dtPosition.image.data

        for (let i = 0, l = posArray.length; i < l; i += 4) {
            const x = ThreeMath.randFloat(-1, 1) * 50
            const y = ThreeMath.randFloat(-1, 1) * 50
            const z = -200
            posArray[i + 0] = x
            posArray[i + 1] = y
            posArray[i + 2] = z
            posArray[i + 3] = 1
        }
    
        console.log(posArray)

        this.positionVariable = this.gpuCompute.addVariable("texturePosition", fragShaderPosition, this.dtPosition )

        
        this.dtVelocity = this.gpuCompute.createTexture()
        const velArray = this.dtVelocity.image.data

        for (let i = 0, l = velArray.length; i < l; i += 4) {
            const x = Math.random() - 0.5
            const y = Math.random() - 0.5
            const z = Math.random() - 0.5
            velArray[i + 0] = x
            velArray[i + 1] = y
            velArray[i + 2] = z
            velArray[i + 3] = 1
        }

        this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", fragShaderVelocity, this.dtVelocity)
        
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable])
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable])

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.velocityUniforms = this.velocityVariable.material.uniforms;

        this.positionUniforms["time"] = { value: 0.0 }
        this.positionUniforms["delta"] = { value: 0.0 }

        this.velocityUniforms["time"] = { value: 0.0 }
        this.velocityUniforms["delta"] = { value: 0.0 }
        this.velocityVariable.material.defines.BOUNDS = this.bounds.toFixed(2)


        this.positionVariable.wrapS = ClampToEdgeWrapping
        this.positionVariable.wrapT = ClampToEdgeWrapping

        this.velocityVariable.wrapS = ClampToEdgeWrapping
        this.velocityVariable.wrapT = ClampToEdgeWrapping

        const error = this.gpuCompute.init()
        if( error != null ) {
            console.log(error)
        }

        const initPoints = () => {
            this.geo = new BufferGeometry()
            this.geo.setAttribute( 'position', new BufferAttribute( posArray, 4 ) )

            const material = new PointsMaterial( { size: posArray.length } )
            this.particles = new Points(this.geo)

            this.scene.add(this.particles)
        }

        initPoints()

        this.fbohelper = new FBOHelper(this.renderer)
        this.fbohelper.setSize(window.innerWidth, window.innerHeight)

        const posRT = this.gpuCompute.getCurrentRenderTarget( this.positionVariable )
        const velRT = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable )

        this.fbohelper.attach(posRT, 'Positions')
        this.fbohelper.attach(velRT, 'Velocity')


        this.init()       
        
    }

    init() {

        this._setupScene()
        requestAnimationFrame(this.render.bind(this))

    }

    _onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(window.innerWidth. window.innerHeight)
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

        const delta = this.clock.getDelta()
        const time = this.clock.getElapsedTime()

        this.positionUniforms[ "time" ].value = time;
        this.positionUniforms[ "delta" ].value = delta;
        this.velocityUniforms[ "time" ].value = time;
        this.velocityUniforms[ "delta" ].value = delta;

        this.gpuCompute.compute()

        const texturePos = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
        const textureVel = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;

        this.renderer.render(this.scene, this.camera)

        this.fbohelper.update()

        requestAnimationFrame(this.render.bind(this))


    }
}