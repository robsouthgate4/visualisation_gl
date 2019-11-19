// import Globals from "./Globals"
import { Scene, DoubleSide, PerspectiveCamera, WebGLRenderer, Vector2, Raycaster, LoadingManager, Clock, Mesh, PlaneGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, ClampToEdgeWrapping, SphereBufferGeometry, RepeatWrapping, BufferAttribute, BufferGeometry, PointsMaterial, Points, Math as ThreeMath, BoxBufferGeometry, PlaneBufferGeometry, ShaderMaterial, SphereGeometry, Color, TextureLoader, IcosahedronGeometry, ObjectLoader, IcosahedronBufferGeometry, DepthTexture, OrthographicCamera, UniformsUtils, RGBFormat, LinearFilter } from 'three'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'

import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils'
import FBOHelper from '../libs/THREE.FBOHelper'

import fragShaderPosition from '../shaders/positionFrag.glsl'
import fragShaderVelocity from '../shaders/velocityFrag.glsl'

import particleFrag from '../shaders/particleFrag.glsl'
import particleVert from '../shaders/particleVert.glsl'

import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader"
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader"

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import PP from '../PostProcessing/PP'
import CopyShader from '../PostProcessing/CopyShader'
import BlurShader from '../PostProcessing/BlurShader'

export default class App {

    constructor() {

        /**
         * Core Renderer
         */
        this.renderer = new WebGLRenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setClearColor(new Color('rgb(34,34,51)'), 1.0)
        document.body.appendChild(this.renderer.domElement)


        this.scene = new Scene()
        this.canvas = document.getElementById('canvas')
        this.camera = new PerspectiveCamera((45, window.innerWidth / window.innerHeight, 0.1, 1000))

        /**
         * Postprocessing
         */
        this.pp = new PP(this.renderer)

        this.rtPost1 = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: LinearFilter})
        this.rtPost1.texture.generateMipmaps = false

        

        this.rtPost2 = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: LinearFilter})
        this.rtPost2.texture.generateMipmaps = false

        this.rtPost3 = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: LinearFilter})
        this.rtPost3.texture.generateMipmaps = false

        this.copyShader = new PP.CopyShader()
        this.blurShader = new PP.BlurShader()

        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.bounds = 400
        this.boundsHalf = this.bounds / 2

        this.tapPosition = new Vector2()
        this.raycaster = new Raycaster()
        this.loadingManager = new LoadingManager()
        this.clock = new Clock()

        /**.
         * GPGPU
         */
        this.size = 1024
        this.gpuCompute = new GPUComputationRenderer(this.size, this.size, this.renderer)

        this.dtPosition = this.gpuCompute.createTexture()
        const posArray = this.dtPosition.image.data
        const loader = new OBJLoader()

        const onOBJLoaded = (object) => {

            const suz = object
            suz.rotation.x = 180
            const suzGeo = suz.children[0].geometry
            console.log(new IcosahedronGeometry(1))

            const shapePointCloud = GeometryUtils.randomPointsInBufferGeometry(suzGeo, posArray.length)

            for (let i = 0, l = posArray.length; i < l; i += 4) {
                const x = shapePointCloud[i].x
                const y = -shapePointCloud[i].y
                const z = shapePointCloud[i].z
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

                for (var i = 0, j = 0, l = positions.length / 3; i < l; i++ , j += 3) {
                    positions[j] = (i % this.size) / this.size;
                    positions[j + 1] = ~~(i / this.size) / this.size;
                }

                const pos = new BufferAttribute(new Float32Array(positions), 3)

                particleGeo.setAttribute('position', pos)

                var loader = new THREE.TextureLoader()

                const particleUniforms = {
                    'texturePosition': { type: 't', value: null },
                    'textureVelocity': { type: 't', value: null },
                    'map': { type: 't', value: loader.load('./assets/images/studio.jpg') },
                    'time': { type: 'f', value: 0 },
                    'delta': { type: 'f', value: 0 }
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
            this.fbohelper.attach(this.rtPost1, 'Post 1')
            this.fbohelper.attach(this.rtPost2, 'Post 2')

            this.init()
        }

        loader.load('./assets/models/suzanne.obj', (object) => {
            onOBJLoaded(object)
        })


    }

    init() {

        this._setupScene()
        requestAnimationFrame(this.render.bind(this))
        this._onWindowResize()

    }

    _onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)

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

        this.scene.add(new AmbientLight(0x404040, 5))
        this.scene.add(new DirectionalLight(0xffffff, 1))

        this.camera.position.set(0, 0, 2)

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
        this.camera.lookAt(0, 0, 0)

        this.pp.render(this.scene, this.camera, this.rtPost1)

        this.copyShader.setTexture(this.rtPost1)
        this.pp.pass( this.copyShader, this.rtPost2 )

        // for (const i = 0; i < 8; i++) {

        //     /* Blur on the X */
        //     this.blurShader.setTexture(this.rtPost2)
        //     this.blurShader.setDelta(1 / this.rtPost2.width, 0)



        //     this.pp.pass(this.blu)
        // }

        this.renderer.render(this.scene, this.camera)

        this.fbohelper.update()
        this.controls.update()

        requestAnimationFrame(this.render.bind(this))


    }
}