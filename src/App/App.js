// import Globals from "./Globals"
import { Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, ClampToEdgeWrapping, SphereBufferGeometry, RepeatWrapping, BufferAttribute, BufferGeometry, PointsMaterial, Points, Math as ThreeMath, BoxBufferGeometry, PlaneBufferGeometry, ShaderMaterial, SphereGeometry, Color, TextureLoader, IcosahedronGeometry } from 'three'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'

import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils'
import FBOHelper from '../libs/THREE.FBOHelper'

import fragShaderPosition from '../shaders/positionFrag.glsl'
import fragShaderVelocity from '../shaders/velocityFrag.glsl'

import particleFrag from '../shaders/particleFrag.glsl'
import particleVert from '../shaders/particleVert.glsl'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

export default class App {

    constructor() {

        

        this.scene = new Scene()
        this.canvas = document.getElementById('canvas')
        this.camera = new PerspectiveCamera((75, window.innerWidth / window.innerHeight, 0.1, 1000))

        


        this.renderer = new WebGLRenderer({ antialias: true, alpha: false })
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setClearColor(new Color(1.0, 1.0, 1.0), 1.0)
        document.body.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.bounds = 400
        this.boundsHalf = this.bounds / 2

        this.tapPosition = new Vector2()
        this.raycaster = new Raycaster()
        this.loadingManager = new LoadingManager()
        this.clock = new Clock()

        this.size = 512

        this.gpuCompute = new GPUComputationRenderer(this.size, this.size, this.renderer)

        this.dtPosition = this.gpuCompute.createTexture()
        const posArray = this.dtPosition.image.data

        const spherePos = GeometryUtils.randomPointsInGeometry(new IcosahedronGeometry(1), posArray.length)
        console.log(spherePos)

        for (let i = 0, l = posArray.length; i < l; i += 4) {
            const x = spherePos[i].x
            const y = spherePos[i].y
            const z = spherePos[i].z
            posArray[i + 0] = x
            posArray[i + 1] = y
            posArray[i + 2] = z
            posArray[i + 3] = 1
        }

        this.positionVariable = this.gpuCompute.addVariable("texturePosition", fragShaderPosition, this.dtPosition)

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
        if (error != null) {
            console.log(error)
        }

        const initParticles = () => {

            const particleGeo = new BufferGeometry()
            const positions = new Float32Array(this.size * this.size * 3)
            
            for (var i = 0, j = 0, l = positions.length / 3; i < l; i++, j += 3) {
                positions[j] = (i % this.size) / this.size;
                positions[j + 1] = ~~(i / this.size) / this.size;
            }

            const pos = new BufferAttribute(new Float32Array(positions), 3)

            particleGeo.setAttribute('position', pos)

            var loader = new THREE.TextureLoader()

            const particleUniforms = {
                'texturePosition': {type: 't', value: null},
                'textureVelocity': {type: 't', value: null},
                'map': {type:'t', value: loader.load('./assets/images/overpass.jpg')},
                'time': {type: 'f', value: 0},
                'delta': {type: 'f', value: 0}
            }

            this.particleMaterial = new ShaderMaterial({
                uniforms: particleUniforms,
                vertexShader: particleVert,
                fragmentShader: particleFrag,
                side: DoubleSide
            })

            const particles = new Points(particleGeo, this.particleMaterial)
            particles.frustumCulled = false
            this.scene.add(particles)

        }

        initParticles()

        this.fbohelper = new FBOHelper(this.renderer)
        this.fbohelper.setSize(window.innerWidth, window.innerHeight)

        const posRT = this.gpuCompute.getCurrentRenderTarget(this.positionVariable)
        const velRT = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable)

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

        this.renderer.setSize(window.innerWidth.window.innerHeight)
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
        //this.scene.add(this.surface)

        this.scene.add(new AmbientLight(0x404040, 5))
        this.scene.add(new DirectionalLight(0xffffff, 1))

        this.camera.position.set(0, 0, 5)

        this.controls.update();

    }

    render(now) {

        const delta = this.clock.getDelta()
        const time = this.clock.getElapsedTime()

        this.positionUniforms["time"].value = time;
        this.positionUniforms["delta"].value = delta;
        this.velocityUniforms["time"].value = time;
        this.velocityUniforms["delta"].value = delta;

        this.gpuCompute.compute()

        this.particleMaterial.uniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        this.particleMaterial.uniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;

        this.particleMaterial.uniforms.time.value = time
        this.particleMaterial.uniforms.delta.value = delta

        // this.camera.position.x = Math.sin(time * 0.1) * 50.0 * delta;
        // this.camera.position.z = Math.cos(time * 0.1) * 50.0 * delta;
        this.camera.lookAt(0,0,0)

        this.renderer.render(this.scene, this.camera)

        this.fbohelper.update()

        this.controls.update()

        requestAnimationFrame(this.render.bind(this))


    }
}