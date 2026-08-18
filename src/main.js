import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from "three/addons/controls/TransformControls.js";
import MouseFollower from "mouse-follower";
import gsap from "gsap";
import "mouse-follower/dist/mouse-follower.min.css";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { BrightnessContrastShader } from 'three/addons/shaders/BrightnessContrastShader.js';
import { HueSaturationShader } from 'three/addons/shaders/HueSaturationShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';
import { SepiaShader } from 'three/addons/shaders/SepiaShader.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { TechnicolorShader } from 'three/addons/shaders/TechnicolorShader.js';
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader.js';
import { KaleidoShader } from 'three/addons/shaders/KaleidoShader.js';
import { FreiChenShader } from 'three/addons/shaders/FreiChenShader.js';
import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

// custom cursor when Dragging

MouseFollower.registerGSAP(gsap);
const cursor = new MouseFollower({
    speed: 0.3,
  });
cursor.addState("-fade-out");

const rayCast = new THREE.Raycaster()
let initialMouseXPosition;
let initialMouseYPosition;
let layerObjects = [];
let isDraggingTransformControls = true;

let settingFromLocalstorage = window.localStorage.getItem('setting')

let SCENE_DEFAULT_BACKGROUND_COLOR = new THREE.Color('#333333')


let appElement = document.getElementById("app")
let objectContainer = document.getElementById('ObjectsContainer')
let mainOption = document.querySelector('[data-type="main"]')
let panelEle = document.getElementById("panel");
let infoP = document.getElementById('infoPanel');
const Grid = document.querySelector("#G")
const Axes = document.querySelector("#Ax")
let layerContainer = document.getElementById('layersControl');
let upload = document.getElementById('upload')

// delete the loaderMap after you finish
let loaderMap = {
  glb: GLTFLoader,
  gltf: GLTFLoader,
  fbx: FBXLoader,
  obj: OBJLoader,
  stl: STLLoader,
  ply: PLYLoader,
  svg: SVGLoader,
}

let settings =settingFromLocalstorage ? JSON.parse(settingFromLocalstorage) :{
  defaultGeomtriesMaterial: 'MeshBasicMaterial',
  wireframe: true,
  showHelpers: true,
  showTransformControls: true,
  preview: true 
}

// Set the material to a wireframe standard as a default for the geometries

let geometries = {
  BoxGeometry:{

  },
  CapsuleGeometry:{

  },
  CircleGeometry:{

  },
  ConeGeometry:{

  },
  CylinderGeometry:{

  },
  DodecahedronGeometry:{

  },
  ExtrudeGeometry:{

  },
  IcosahedronGeometry:{

  },
  LatheGeometry:{

  },
  OctahedronGeometry:{

  },
  PlaneGeometry:{

  },
  RingGeometry:{

  },
  ShapeGeometry:{

  },
  SphereGeometry:{

  },
  TetrahedronGeometry:{

  },
  TorusGeometry:{

  },
  TorusKnotGeometry:{

  },
  TubeGeometry:{

  },
}
let materials = {
  LineBasicMaterial:{
    args:[{ color: 0xffffff }]
  },
  LineDashedMaterial:{
    args:[ {
	color: 0xffffff,
	scale: 1,
	dashSize: 3,
	gapSize: 1,
} ]

  },
  MeshBasicMaterial:{
    args:[{color:'white',visible:true}]
  },
  MeshDepthMaterial:{
    args:[{
    depthPacking: THREE.RGBADepthPacking
}]
  },
  MeshNormalMaterial:{
    args:[]
  },
  MeshPhongMaterial:{
    args:[]
  },
  MeshPhysicalMaterial:{
    args:[]
  },
  MeshStandardMaterial:{
    args:[]
  },
  MeshToonMaterial:{
    args:[]
  },
  PointsMaterial:{
    args:[]
  },
  // ShadowMaterial:{
  //   args:[]
  // },
  // SpriteMaterial:{
  //   args:[{ map: map, color: 0xffffff }]
  // }
}
const effects = {

    bloom: {
        name: 'Bloom',
        create: (renderer, scene, camera) => {
            return new UnrealBloomPass(
                new THREE.Vector2(
                    renderer.domElement.width,
                    renderer.domElement.height
                ),
                1,
                0.79,
                0.85
            );
        }
    },

    depthOfField: {
        name: 'Depth of Field',
        create: (renderer, scene, camera) => {
            return new BokehPass(scene, camera, {
                focus: 4,
                aperture: 0.0001,
                maxblur: 0.01
            });
        }
    },

    motionBlur: {
        name: 'Motion Blur',
        create: () => {
            return new AfterimagePass(0.95);
        }
    },

    chromaticAberration: {
        name: 'Chromatic Aberration',
        create: () => {
            const pass = new ShaderPass(RGBShiftShader);
            pass.uniforms.amount.value = 0.02;
            pass.uniforms.angle.value = 2;
            return pass;
        }
    },

    vignette: {
        name: 'Vignette',
        create: () => {
            const pass = new ShaderPass(VignetteShader);
            pass.uniforms.darkness.value = 1.9;
            pass.uniforms.offset.value = 2.0;
            return pass;
        }
    },

    filmGrain: {
        name: 'Film Grain',
        create: () => {
            return new FilmPass(
                1.0,
                false
            );
        }
    },

    brightnessContrast: {
        name: 'Brightness / Contrast',
        create: () => {
            const pass = new ShaderPass(BrightnessContrastShader);
            pass.uniforms.brightness.value = 0.1;
            pass.uniforms.contrast.value = 0.8;
            return pass;
        }
    },

    hueSaturation: {
        name: 'Hue / Saturation',
        create: () => {
            const pass = new ShaderPass(HueSaturationShader);
            pass.uniforms.saturation.value = 0.8;
            setInterval(() => {
              pass.uniforms.hue.value = 2.0 * Math.random() - 1;
            }, 200);
            return pass;

        }
    },

    ssao: {
        name: 'SSAO',
        create: (renderer, scene, camera) => {
            const pass = new SSAOPass(
                scene,
                camera,
                renderer.domElement.width,
                renderer.domElement.height
            );

            pass.kernelRadius = 16;
            pass.minDistance = 0.005;
            pass.maxDistance = 0.1;

            return pass;
        }
    },

    glitch: {
        name: 'Glitch',
        create: () => {
            const pass = new GlitchPass();
            pass.goWild = false;
            return pass;
        }
    },

    fxaa: {
        name: 'FXAA',
        create: () => {
            return new FXAAPass();
        }
    },

    smaa: {
        name: 'SMAA',
        create: (renderer) => {
            return new SMAAPass(
                renderer.domElement.width,
                renderer.domElement.height
            );
        }
    },

    halftone: {
        name: 'Halftone',
        create: () => {
            return new HalftonePass({
                shape: 1,
                radius: 0.2,
                rotateR: Math.PI / 12,
                rotateG: Math.PI / 12,
                rotateB: Math.PI / 12,
                scatter: 1,
                blending: 1,
                blendingMode: 1,
                greyscale: false,
                disable: false
            });
        }
    },

    dotScreen: {
        name: 'Dot Screen',
        create: () => {
            const pass = new ShaderPass(DotScreenShader);
            pass.uniforms.scale.value = 1;
            pass.uniforms.angle.value = 1.57;
            return pass;
        }
    },

    sepia: {
        name: 'Sepia',
        create: () => {
            const pass = new ShaderPass(SepiaShader);
            pass.uniforms.amount.value = 1;
            return pass;
        }
    },

    colorify: {
        name: 'Colorify',
        create: () => {
            const pass = new ShaderPass(ColorifyShader);
            pass.uniforms.color.value.set(0xffffff);
            return pass;
        }
    },

    technicolor: {
        name: 'Technicolor',
        create: () => {
            return new ShaderPass(TechnicolorShader);
        }
    },

    bleachBypass: {
        name: 'Bleach Bypass',
        create: () => {
            return new ShaderPass(BleachBypassShader);
        }
    },

    kaleido: {
        name: 'Kaleidoscope',
        create: () => {
            const pass = new ShaderPass(KaleidoShader);
            pass.uniforms.sides.value = 6;
            pass.uniforms.angle.value = 0;
            return pass;
        }
    }

};
let lights = {
  AmbientLight:{
    args: [ 0x404040 , 10],
    hparg:[],
    mainArgs: [ 0x404040 , 10],
    mainHarg:[],
    pos:[2,5,20]
  },
  DirectionalLight:{
    args: [0xffffff, 1.0],
    mainArgs: [0xffffff, 1.0],
    mainHarg:[1],
    hparg:[30],
    hasTarget:true,
    pos:[40,5,-4],
  },
  HemisphereLight:{
    args: [ 0xffffff, 0x080820, 1],
    hparg:[20],
    mainArgs: [ 0xffffff, 0x080820, 1],
    mainHarg:[1],
    pos:[40,5,-300]
    // pos:[80,10,-10]
  },
  PointLight:{
    args: [ 0xffffff, 200, 100],
    hparg:[0.2],
    mainArgs: [ 0xffffff, 200, 100],
    mainHarg:[0.2],
    pos:[0,0,40]
    // pos:[10,5,50]
  },
  SpotLight:{
     args: [ 0xffffff , 560,0,Math.PI/6,1,1.9],
     mainArgs: [ 0xffffff , 560,0,Math.PI/6,1,1.9],
     hparg:[],
     mainHarg:[],
     hasTarget:true,
     
    pos:[40, 30,15]
    // pos:[40, 35,100]

  }

}
const lightProperties = {
    AmbientLight: {
      color: {
        type: 'color'
      },
      intensity: {
        type: 'number',
        min: 0,
        max: 10,
        step: 0.01
      },
      visible: {
          type: 'boolean'
      },
    },

    DirectionalLight: {
      color: {
        type: 'color'
      },
      intensity: {
        type: 'number',
        min: 0,
        max: 10,
        step: 0.01
      },
      visible: {
        type: 'boolean'
      },
      castShadow: {
          type: 'boolean'
      },
    },

    HemisphereLight: {

        color: {
            type: 'color'
        },
        groundColor: {
            type: 'color'
        },
        intensity: {
            type: 'number',
            min: 0,
            max: 10,
            step: 0.01
        },
        visible: {
            type: 'boolean'
        },
    },

    PointLight: {

        color: {
            type: 'color'
        },
        intensity: {
            type: 'number',
            step: 0.01
        },
        distance: {
            type: 'number',
            min: 0,
            max: 1000,
            step: 0.1
        },
        decay: {
            type: 'number',
            min: 0,
            max: 10,
            step: 0.01
        },
        visible: {
            type: 'boolean'
        },
        castShadow: {
            type: 'boolean'
        },
    },

    SpotLight: {

        color: {
            type: 'color'
        },
        intensity: {
            type: 'number',
            min: 0,
            max: 10,
            step: 0.01
        },
        distance: {
            type: 'number',
            min: 0,
            max: 1000,
            step: 0.1
        },
        angle: {
            type: 'number',
            min: 0,
            max: 90,
            step: 0.1,
            unit: 'degrees'
        },
        penumbra: {
            type: 'number',
            min: 0,
            max: 1,
            step: 0.01
        },
        decay: {
            type: 'number',
            min: 0,
            max: 10,
            step: 0.01
        },
        visible: {
            type: 'boolean'
        },
        castShadow: {
            type: 'boolean'
        },
    },


};

let cameras = {
  OrthographicCamera:{

  },
  PerspectiveCamera:{

  }
}

let panel = {
  width: 450
}




const mainScene = new THREE.Group();
let light = new THREE.AmbientLight("white",10)
let renderer = new THREE.WebGLRenderer({antialias:true})
let Mainrenderer = new THREE.WebGLRenderer({antialias:true})
let mainComposer;
let chosenLayer;
Mainrenderer.shadowMap.enabled = true;

Mainrenderer.setSize(window.innerWidth,window.innerHeight)
Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
appElement.appendChild(Mainrenderer.domElement)


const mainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
mainCamera.position.set(2, 3, 20);
mainCamera.name = 'Camera'
const controls = new OrbitControls( mainCamera, Mainrenderer.domElement );
controls.zoomSpeed = 2

const AxesHelper = new THREE.AxesHelper(3)
const GridHelper = new THREE.GridHelper(30,40,0x565656,0x444444)

Grid.addEventListener("change",(e)=>{
  window.localStorage.setItem('G',e.target.checked)
  GridHelper.visible = e.target.checked
})
Axes.addEventListener("change",(e)=>{
  window.localStorage.setItem('Ax',e.target.checked)
  AxesHelper.visible = e.target.checked
})
if(window.localStorage.getItem("Ax") != null){
  Axes.checked = (window.localStorage.getItem("Ax")== "false" ? false : true)
  AxesHelper.visible = (window.localStorage.getItem("Ax")== "false" ? false : true)
}else{
  Axes.checked = false
  AxesHelper.visible = false
}
if(window.localStorage.getItem("G") != null){
  Grid.checked = (window.localStorage.getItem("G")== "false" ? false : true)
  GridHelper.visible = (window.localStorage.getItem("G")== "false" ? false : true)
}else{
  Grid.checked = false
  GridHelper.visible = false
}
let MainRealscene = new THREE.Scene()
mainScene.name = 'Scene'
MainRealscene.background = SCENE_DEFAULT_BACKGROUND_COLOR
MainRealscene.add(mainCamera)
MainRealscene.add(AxesHelper)
MainRealscene.add(GridHelper)
MainRealscene.add(mainScene)

function animate(){
  controls.update()
  requestAnimationFrame(animate)
  if(mainComposer){
    mainComposer.render()
  }else{
    Mainrenderer.render(MainRealscene,mainCamera)
  }
}
animate()

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); 
loader.setDRACOLoader(dracoLoader);
const glb = await loader.loadAsync('https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/3D/Statue.glb' )

// Css & Animations

function toggleFirstAnimation(d){
    d.getElementById('fda').classList.toggle('scl')
    d.getElementById('lda').classList.toggle('scln')
}

function handleActivation(htmlLayer){
  removeAllActiveClass()
  addActiveClass(htmlLayer)
}

function addActiveClass(htmlLayer){
  htmlLayer.classList.add('layerActive')
}

function removeAllActiveClass(){
  document.querySelectorAll('.layerActive').forEach((e)=>{
    e.classList.remove('layerActive')
  })
}

function appendOptionObjects(objects,mode){
  objectContainer.innerHTML = ``
  for(let i =0;i < objects.length;i++){
    let protoContainer = document.createElement('div');
    let proto = document.createElement('div');
    let label = document.createElement('div');
    let intersectedObject; 
    label.className = "ll";
    label.innerText = objects[i];
    proto.className = "prototype";
    proto.dataset.TE = objects[i];
    protoContainer.dataset.TE = objects[i];
    protoContainer.className = "prototypeContainer";
    settings.preview && protoContainer.appendChild(proto);
    protoContainer.appendChild(label);
    objectContainer.appendChild(protoContainer);
    let color;
    protoContainer.addEventListener('pointerdown',(e)=>{
      cursor.removeState("-fade-out");
      if(mode == "material"){
        hideTransformAndSelectionBox()
        window.addEventListener('mousemove',checkintersect);
    }
      function checkintersect(e){
        let x = (e.clientX / (window.innerWidth / 2) - 1 )
        let y = -(e.clientY / (window.innerHeight / 2) - 1 )
        if(document.getElementById('optionMenu').getBoundingClientRect().x > e.clientX){
          rayCast.setFromCamera(new THREE.Vector2(x,y),mainCamera)
          let filters = [];
          mainScene.traverseVisible((child)=>{
            if((child?.type == 'Mesh') && (!child?.isLightHelper && !child.isTransformControlsRoot && !child?.type.includes("Grid") && !child?.type.includes("Axes"))){
              filters.push(child)
            }
          })
          let intersectObjs = rayCast.intersectObjects(filters,false)

          if(intersectObjs.length > 0 && intersectedObject != intersectObjs[0]?.object){
            if(intersectedObject){              
              intersectedObject.material.color.set(color)
              intersectedObject = null  
          }
            let intersectObj = intersectObjs[0].object
            const hex = intersectObj.material.color.getHex();
            if (hex != 0xb30907){
              color = hex
            }
            intersectObj.material.color.set(0xb30907) 
            intersectedObject = intersectObj  
          }else if(intersectObjs.length < 1){
            if(intersectedObject){              
              intersectedObject.material.color.set(color)
              intersectedObject = null  
            }
          }
        }else{
          if(intersectedObject){              
            intersectedObject.material.color.set(color)
            intersectedObject = null  
          }
        }
      }
      window.addEventListener('pointerup',(e)=>{
        if(mode == "material"){
          window.removeEventListener('mousemove',checkintersect)
        }
        cursor.addState("-fade-out");
        if(document.getElementById('optionMenu').getBoundingClientRect().x > e.clientX){
        let obj;
        if(mode == "light"){
          const light = new THREE[objects[i]](...lights[objects[i]].mainArgs);
          obj=light;
          chosenLayer = obj
          let geometry = new THREE.SphereGeometry(2,4,2)
          let material = new THREE.MeshBasicMaterial({color: 'white',visible:false})
          let picker = new THREE.Mesh(geometry,material)
          let target = new THREE.Object3D()
          if(lights[objects[i]]?.hasTarget){
            target.isTarget = true
            target.position.set(0,0,0)
            light.target = target
            mainScene.add(target);
          }
          if(Object.keys(THREE).includes(objects[i] + "Helper")){
            const lighthelper = new THREE[objects[i] + "Helper"](light,...lights[objects[i]]?.mainHarg);
            lighthelper.isLightHelper = true;
            lighthelper.visible = settings.showHelpers;
            mainScene.add(lighthelper);
            lighthelper.add(picker)
            light.userData.object = lighthelper
            target.userData.object = lighthelper
            lighthelper.update()
          }

          picker.name = 'picker';
          picker.userData.object = obj
          updateInfo()
        }
        if(mode == "geometry"){
          let geo = new THREE[objects[i]]()          
          let material = (new THREE[settings.defaultGeomtriesMaterial](...materials[settings.defaultGeomtriesMaterial].args)).clone()
          material.wireframe = settings.wireframe
          obj = new THREE.Mesh(geo,material);
          obj.name = objects[i].slice(0,objects[i].indexOf('Geometry'))
          chosenLayer = obj
          updateInfo()
        }
        if(mode == "material"){
          if(intersectedObject){
            let material = new THREE[objects[i]](...materials[objects[i]].args)
            intersectedObject.material = material
            chosenLayer = intersectedObject
            handleTranformControlsAndBoxHelper(chosenLayer)
            mainInit() 
          }
          return
        }  
        if(mode == 'specialEffects'){
          mainComposer = new EffectComposer(Mainrenderer)
          let renderPass = new RenderPass(mainScene,mainCamera)
          mainComposer.addPass( renderPass )
          let specialEffect = effects[objects[i]].create(Mainrenderer,mainScene,mainCamera)
          mainComposer.addPass( specialEffect )
          let outputPass = new OutputPass()
          mainComposer.addPass( outputPass )
          return
        }
          mainScene.add(obj)
          handleTranformControlsAndBoxHelper(chosenLayer)
          mainInit()
        }
        
      },{once:true})
    })
  }
}

let TC = new TransformControls(mainCamera,Mainrenderer.domElement)
const selectionBox = new THREE.BoxHelper();
selectionBox.visible = false;
TC.setMode('translate')
TC.enabled = true
MainRealscene.add(selectionBox);
mainScene.add(TC.getHelper())
TC.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
  updateInfo()    
})
let positionMapArr = ['x','y','z']
TC.addEventListener('change',(e)=>{
  isDraggingTransformControls = false  
  if((chosenLayer?.isLight || chosenLayer?.isTarget) && chosenLayer?.userData.object){    
    chosenLayer?.userData.object.update()
  }
  if(TC.mode == "translate"){
    if(chosenLayer){
      document.querySelectorAll('.position input').forEach((e,i)=>{
        let positionValue = +chosenLayer.position[positionMapArr[i]]
        if(!Number.isNaN(positionValue)){
          e.value = (positionValue).toFixed(3)
        }
      })
    }
    }
  if(TC.mode == "rotate"){document.querySelectorAll('.rotation input').forEach((e,i)=>{
    let rotationValue = +chosenLayer.rotation[positionMapArr[i]]
    if(!Number.isNaN(rotationValue)){
      e.value = (+(rotationValue).toFixed(3) * 180 / Math.PI).toFixed(3)
    }
  })}
  if(TC.mode == "scale"){document.querySelector('.scale')[0]}
  selectionBox.update()
})

function attachTranformControls(obj){
  TC.attach(obj)
  showTransform()
}

function attachBoxHelper(obj){
  selectionBox.setFromObject(obj);
  showBoxHelper()
}

function hideTransformAndSelectionBox(){
  TC.enabled = false
  TC.getHelper().visible = false 
  selectionBox.visible = false;
}

function showTransform(){
  console.log(settings.showTransformControls);
  TC.enabled = settings.showTransformControls;
  TC.getHelper().visible = settings.showTransformControls;
}

function showBoxHelper(){
  selectionBox.visible = true;
}

function optionDemo(mode){
  const prototypes = document.querySelectorAll(".prototype");
  const previews = [];

  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false;
  renderer.setScissorTest(true);

  objectContainer.appendChild(renderer.domElement);

  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100vw";
  renderer.domElement.style.height = "100vh";
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.zIndex = "0";

  for (let i = 0; i < prototypes.length; i++) {
    let mesh;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      let effectComposer;
      if(mode == "light"){
        camera.position.set(0, .3,200);
        let lightObj= lights[prototypes[i].dataset.TE]
        let pos = lightObj.pos
        const light = new THREE[prototypes[i].dataset.TE](...lightObj.args);
        light.position.set(...pos);

        if(Object.keys(THREE).includes(prototypes[i].dataset.TE + "Helper")){
          const lighthelper = new THREE[prototypes[i].dataset.TE + "Helper"](light,...lightObj?.hparg);
          light.add(lighthelper);
        }

        scene.add(light);
        mesh = statue.clone()
      }
      if(mode == "geometry"){
        camera.position.set(0, .3,5);
        camera.lookAt(new THREE.Vector3(0,0,0))
        let geo = new THREE[prototypes[i].dataset.TE]()
        let material = new THREE.MeshBasicMaterial({color: "white",wireframe:true})
        mesh = new THREE.Mesh(geo,material);
      }
      if(mode == "material"){
        camera.position.set(0, .3,200);
        let material = new THREE[prototypes[i].dataset.TE](...materials[prototypes[i].dataset.TE].args)
        let AmbientLight = new THREE.AmbientLight(0x404040,10)
        scene.add(AmbientLight)
        mesh = statue.clone()
        mesh.traverse((child) => {
        if (child.isMesh) {
          child.material = material
        }

    });
      }   
      if(mode == "specialEffects"){
        camera.position.set(0, .3,200);
        const keyLight = new THREE.DirectionalLight(0xDFF6FF, 3);
        keyLight.position.set(3, 4, 5);
        const rimLight = new THREE.PointLight(0xffffff, 5);
        rimLight.position.set(-3, 2, -3);
        scene.add(keyLight);
        scene.add(rimLight);
        mesh = statue.clone()
        effectComposer = new EffectComposer(renderer)
        let renderPass = new RenderPass(scene,camera)
        effectComposer.addPass( renderPass )
        let specialEffect = effects[prototypes[i].dataset.TE].create(renderer,scene,camera)
        effectComposer.addPass( specialEffect )
        let outputPass = new OutputPass()
        effectComposer.addPass( outputPass )
      }   
      scene.add(mesh);
      scene.background = new THREE.Color('black')
      previews.push({
          element: prototypes[i],
          scene,
          camera,
          mesh,
          effectComposer
      });
  }

  function animate() {
      requestAnimationFrame(animate);
      renderer.clear();
      if(settings.preview){
        for (const preview of previews) {
          const rect = preview.element.getBoundingClientRect();
                
          if (
            rect.bottom <= 0 ||
            rect.top >= window.innerHeight ||
            rect.right <= 0 ||
            rect.left >= window.innerWidth
          ) {
            continue;
          }
     
          const left = rect.left;
          const bottom = window.innerHeight - rect.bottom;
          const width = rect.width;
          const height = rect.height;

          renderer.setViewport(left, bottom, width, height);
          renderer.setScissor(left, bottom, width, height);
          
          preview.camera.aspect = width / height;
          preview.camera.updateProjectionMatrix();
          preview.mesh.rotation.y += 0.01;
          if(preview?.effectComposer){
            preview.effectComposer.render()
          }else{
            renderer.render(preview.scene, preview.camera);
          }
      
        }
      }
    }

  animate();

  window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createBooleanSelect(){
  let select = document.createElement('select')
  let TrueBoolean = document.createElement('option')
  let FalseBoolean = document.createElement('option')
  TrueBoolean.innerText = 'true'
  FalseBoolean.innerText = 'false'
  TrueBoolean.value = 'true'
  FalseBoolean.value = 'false'
  select.append(TrueBoolean)
  select.append(FalseBoolean)
  return select
}

// Init 
function mainInit(){
  if(chosenLayer){
    // start adding and style the object stuff     
    if(!mainOption.classList.contains('opop')){
      mainOption.click()
    }    
    let htmlLayer = layerContainer.querySelector(`[data-uuid="${chosenLayer.uuid}"]`)
    htmlLayer && handleActivation(htmlLayer)
    let meshComponentContainer = document.createElement('div')
    meshComponentContainer.id = 'meshComponentContainer'    

    let panelContainer = document.createElement('div')
    panelContainer.id = "panelContainer"

    let label = document.createElement('div')
    label.className ='vertwr'
    label.innerHTML ='Object'
    meshComponentContainer.appendChild(label)
    label.addEventListener("click",selectLabel)
    createObjectPanel(chosenLayer,panelContainer)
    if(chosenLayer?.geometry) {
      let label = document.createElement('div')
      label.classList.add('vertwr')
      label.innerHTML ='Geometry'
      label.addEventListener("click",selectLabel)
      createGeometryPanel(chosenLayer,panelContainer)
      meshComponentContainer.appendChild(label)
      // console.log(chosenLayer);
      
    }
    if(chosenLayer?.material) {
      let label = document.createElement('div')
      label.classList.add('vertwr')
      label.innerHTML ='Material'
      label.addEventListener("click",selectLabel)
      createMaterialPanel(chosenLayer,panelContainer)
      meshComponentContainer.appendChild(label)
    }

    objectContainer.innerHTML = ""
    objectContainer.appendChild(meshComponentContainer)
    objectContainer.appendChild(panelContainer)
    label.click()

  }else{
    objectContainer.innerHTML = ""
  }
}
function geometryInit(){
  appendOptionObjects(Object.keys(geometries),"geometry")
  if(settings.preview){
    optionDemo("geometry")  
  }
}
function materialInit(){
  appendOptionObjects(Object.keys(materials),"material")
  if(settings.preview){
    optionDemo("material")
  }
}
function lightInit(){
  appendOptionObjects(Object.keys(lights),"light")
  if(settings.preview){
    optionDemo("light")
  }
}
function specialEffectsInit(){
  appendOptionObjects(Object.keys(effects),"specialEffects")
  if(settings.preview){
    optionDemo("specialEffects")  
  }
}
function customPresetsInit(){
}
function settingInit(){
  let jsonDiv = document.createElement('div')
  let wireframeSelect = createBooleanSelect()
  let showHelpersSelect = createBooleanSelect()
  let showTransformControlsSelect = createBooleanSelect()
  let previewSelect = createBooleanSelect()
  let select = document.createElement('select')
  let object = document.createElement('option')
  let text = createCustomText('   defaultGeometrysMat: ')
  let text1 = createCustomText('   showHelpers: ')
  let text2 = createCustomText('   showTransformControls: ')
  let text3 = createCustomText('   wireframe: ')
  let text4 = createCustomText('   preview_3D: ')
  object.style.fontSize = '13px'
  object.innerHTML = `THREE.${settings.defaultGeomtriesMaterial}()`

  jsonDiv.style.whiteSpace = 'pre';
  jsonDiv.style.textWrap = 'wrap';
  select.style.display = 'inline';
  wireframeSelect.style.display = 'inline';
  previewSelect.style.display = 'inline';
  select.append(object);


  wireframeSelect.value = settings.wireframe
  previewSelect.value = settings.preview
  showHelpersSelect.value = settings.showHelpers
  showTransformControlsSelect.value = settings.showTransformControls

  Object.keys(materials).forEach((mat)=>{
    if(mat != settings.defaultGeomtriesMaterial){
      let object = document.createElement('option')
      object.innerHTML = `THREE.${mat}()`;
      select.append(object);
    }
  })
  select.addEventListener('change',(event)=>{
    settings.defaultGeomtriesMaterial = event.target.value.slice(event.target.value.indexOf('.') + 1,event.target.value.indexOf('('))
    window.localStorage.setItem('setting',JSON.stringify(settings))
  })
  wireframeSelect.addEventListener('change',(event)=>{
    settings.wireframe = event.target.value === "true"
    mainScene.traverse((object)=>{
        if (!object.material || object?.type.includes("Grid") || object?.type.includes("Axes")) return;
        if (Array.isArray(object.material)) {
            object.material.forEach((material) => {
                material.wireframe = settings.wireframe;
            });
        } else {
            object.material.wireframe = settings.wireframe;
        }
    })
    window.localStorage.setItem('setting',JSON.stringify(settings))
  })
  previewSelect.addEventListener('change',(event)=>{
    settings.preview = event.target.value === "true"
    window.localStorage.setItem('setting',JSON.stringify(settings))
  })
  showHelpersSelect.addEventListener('change',(event)=>{
    settings.showHelpers = event.target.value === "true"
    mainScene.traverse((object)=>{
      if(object?.isLightHelper){
        object.visible = event.target.value === "true"
      }
    })
    window.localStorage.setItem('setting',JSON.stringify(settings))
  })
  showTransformControlsSelect.addEventListener('change',(event)=>{
    settings.showTransformControls = event.target.value === "true"
    window.localStorage.setItem('setting',JSON.stringify(settings))
    event.target.value === "true" ? showTransform() : hideTransformAndSelectionBox()
  })
  jsonDiv.append(`{\n`);
  jsonDiv.append(text);
  jsonDiv.append(select);
  jsonDiv.append(`\n`);
  
  jsonDiv.append(text1);
  jsonDiv.append(showHelpersSelect);
  jsonDiv.append(`\n`);
  
  jsonDiv.append(text2);
  jsonDiv.append(showTransformControlsSelect);
  jsonDiv.append(`\n`);
  
  jsonDiv.append(text3);
  jsonDiv.append(wireframeSelect);
  jsonDiv.append(`\n`);
  
  jsonDiv.append(text4);
  jsonDiv.append(previewSelect);
  jsonDiv.append(`\n`);
  jsonDiv.append(`}`);
  jsonDiv.className = 'jsonDiv'
  objectContainer.append(jsonDiv)
}
function uploadInit(){
  upload.click()
  upload.addEventListener("change",uploadListener)
}

// Create Functions Section

function createKeyElement(key){
  let keyElement = document.createElement('div')
  keyElement.className = 'Text'
  keyElement.innerHTML = key[0].toUpperCase() + key.slice(1) 
  return keyElement
}

function createTextInput(){
  let TextInput = document.createElement('input')
  TextInput.className = 'TextField'
  return TextInput
}

function createNumberInput(number) {
  let numberInput = document.createElement('input')
  numberInput.className = 'Number'
  numberInput.value = number
  numberInput.addEventListener('keydown',(e)=>{
    e.stopPropagation()
  })
  return numberInput
}

function createColorInput(color){
  let colorInput = document.createElement('input')
  colorInput.className = 'Color'
  colorInput.type = "Color"
  colorInput.value = color
  return colorInput
}

function createCustomText(innerText) {
  let text = document.createElement('span')
  text.innerText = innerText
  text.style.fontWeight = '300'
  text.style.fontSize = '12px'
  text.style.fontFamily = "American Typewriter"
  return text
}

function createRowWith3args(object,ObjectArgsValue,parent,key,offset){
  let row = createRow(key)
  let keyElement = createKeyElement(key)
  let firstArg = createNumberInput(key == 'rotation' ? (ObjectArgsValue[0] * 180 / Math.PI).toFixed(2) +  '°': ObjectArgsValue[0].toFixed(3))
  let secondArg = createNumberInput(key == 'rotation' ? (ObjectArgsValue[1] * 180 / Math.PI).toFixed(2) +  '°': ObjectArgsValue[1].toFixed(3))
  let thirdArg = createNumberInput(key == 'rotation' ? (ObjectArgsValue[2] * 180 / Math.PI).toFixed(2) +  '°': ObjectArgsValue[2].toFixed(3))
  const mouseFirstArgHandler = (event) => {
    let Xmulti = event.clientX - initialMouseXPosition 
    let Ymulti = initialMouseYPosition - event.clientY
    initialMouseXPosition = event.clientX 
    initialMouseYPosition = event.clientY
    numberInputValueControl(event,firstArg,offset, null, null,key,Xmulti,Ymulti)
    changeObjectTransformValueBasedOnMouseDrag(event,'x',firstArg,object,key);
  };
  const mouseSecondArgHandler = (event) => {
    let Xmulti = event.clientX - initialMouseXPosition 
    let Ymulti = initialMouseYPosition - event.clientY
    initialMouseXPosition = event.clientX 
    initialMouseYPosition = event.clientY
    numberInputValueControl(event,secondArg,offset, null, null,key,Xmulti,Ymulti)
    changeObjectTransformValueBasedOnMouseDrag(event,'y',secondArg,object,key);
  };
  const mouseThirdArgHandler = (event) => {
    let Xmulti = event.clientX - initialMouseXPosition 
    let Ymulti = initialMouseYPosition - event.clientY
    initialMouseXPosition = event.clientX 
    initialMouseYPosition = event.clientY
    numberInputValueControl(event,thirdArg,offset, null, null,key,Xmulti,Ymulti)
    changeObjectTransformValueBasedOnMouseDrag(event,'z',thirdArg,object,key);
};
  firstArg.addEventListener("mousedown",(e)=>{
    initialMouseXPosition = e.clientX
    initialMouseYPosition = e.clientY
    
    window.addEventListener("mousemove",mouseFirstArgHandler)
    window.addEventListener('mouseup',(e)=>{
      window.removeEventListener('mousemove',mouseFirstArgHandler)
  })
  })
  secondArg.addEventListener("mousedown",(e)=>{
    initialMouseXPosition = e.clientX
    initialMouseYPosition = e.clientY
    
    window.addEventListener("mousemove",mouseSecondArgHandler)
    
    window.addEventListener('mouseup',(e)=>{
      window.removeEventListener('mousemove',mouseSecondArgHandler)
  })
  })
  thirdArg.addEventListener("mousedown",(e)=>{
    initialMouseXPosition = e.clientX
    initialMouseYPosition = e.clientY
    
    window.addEventListener("mousemove",mouseThirdArgHandler)
    window.addEventListener('mouseup',(e)=>{
      window.removeEventListener('mousemove',mouseThirdArgHandler)
  })
  })
  firstArg.addEventListener('keydown',(e)=>{
    e.stopPropagation()
  })
  secondArg.addEventListener('keydown',(e)=>{
    e.stopPropagation()
  })
  thirdArg.addEventListener('keydown',(e)=>{
    e.stopPropagation()
  })
  firstArg.addEventListener('input',(e)=>{
  if(key != "rotation" ){
      object[key]['set'+ 'x'.toUpperCase()](+e.target.value)
    }else{
      e.target.value = e.target.value.replace('°','')
      object[key]['x'] = +(e.target.value) / 180 * Math.PI 
      e.target.value = (+e.target.value).toFixed(2) + '°'
    }
    selectionBox.update()
  })
  secondArg.addEventListener('input',(e)=>{
    if(key != "rotation" ){
      object[key]['set'+ 'y'.toUpperCase()](+e.target.value)
    }else{
      e.target.value = e.target.value.replace('°','')
      object[key]['y'] = +(e.target.value) / 180 * Math.PI 
      e.target.value = (+e.target.value).toFixed(2) + '°'
    }
    selectionBox.update()
  })
  thirdArg.addEventListener('input',(e)=>{
    if(key != "rotation" ){
      object[key]['set'+ 'z'.toUpperCase()](+e.target.value)
    }else{
      e.target.value = e.target.value.replace('°','')
      object[key]['z'] = +(e.target.value) / 180 * Math.PI 
      e.target.value = (+e.target.value).toFixed(2) + '°'
    }
    selectionBox.update()
  })
  row.append(keyElement,firstArg,secondArg,thirdArg)
  parent.appendChild(row)
}

function createObjectPanel(object,panelContainer){
  let panel = document.createElement('div')
  panel.id = 'objectPanel'  
  // name
  let row = createRow('name')
  let keyElement = createKeyElement('name')
  let TextInput = createTextInput()
  TextInput.value = object['name']
  TextInput.addEventListener('keydown',(e)=>{
    e.stopPropagation()
  })
  TextInput.addEventListener('input',(e)=>{
    object['name'] = e.target.value
    chosenLayer['name'] = e.target.value
    layerContainer.querySelector(`[data-uuid="${chosenLayer.uuid}"] #LayerName`).innerHTML = object['name']
  })
  row.append(keyElement,TextInput)
  panel.appendChild(row)

  // position
  createRowWith3args(object,[object.position.x,object.position.y,object.position.z],panel,'position',.020)

  if(object.type == 'Mesh'){  
    Object.keys(object).forEach((key)=>{    
      if(key == 'rotation'){
        createRowWith3args(object,[object.rotation.x,object.rotation.y,object.rotation.z],panel,key,1)
      }
      if(key == 'scale'){
        createRowWith3args(object,[object.scale.x,object.scale.y,object.scale.z],panel,key,.020  )
      }
      if(key == 'castShadow'){
        let row = createRow(key)
        let keyElement = createKeyElement('shadow')
        let cast = createCheckBoxContainer(object,'castShadow','cast')
        let recieve = createCheckBoxContainer(object,'receiveShadow','recieve')
        row.append(keyElement,cast,recieve)
        panel.appendChild(row)
      }
      if(key == 'visible'){
        let row = createRow(key)
        let keyElement = createKeyElement(key)
        let boolen = createCheckBoxContainer(object,key,'')
        row.append(keyElement,boolen)
        panel.appendChild(row)
      }
      if(key == 'frustumCulled'){
        let row = createRow(key)
        let keyElement = createKeyElement(key)
        let boolen = createCheckBoxContainer(object,key,'')
        row.append(keyElement,boolen)
        panel.appendChild(row)
      }
  })
  }
  else if(object?.isLight){
    Object.keys(lightProperties[object.type]).forEach((key)=>{      
      if(lightProperties[object.type][key].type == 'color'){
        let row = createRow(key)
        let keyElement = createKeyElement(key)
        let color = createColorInput('#' + object.color.getHexString())
        color.addEventListener('input',(e)=>{
          object['color'].set(e.target.value)
        })
        row.append(keyElement,color)
        panel.appendChild(row)
      }
      if(lightProperties[object.type][key].type == 'number'){
        let row = createRow(key)
        let keyElement = createKeyElement(key)
        let number = createNumberInput(object[key].toFixed(3))
        
        function lightMouseMovementHandler(event){
          let Xmulti = event.clientX - initialMouseXPosition 
          let Ymulti = initialMouseYPosition - event.clientY
          initialMouseXPosition = event.clientX 
          initialMouseYPosition = event.clientY
          numberInputValueControl(event,number,lightProperties[object.type][key].step,lightProperties[object.type][key].min,lightProperties[object.type][key].max,key,Xmulti,Ymulti)
          changeObjectValue(object,key,number)
          // IMPORTANT! change the light object values

        }
        number.addEventListener('mousedown',(e)=>{
          initialMouseXPosition = e.clientX
          initialMouseYPosition = e.clientY
          window.addEventListener("mousemove",lightMouseMovementHandler)
          window.addEventListener('mouseup',(e)=>{
            window.removeEventListener('mousemove',lightMouseMovementHandler)
        })})

        number.addEventListener('input',(e)=>{
            object[key] = +e.target.value

        })
        row.append(keyElement,number)
        panel.appendChild(row)
      }
      if(lightProperties[object.type][key].type == 'boolean'){        
        let row = createRow(key)
        let keyElement = createKeyElement(key == 'castShadow' ? 'Shadow' :key,)
        let boolen = createCheckBoxContainer(object,key == 'castShadow' ? 'castShadow' :key,key == 'castShadow' ? 'cast' :'')
        row.append(keyElement,boolen)
        panel.appendChild(row)
      }
    })
  }

  panelContainer.appendChild(panel)
}

function createGeometryPanel(object,panelContainer){
  let panel = document.createElement('div')
  panel.id = 'geometryPanel'
  // name
  let row = createRow('name')
  let keyElement = createKeyElement('name')
  let TextInput = createTextInput()
  TextInput.value = object.geometry['type']
  TextInput.addEventListener('keydown',(e)=>{
    e.stopPropagation()
  })
  TextInput.addEventListener('input',(e)=>{
    object.geometry['type'] = e.target.value
    chosenLayer['type'] = e.target.value
    layerContainer.querySelector(`[data-uuid="${chosenLayer.uuid}"] #LayerName`).innerHTML = object.geometry['type']
  })
  row.append(keyElement,TextInput)
  panel.appendChild(row)
  let properties = object.geometry.parameters
  if(properties){
  Object.keys(properties).forEach((key)=>{
    let row = createRow(key)
    let keyElement = createKeyElement(key)
    let numberInput = createNumberInput(object.geometry.parameters[key])
    function GeometryParamsMouseMovementHandler(event){
      let Xmulti = event.clientX - initialMouseXPosition 
      let Ymulti = initialMouseYPosition - event.clientY
      initialMouseXPosition = event.clientX 
      initialMouseYPosition = event.clientY
      numberInputValueControl(event,numberInput,key.includes('Segments') ? 1 :0.1,1,1000,key,Xmulti,Ymulti,key.includes('Segments') ? 0 : undefined)
      properties[key] = numberInput.value
      object.geometry = new THREE[object.geometry.type](...Object.values(properties))
    }
    numberInput.addEventListener('mousedown',(e)=>{
      initialMouseXPosition = e.clientX
      initialMouseYPosition = e.clientY
      window.addEventListener("mousemove",GeometryParamsMouseMovementHandler)
      window.addEventListener('mouseup',(e)=>{
        window.removeEventListener('mousemove',GeometryParamsMouseMovementHandler)
    })})
    row.append(keyElement,numberInput)
    panel.appendChild(row)
  })
  }

  panelContainer.appendChild(panel)
}

function createMaterialPanel(object,panelContainer){
  let panel = document.createElement('div')
  panel.id = 'materialPanel'
  panelContainer.appendChild(panel)
}

function createRow(key){
  let row = document.createElement('div')
  row.className = `Row ${key}`
  return row
}

function createCheckBoxInput(object,key){
  let box = document.createElement('input')
  box.className = 'checkbox'
  box.type = 'checkbox'
  box.checked = object[key]
  box.addEventListener('change',(e)=>{    
    object[key] = e.target.checked 
  })
  return box
}

function createCheckBoxContainer(object,key,text){
  let container = document.createElement('div')
  let label = document.createElement('span')
  label.innerText = text
  label.id = "extraInfo"
  let box = createCheckBoxInput(object,key)
  container.append(box,label)
  return container
}









let panel1 = document.createElement('div')
panel1.id = 'objectPanel'  
let panelContainer = document.createElement('div')
panelContainer.id = "panelContainer"

createRowWith3args(mainScene,[mainScene.position.x,mainScene.position.y,mainScene.position.z],panel1,'position',0.020)


panelContainer.appendChild(panel1)
objectContainer.appendChild(panelContainer)

let fileName;
function uploadListener(e){
  for (let i = 0; i < e.target.files.length; i++) {
    const element = e.target.files[i];
    fileName = element.name
    let blobUrl = URL.createObjectURL(element)
    let extention = (element.name).split('.').pop().toLowerCase()
    switch (extention) {
      case 'glb' :
      case 'gltf' :
        const loName = loaderMap[extention]
        const NLoader = new loName()        
        let glbObj = NLoader.load(blobUrl,(e)=>{
          e.scene.skip = true
          mainScene.add(e.scene)
        })
        break;
      case 'fbx':
        const lo = loaderMap[extention]
        const fbxLoader = new lo()        
        let fbxObj = fbxLoader.load(blobUrl,(e)=>{
          mainScene.add(e.scene)
        })
        break; 
      case 'svg':
        break; 
      case 'obj':
        break; 
      case 'stl' :
        break; 
      case 'ply':
        break; 
      default:
        break;
    }


  }
}

document.querySelectorAll('.option').forEach((a)=> { 
  a.addEventListener('click',(b)=>{
    if(b.target.classList.contains('opop')){
      // then remove the selection from every option and close the panel 
      document.body.querySelectorAll('.opop').forEach((c)=>{
        if(c.dataset.type == "main"){
          toggleFirstAnimation(c.firstElementChild) 
        }
        c.classList.remove('opop')
      }
      ) 
      panelEle.classList.remove('optrans') 
      panelEle.style.width = "45px"  

    }
    else{
      objectContainer.innerHTML = ``
      // then remove selection from every option that is selected 
      document.body.querySelectorAll('.opop').forEach((c)=>{
        if(c.dataset.type == "main"){
          toggleFirstAnimation(c.firstElementChild) 
        }
        if(c.dataset.type == "setting" || c.dataset.type == "main"){
          objectContainer.classList.add('grid-layout')
        }
        c.classList.remove('opop')
      }
      ) 
      if(b.target.dataset.type == 'upload'){        
        uploadInit()
        return
      }
      b.target.classList.add('opop')
      if(!panelEle.classList.contains('optrans')){
        panelEle.classList.add('optrans')
        panelEle.style.width = panel.width + "px"
      } 
      // and after than check what you clicked
      if(b.target.dataset.type == "main"){
        objectContainer.classList.remove('grid-layout')
        toggleFirstAnimation(b.target.firstElementChild)
        mainInit()
        return
      }
      objectContainer.classList.add('grid-layout')
      if(b.target.dataset.type == "light"){
        lightInit()
      }
      if(b.target.dataset.type == "geometry"){
        geometryInit()
      }
      if(b.target.dataset.type == "material"){
        materialInit()
      }
      if(b.target.dataset.type == "specialEffects"){
        specialEffectsInit()
      }
      if(b.target.dataset.type == "customPresets"){
        customPresetsInit()
      }
      if(b.target.dataset.type == "setting"){
        objectContainer.classList.remove('grid-layout')
        settingInit()
      }

    }
})
})

// Helping functions


function selectLabel(e){
  if(!e.target.classList.contains('selected')){
    document.querySelectorAll('.selected').forEach((e)=>e.classList.remove('selected'))
    document.querySelectorAll('.panelOpen').forEach((e)=>e.classList.remove('panelOpen'))
    document.querySelector(`#${e.target.innerText.toLowerCase() + 'Panel'}`).classList.add('panelOpen')
    e.target.classList.add('selected')
  }

}

function updateInfo(){
  let arr = ["x",'y','z']
    for (let i = 0; i < infoP.children.length; i++) {
      infoP.children.item(i).innerHTML = `${arr[i]}:  ${chosenLayer?.position[arr[i]] || 0}`;
    }
}

function numberInputValueControl(event,element,offset,min,max,key,Xmulti,Ymulti,fixNum){ 
  if(key != "rotation"){
    console.log(min,max);
    
    let newValue = (+element.value + offset * (Xmulti + Ymulti)).toFixed(fixNum !== undefined ? fixNum : 3) 
    if(Number.isFinite(min) && Number.isFinite(max) ){
      if(min <= newValue && max >= newValue){
      element.value = newValue
    }
    }else{
      element.value = newValue
    }
  }else{
    let newValue = (+element.value.replace('°','')+ offset * (Xmulti + Ymulti)).toFixed(fixNum !== undefined ? fixNum : 2) 
    if(Number.isFinite(min) && Number.isFinite(max) ){
      if(min <= newValue && max >= newValue){
        element.value = `${(element.value.replace('°','')+ offset * (Xmulti + Ymulti) ).toFixed(fixNum !== undefined ? fixNum : 2)}°` 
      }
    }else{
      element.value = `${(+element.value.replace('°','')+ offset * (Xmulti + Ymulti) ).toFixed(fixNum !== undefined ? fixNum : 2)}°` 
    }
  }
}

function changeObjectValue(object,key,element){
  object[key] = +element.value
}

function changeObjectTransformValueBasedOnMouseDrag(event,valueSymbol,element,object,key){
  
  if((object?.isLight || object?.isTarget) && object?.userData.object){    
    object?.userData.object.update()
  }
  if(key != "rotation" ){
    object[key]['set'+ valueSymbol.toUpperCase()](+element.value)
  }else{
    object[key][valueSymbol] = +(((+(element.value.replace('°','')) / 180 * Math.PI)))
  }
  object.updateMatrixWorld(true);
  selectionBox.update()
  TC.update()  
}

// Event Listeners
window.addEventListener("mouseup",(e)=>{
  if(isDraggingTransformControls && document.getElementById('optionMenu').getBoundingClientRect().x > e.clientX){
    let x = (e.clientX / (window.innerWidth / 2) - 1 )
    let y = -(e.clientY / (window.innerHeight / 2) - 1 )
    rayCast.setFromCamera(new THREE.Vector2(x,y),mainCamera)
    let filters = [];
    mainScene.traverseVisible((child)=>{
      if((child.type == 'Mesh' || child?.isLight || child.name == 'picker') && (!child?.isLightHelper && !child.isTransformControlsRoot && !child?.type.includes("Grid") && !child?.type.includes("Axes"))){
        filters.push(child)
      }
    })
    let intersectObj = rayCast.intersectObjects(filters,false)
    if(intersectObj.length > 0 ){
      let mesh = intersectObj[0].object
      if(mesh.userData.object !== undefined){
        chosenLayer = mesh.userData.object 
      }else{
        chosenLayer = mesh
      }
      hideTransformAndSelectionBox()
      handleTranformControlsAndBoxHelper(chosenLayer)
      mainInit()
      updateInfo()
    }else if(intersectObj.length < 1 ){
      chosenLayer = null
      hideTransformAndSelectionBox()
      removeAllActiveClass()
    }
  }
})

window.addEventListener("resize", () => {
  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();

  Mainrenderer.setSize(window.innerWidth, window.innerHeight);
  Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousedown",(e)=>{
  isDraggingTransformControls = true
})

window.addEventListener("mousemove",(e)=>{
  isDraggingTransformControls = false
})

window.addEventListener('keydown',(e)=>{
  if(e.keyCode == 8){
    if(chosenLayer && chosenLayer.uuid !== mainScene.uuid && chosenLayer.uuid !== mainCamera.uuid ){
      TC.detach()
      hideTransformAndSelectionBox()
      layerContainer.querySelector(`[data-uuid="${chosenLayer.uuid}"]`).remove()
      if(chosenLayer?.isLight){
        chosenLayer.userData?.object && chosenLayer.userData.object.removeFromParent()
        if(chosenLayer.target){
          layerContainer.querySelector(`[data-uuid="${chosenLayer.target.uuid}"]`).remove()
          chosenLayer.target.removeFromParent()
        }
      } 
      chosenLayer.removeFromParent() 
      chosenLayer = null
      mainInit()
    }
  }
  if(e.key.toLocaleLowerCase() == 't'){
    TC.setMode('translate')
  }
  if(e.key.toLocaleLowerCase() == 'r'){
    TC.setMode('rotate')
  }
  if(e.key.toLocaleLowerCase() == 's'){
    TC.setMode('scale')
  }
})

mainScene.addEventListener("childadded",updateLayers)

appendLayer(mainCamera,layerContainer,'type camera',false,
)
appendLayer(mainScene,layerContainer,'type scene',false,)


// Export Code 
let code;
document.getElementById('export-code').addEventListener('click',(event)=>{
  document.getElementById('language-jsContain').hidden = false
  mainScene.children.forEach(handleExport)
  let codeExportElement = document.getElementById('language-js')
  codeExportElement.textContent = code
  Prism.highlightElement(codeExportElement);
})
function handleExport(child) {
  code = ``
   if(child.constructor.name && Object.hasOwn(THREE,child.constructor.name)){
      if(child.isGroup){
        code += `let group = new THREE.group()\n`
        child.children.forEach((groupChild)=>handleExport(groupChild))
        return
      }
      console.log(child);
      
      let params = Object.values(child?.geometry.parameters)
      if(child?.geometry){
        code += `let ${child.geometry} = new THREE.${child.geometry.constructor.name}(${params ? params.join(',') : ''})\n`
      }
      code += `let ${child.constructor.name} = new THREE.${child.constructor.name}()\n`
    
    }
}

function handleImportedSceneExport(){

}

function handleMeshExport(){
  
}

function getConstructorParamters(object){
  let source = object.toString()
  let match = source.match(/this\.parameters\s*=\s*\{([\s\S]*?)\}/)
  return match[1].split(',').map(param => param.trim())
}
// End of Export Code 

function updateLayers(e){
  layerFiltering(e.child)
}
window.scene = mainScene
function layerFiltering(e){
    if(!e?.isCamera && !e?.isLightHelper && !e?.controls && !e?.type.includes("Grid") && !e?.type.includes("Axes")){
      if(!layerObjects.includes(e.uuid)){
        layerObjects.push(e.uuid)
        let classy = ''
        if(e?.isLight){
          classy += "light"
        }
        if(e?.isMesh){
          classy += "mesh"
        }
        if(e?.isGroup){
          let groupName = fileName
          appendLayer(groupName,layerContainer,'type ',false,e.uuid)
          e.children.forEach((f)=>{
            handleTranformControlsAndBoxHelper(f)
            layerFiltering(f)
          })
          return
        }
        appendLayer(e ,layerContainer,'type '+ classy,true)
      }
    }
}

function appendLayer(object,parent,markC,opener){
  let layer = document.createElement('div')
  layer.className = "layer"
  layer.setAttribute('data-uuid',object.uuid)
  layer.innerHTML = `
    ${opener ? '<span class="opener"></span>' : ""}
    <span class="${markC}"></span>
    <span id="LayerName">${object?.userData?.name ? object.userData.name : object.name ? object.name : object.type}</span>
    ${object?.geometry !== undefined ? '<span class="type geometry"></span>' : ''}
    ${object?.material !== undefined ? '<span class="type material"></span>' : ''}
`
  layer.addEventListener('click',(e)=>{
    if(mainScene.uuid == object.uuid){
      chosenLayer = mainScene
    }
    else if(mainCamera.uuid == object.uuid){
      chosenLayer = mainCamera
    }else{
      chosenLayer = mainScene.getObjectByProperty("uuid",object.uuid)
      handleTranformControlsAndBoxHelper(chosenLayer)
    }
    mainInit()
  })
  parent.appendChild(layer)
}

function handleTranformControlsAndBoxHelper(obj){
  hideTransformAndSelectionBox()  
  if(obj?.isLight){
    attachTranformControls(obj)
  }else{
    attachTranformControls(obj)
    attachBoxHelper(obj)
  }
}

// save scene status and load it 

let pasr = mainScene.toJSON()
pasr.backgroundColor = 'blaczk'
pasr.arbb = 'blaczkasdf'
let laoder = new THREE.ObjectLoader()
let kadf = laoder.parse(mainScene.toJSON())

