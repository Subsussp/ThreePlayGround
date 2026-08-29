import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from "three/addons/controls/TransformControls.js";
import MouseFollower from "mouse-follower";
import gsap from "gsap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "mouse-follower/dist/mouse-follower.min.css";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

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
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import Sortable from "sortablejs";

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
let isUsingTransformControls = false;

let db;
let settingFromLocalstorage = window.localStorage.getItem('setting')
let SCENE_DEFAULT_BACKGROUND_COLOR = new THREE.Color('#333333')


const exporters = {
    gltf: new GLTFExporter(),
    obj: new OBJExporter(),
    stl: new STLExporter(),
    ply: new PLYExporter(),
};
const fbxLoader = new FBXLoader();
const stloader = new STLLoader();
const objLoader = new OBJLoader();
const plyLoader = new PLYLoader();
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); 
loader.setDRACOLoader(dracoLoader);
window.addEventListener('DOMContentLoaded', () => {
  const request = indexedDB.open("threejs-editor", 1);

  request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains("states")) {
        db.createObjectStore("states");
    }
    createEditor(new THREE.Group(),true)

  };


  request.onsuccess = (event) => {
      db = event.target.result;
      let tx = db.transaction('states', 'readwrite');
      const sceneData = tx.objectStore('states');
      let data = sceneData.get(0)
      data.onsuccess = async () => {
        if(data.result){
          let laoder = new THREE.ObjectLoader()
          let kadf = laoder.parse(data.result)
          createEditor(kadf,false,data.result)

        }

        // save scene status and load it 

      };
  };
})
async function createEditor(mainscene,initialization,rawObject){
  let appElement = document.getElementById("app")
  let objectContainer = document.getElementById('ObjectsContainer')
  let mainOption = document.querySelector('[data-type="main"]')
  let newbutton = document.getElementById("new");
  let panelEle = document.getElementById("panel");
  let infoP = document.getElementById('infoPanel');
  let sceneSettings = document.getElementById('sceneSettings');
  const Grid = document.querySelector("#G")
  const Axes = document.querySelector("#Ax")
  let layerContainer = document.getElementById('layersControl');
  layerContainer.innerHTML = ''
  let upload = document.getElementById('upload')
  const Photo = document.getElementById('photoInput'); 
  const glb = await loader.loadAsync('https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/3D/Statue.glb' )
  let statue = glb.scene

  let gmaterial = new THREE.MeshStandardMaterial({color: 0xffffff, 
    roughness: 0.2, 
    metalness: 0,
    side: THREE.FrontSide
  });
  statue.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) {
        child.geometry.center();;    
      }
      child.material = gmaterial
    }
  });
  const fog = new THREE.Fog(0x644600, 0.10, 50);
  const fogExpo = new THREE.FogExp2(0x644600, 0.05);
  let exportCode;
  let importSection;
  let codeSection;
  let sceneAddSection;
  let animateSection;
  let mainRenderer;
  let mainComposer;
  let fileName;
  let functionAfterPhotoUpload;
  let effectsNames = [];
  let chosenLayer;
  let mainScene;
  let MainRealscene;
  let mainCamera;
  let mainCameraParam = [ 75, window.innerWidth / window.innerHeight, 0.1, 1000 ];
  let vertexNormalsHelper;
  let animationId;
  let controls;
  let TC;
  
  let selectionBox;
  let renderer = new THREE.WebGLRenderer({antialias:true})
  const spriteTexture =new THREE.TextureLoader().load("textures/sprite.jpg");
  const copyButton = document.querySelector(".copy-button");
  const code = document.querySelector("#language-js");
  let codecont = document.getElementById('language-jsContain')
  let out = false

  let copyTimeout;

  // Elements Event Listeners
  copyButton.addEventListener("click", async () => {
      try {
          await navigator.clipboard.writeText(code.textContent);

          copyButton.classList.add("copied");
          copyButton.setAttribute("aria-label", "Copied");

          clearTimeout(copyTimeout);

          copyTimeout = setTimeout(() => {
              copyButton.classList.remove("copied");
              copyButton.setAttribute("aria-label", "Copy code");
          }, 1500);

      } catch (error) {
          console.error("Failed to copy:", error);
      }
  });
  newbutton.addEventListener('click',(e)=>{
    disposeEverything()
    saveSceneState()
  })
  Photo.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    functionAfterPhotoUpload(url)
})
codecont.addEventListener('mouseover',(e)=>out = false)
codecont.addEventListener('mouseout',(e)=>out = true)
  document.querySelectorAll('.export').forEach((e)=>{    
    e.addEventListener('mouseup',async (element)=>{
      element.stopPropagation()
      let exportFileExtention = element.target.innerText
      if(exportFileExtention.toLowerCase() == 'drc'){
        const { DRACOExporter } = await import( 'three/addons/exporters/DRACOExporter.js' );
        let exporter = new DRACOExporter()
        console.log(chosenLayer);
        
        const options = {
          decodeSpeed: 5,
          encodeSpeed: 5,
          encoderMethod: DRACOExporter.MESH_EDGEBREAKER_ENCODING,
          quantization: [ 16, 8, 8, 8, 8 ],
          exportUvs: true,
          exportNormals: true,
          exportColor: chosenLayer.geometry.hasAttribute( 'color' )
      };
        let data = await exporter.parseAsync(chosenLayer,options);
        saveBuffer(data, 'model.drc')
      }else if(exportFileExtention.toLowerCase() == 'gltf' || exportFileExtention.toLowerCase() == 'gltf' ){
        const { GLTFExporter } = await import( 'three/addons/exporters/GLTFExporter.js' );
        let exporter = new GLTFExporter();
        const copyOfChildren = mainScene.children.filter((child) => {
            return !(
                child?.isTransformControls ||
                child.name === "TransformControlsHelper" ||
                child?.userData?.isVertexNormalsHelper
            );
        });
        exporter.parse(copyOfChildren,function (result){
          saveBuffer(exportFileExtention == 'GLTF' ? JSON.stringify(result, null, 2) : result, `scene.${element.target.innerText}`)
        })
      }

    })
  })
  // delete the loaderMap after you finish
  let loaderMap = {
    glb: 'GLTFLoader',
    gltf: 'GLTFLoader',
    fbx: 'FBXLoader',
    obj: 'OBJLoader',
    stl: 'STLLoader',
    ply: 'PLYLoader',
    svg: 'SVGLoader',
  }

  let settings =settingFromLocalstorage ? JSON.parse(settingFromLocalstorage) :{
    defaultGeomtriesMaterial: 'MeshBasicMaterial',
    showHelpers: true,
    showTransformControls: true,
    wireframe: false,
    preview_3D: true,
    openPanelOnChange: true,
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
    ShadowMaterial:{
      args:[]
    },
    SpriteMaterial:{
      args:[{ transparent: true, map:spriteTexture }],
      Sprite:true
    },
    PointsMaterial:{
      args:[{
  color: 0x00ff00,
  size: 20,
  sizeAttenuation: false,
}],
      Points:true
    },
     LineBasicMaterial:{
      args:[{ color: 0xffffff }],
      Line:true
    },
    LineDashedMaterial:{
      args:[ {
        color: 0xffffff,
        scale: 1,
        dashSize: .1,
        gapSize: .3,

  } ],
      Line:true
    },
  }
  const materialProperties = {

    MeshBasicMaterial: {
      color: { type: "color", value: 0xffffff },
      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },
      fog: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },
      aoMap: { type: "texture", value: null },
      lightMap: { type: "texture", value: null },

      toneMapped: { type: "boolean", value: true }
    },


    MeshLambertMaterial: {
      color: { type: "color", value: 0xffffff },

      emissive: { type: "color", value: 0x000000 },
      emissiveIntensity: { type: "number", value: 1, min: null, max: null },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },
      fog: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },
      aoMap: { type: "texture", value: null },
      lightMap: { type: "texture", value: null },
      emissiveMap: { type: "texture", value: null },

      toneMapped: { type: "boolean", value: true }
    },


    MeshPhongMaterial: {
      color: { type: "color", value: 0xffffff },

      specular: { type: "color", value: 0x111111 },
      shininess: { type: "number", value: 30, min: null, max: null },

      emissive: { type: "color", value: 0x000000 },
      emissiveIntensity: { type: "number", value: 1, min: null, max: null },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },
      fog: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },
      aoMap: { type: "texture", value: null },
      lightMap: { type: "texture", value: null },
      emissiveMap: { type: "texture", value: null },

      bumpMap: { type: "texture", value: null },
      bumpScale: { type: "number", value: 1,  min: null, max: null  },

      normalMap: { type: "texture", value: null },
      normalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
  min: null, max: null 
      },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      specularMap: { type: "texture", value: null },

      flatShading: { type: "boolean", value: false },

      toneMapped: { type: "boolean", value: true }
    },


    MeshToonMaterial: {
      color: { type: "color", value: 0xffffff },

      emissive: { type: "color", value: 0x000000 },
      emissiveIntensity: { type: "number", value: 1, min: null, max: null },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },
      fog: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },
      aoMap: { type: "texture", value: null },
      lightMap: { type: "texture", value: null },
      emissiveMap: { type: "texture", value: null },

      bumpMap: { type: "texture", value: null },
      bumpScale: { type: "number", value: 1, min: null, max: null  },

      normalMap: { type: "texture", value: null },
      normalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
  min: null, max: null 
      },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      gradientMap: { type: "texture", value: null },

      flatShading: { type: "boolean", value: false },

      toneMapped: { type: "boolean", value: true }
    },


    MeshStandardMaterial: {
      color: { type: "color", value: 0xffffff },

      roughness: { type: "number", value: 1, min: 0, max: 1 },
      metalness: { type: "number", value: 0, min: 0, max: 1 },

      emissive: { type: "color", value: 0x000000 },
      emissiveIntensity: { type: "number", value: 1, min: null, max: null },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },
      fog: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },
      aoMap: { type: "texture", value: null },
      lightMap: { type: "texture", value: null },
      emissiveMap: { type: "texture", value: null },

      bumpMap: { type: "texture", value: null },
      bumpScale: { type: "number", value: 1,  min: null, max: null  },

      normalMap: { type: "texture", value: null },
      normalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
        min: null, max: null 
      },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      metalnessMap: { type: "texture", value: null },
      roughnessMap: { type: "texture", value: null },

      envMap: { type: "texture", value: null },
      envMapIntensity: { type: "number", value: 1, min: null, max: null },

      flatShading: { type: "boolean", value: false },

      toneMapped: { type: "boolean", value: true }
    },


    MeshPhysicalMaterial: {
      color: { type: "color", value: 0xffffff },

      roughness: { type: "number", value: 0.5, min: 0, max: 1 },
      metalness: { type: "number", value: 0, min: 0, max: 1 },

      emissive: { type: "color", value: 0x000000 },
      emissiveIntensity: { type: "number", value: 1, min: null, max: null },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },
      fog: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },
      aoMap: { type: "texture", value: null },
      lightMap: { type: "texture", value: null },
      emissiveMap: { type: "texture", value: null },

      bumpMap: { type: "texture", value: null },
      bumpScale: { type: "number", value: 1,  min: null, max: null  },

      normalMap: { type: "texture", value: null },
      normalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
  min: null, max: null 
      },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      metalnessMap: { type: "texture", value: null },
      roughnessMap: { type: "texture", value: null },

      envMap: { type: "texture", value: null },
      envMapIntensity: { type: "number", value: 1, min: null, max: null },

      clearcoat: { type: "number", value: 0, min: 0, max: 1 },
      clearcoatRoughness: { type: "number", value: 0, min: 0, max: 1 },

      clearcoatMap: { type: "texture", value: null },
      clearcoatRoughnessMap: { type: "texture", value: null },

      clearcoatNormalMap: { type: "texture", value: null },
      clearcoatNormalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
        min: 0,
        max: 1
      },

      ior: { type: "number", value: 1.5, min: 1, max: 2.333 },

      specularIntensity: { type: "number", value: 1, min: 0, max: 1 },
      specularColor: { type: "color", value: 0xffffff },

      specularIntensityMap: { type: "texture", value: null },
      specularColorMap: { type: "texture", value: null },

      iridescence: { type: "number", value: 0, min: 0, max: 1 },
      iridescenceIOR: { type: "number", value: 1.3, min: 1, max: 2.333 },

      iridescenceThicknessRange: {
        type: "vector2",
        value: new THREE.Vector2(100, 400),
        min: null,
        max: null
      },

      iridescenceMap: { type: "texture", value: null },
      iridescenceThicknessMap: { type: "texture", value: null },

      sheen: { type: "number", value: 0, min: 0, max: 1 },
      sheenColor: { type: "color", value: 0x000000 },
      sheenRoughness: { type: "number", value: 1, min: 0, max: 1 },

      sheenColorMap: { type: "texture", value: null },
      sheenRoughnessMap: { type: "texture", value: null },

      transmission: { type: "number", value: 0, min: 0, max: 1 },
      transmissionMap: { type: "texture", value: null },

      thickness: { type: "number", value: 0, min: 0, max: null },
      thicknessMap: { type: "texture", value: null },

      attenuationDistance: {
        type: "number",
        value: Infinity,
        min: 0,
        max: null
      },

      attenuationColor: { type: "color", value: 0xffffff },

      anisotropy: { type: "number", value: 0, min: 0, max: 1 },
      anisotropyRotation: { type: "number", value: 1, min: null, max: null },
      anisotropyMap: { type: "texture", value: null },

      flatShading: { type: "boolean", value: false },

      toneMapped: { type: "boolean", value: true }
    },


    MeshNormalMaterial: {
      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },

      flatShading: { type: "boolean", value: false },

      bumpMap: { type: "texture", value: null },
      bumpScale: { type: "number", value: 1,  min: null, max: null  },

      normalMap: { type: "texture", value: null },
      normalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
  min: null, max: null 
      },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      toneMapped: { type: "boolean", value: true }
    },


    MeshMatcapMaterial: {
      color: { type: "color", value: 0xffffff },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      vertexColors: { type: "boolean", value: false },
      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },

      map: { type: "texture", value: null },
      matcap: { type: "texture", value: null },

      bumpMap: { type: "texture", value: null },
      bumpScale: { type: "number", value: 1,  min: null, max: null },

      normalMap: { type: "texture", value: null },
      normalScale: {
        type: "vector2",
        value: new THREE.Vector2(1, 1),
  min: null, max: null 
      },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      flatShading: { type: "boolean", value: false },

      fog: { type: "boolean", value: true },

      toneMapped: { type: "boolean", value: true }
    },


    MeshDepthMaterial: {
      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      wireframe: { type: "boolean", value: false },
      wireframeLinewidth: { type: "number", value: 1, min: null, max: null },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null },

      depthPacking: {
        type: "select",
        value: THREE.BasicDepthPacking,
        options: {
          BasicDepthPacking: THREE.BasicDepthPacking,
          RGBADepthPacking: THREE.RGBADepthPacking
        }
      }
    },


    MeshDistanceMaterial: {
      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },

      displacementMap: { type: "texture", value: null },
      displacementScale: { type: "number", value: 0, min: null, max: null },
      displacementBias: { type: "number", value: 0, min: null, max: null }
    },


    ShadowMaterial: {
      color: { type: "color", value: 0x000000 },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: true },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      side: {
        type: "select",
        value: THREE.FrontSide,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide
        }
      },

      fog: { type: "boolean", value: true }
    },


    PointsMaterial: {
      color: { type: "color", value: 0xffffff },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      size: { type: "number", value: 1, min: null, max: null },
      sizeAttenuation: { type: "boolean", value: true },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },

      vertexColors: { type: "boolean", value: false },

      fog: { type: "boolean", value: true },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      toneMapped: { type: "boolean", value: true }
    },


    LineBasicMaterial: {
      color: { type: "color", value: 0xffffff },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      vertexColors: { type: "boolean", value: false },

      linewidth: { type: "number", value: 1, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      toneMapped: { type: "boolean", value: true }
    },


    LineDashedMaterial: {
      color: { type: "color", value: 0xffffff },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: false },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      vertexColors: { type: "boolean", value: false },

      linewidth: { type: "number", value: 1, min: null, max: null },

      dashSize: { type: "number", value: 3, min: null, max: null },
      gapSize: { type: "number", value: 1, min: null, max: null },
      scale: { type: "number", value: 1, min: null, max: null },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      toneMapped: { type: "boolean", value: true }
    },


    SpriteMaterial: {
      color: { type: "color", value: 0xffffff },

      opacity: { type: "number", value: 1, min: 0, max: 1 },
      transparent: { type: "boolean", value: true },
      alphaHash: { type: "boolean", value: false },
      alphaTest: { type: "number", value: 0, min: null, max: null },

      map: { type: "texture", value: null },
      alphaMap: { type: "texture", value: null },

      rotation: { type: "number", value: 0, min: null, max: null },

      sizeAttenuation: { type: "boolean", value: true },

      fog: { type: "boolean", value: true },

      depthTest: { type: "boolean", value: true },
      depthWrite: { type: "boolean", value: true },

      toneMapped: { type: "boolean", value: true }
    },
    ShaderMaterial: {
  opacity: { type: "number", value: 1, min: 0, max: 1 },
  transparent: { type: "boolean", value: false },
  alphaHash: { type: "boolean", value: false },
  alphaTest: { type: "number", value: 0, min: null, max: null },

  depthTest: { type: "boolean", value: true },
  depthWrite: { type: "boolean", value: true },

  side: {
    type: "select",
    value: THREE.FrontSide,
    options: {
      FrontSide: THREE.FrontSide,
      BackSide: THREE.BackSide,
      DoubleSide: THREE.DoubleSide
    }
  },

  wireframe: { type: "boolean", value: false },
  wireframeLinewidth: { type: "number", value: 1, min: null, max: null },

  vertexColors: { type: "boolean", value: false },
  fog: { type: "boolean", value: true },

  clipping: { type: "boolean", value: false },

  toneMapped: { type: "boolean", value: true },

  vertexShader: { type: "string", value: "" },
  fragmentShader: { type: "string", value: "" },

  uniforms: { type: "object", value: {} }
},
  };
  const arrayOfMaterialNames = Object.keys(materialProperties)
const materialDefaultProperties = {
    MeshBasicMaterial: {
        color: 0xffffff,
        map: null,
        lightMap: null,
        lightMapIntensity: 1,
        aoMap: null,
        aoMapIntensity: 1,
        specularMap: null,
        alphaMap: null,
        envMap: null,
        envMapRotation: [0, 0, 0],
        combine: THREE.MultiplyOperation,
        reflectivity: 1,
        refractionRatio: 0.98,
        wireframe: false,
        wireframeLinewidth: 1,
        wireframeLinecap: "round",
        wireframeLinejoin: "round",
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshLambertMaterial: {
        color: 0xffffff,
        emissive: 0x000000,
        emissiveIntensity: 1,
        emissiveMap: null,
        map: null,
        lightMap: null,
        lightMapIntensity: 1,
        aoMap: null,
        aoMapIntensity: 1,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        alphaMap: null,
        envMap: null,
        envMapRotation: [0, 0, 0],
        combine: THREE.MultiplyOperation,
        reflectivity: 1,
        refractionRatio: 0.98,
        wireframe: false,
        wireframeLinewidth: 1,
        flatShading: false,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshPhongMaterial: {
        color: 0xffffff,
        specular: 0x111111,
        shininess: 30,
        map: null,
        lightMap: null,
        lightMapIntensity: 1,
        aoMap: null,
        aoMapIntensity: 1,
        emissive: 0x000000,
        emissiveIntensity: 1,
        emissiveMap: null,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        specularMap: null,
        alphaMap: null,
        envMap: null,
        envMapRotation: [0, 0, 0],
        combine: THREE.MultiplyOperation,
        reflectivity: 1,
        refractionRatio: 0.98,
        wireframe: false,
        wireframeLinewidth: 1,
        flatShading: false,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshToonMaterial: {
        color: 0xffffff,
        map: null,
        gradientMap: null,
        lightMap: null,
        lightMapIntensity: 1,
        aoMap: null,
        aoMapIntensity: 1,
        emissive: 0x000000,
        emissiveIntensity: 1,
        emissiveMap: null,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        alphaMap: null,
        wireframe: false,
        wireframeLinewidth: 1,
        flatShading: false,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshStandardMaterial: {
        color: 0xffffff,
        roughness: 1,
        metalness: 0,
        map: null,
        lightMap: null,
        lightMapIntensity: 1,
        aoMap: null,
        aoMapIntensity: 1,
        emissive: 0x000000,
        emissiveIntensity: 1,
        emissiveMap: null,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        roughnessMap: null,
        metalnessMap: null,
        alphaMap: null,
        envMap: null,
        envMapRotation: [0, 0, 0],
        flatShading: false,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshPhysicalMaterial: {
        color: 0xffffff,
        roughness: 1,
        metalness: 0,
        map: null,
        lightMap: null,
        lightMapIntensity: 1,
        aoMap: null,
        aoMapIntensity: 1,
        emissive: 0x000000,
        emissiveIntensity: 1,
        emissiveMap: null,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        roughnessMap: null,
        metalnessMap: null,
        alphaMap: null,
        envMap: null,
        envMapRotation: [0, 0, 0],

        anisotropy: 0,
        anisotropyRotation: 0,
        anisotropyMap: null,

        clearcoat: 0,
        clearcoatMap: null,
        clearcoatRoughness: 0,
        clearcoatRoughnessMap: null,
        clearcoatNormalMap: null,
        clearcoatNormalScale: [1, 1],

        ior: 1.5,

        iridescence: 0,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        iridescenceMap: null,
        iridescenceThicknessMap: null,

        sheen: 0,
        sheenColor: 0x000000,
        sheenColorMap: null,
        sheenRoughness: 1,
        sheenRoughnessMap: null,

        specularIntensity: 1,
        specularColor: 0xffffff,
        specularColorMap: null,
        specularIntensityMap: null,

        transmission: 0,
        transmissionMap: null,

        thickness: 0,
        thicknessMap: null,

        attenuationDistance: Infinity,
        attenuationColor: 0xffffff,

        dispersion: 0,

        flatShading: false,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshMatcapMaterial: {
        color: 0xffffff,
        matcap: null,
        map: null,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        alphaMap: null,
        flatShading: false,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshNormalMaterial: {
        flatShading: false,
        wireframe: false,
        wireframeLinewidth: 1,
        fog: true,
        bumpMap: null,
        bumpScale: 1,
        normalMap: null,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: [1, 1],
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        opacity: 1,
        transparent: false
    },

    MeshDepthMaterial: {
        depthPacking: THREE.BasicDepthPacking,
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        wireframe: false,
        wireframeLinewidth: 1,
        fog: true,
        opacity: 1,
        transparent: false
    },

    MeshDistanceMaterial: {
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        fog: true,
        opacity: 1,
        transparent: false
    },

    PointsMaterial: {
        color: 0xffffff,
        map: null,
        alphaMap: null,
        size: 1,
        sizeAttenuation: true,
        fog: true,
        opacity: 1,
        transparent: false
    },

    SpriteMaterial: {
        color: 0xffffff,
        map: null,
        alphaMap: null,
        rotation: 0,
        sizeAttenuation: true,
        fog: true,
        opacity: 1,
        transparent: false
    },

    LineBasicMaterial: {
        color: 0xffffff,
        linewidth: 1,
        linecap: "round",
        linejoin: "round",
        opacity: 1,
        transparent: false
    },

    LineDashedMaterial: {
        color: 0xffffff,
        linewidth: 1,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
        opacity: 1,
        transparent: false
    },

    ShadowMaterial: {
        color: 0x000000,
        fog: true,
        opacity: 1,
        transparent: true
    },

    ShaderMaterial: {
        uniforms: {},
        vertexShader: "",
        fragmentShader: "",
        linewidth: 1,
        wireframe: false,
        wireframeLinewidth: 1,
        lights: false,
        clipping: false,
        fog: false,
        opacity: 1,
        transparent: false
    },

    RawShaderMaterial: {
        uniforms: {},
        vertexShader: "",
        fragmentShader: "",
        linewidth: 1,
        wireframe: false,
        wireframeLinewidth: 1,
        lights: false,
        clipping: false,
        fog: false,
        opacity: 1,
        transparent: false
    }
};
  const effects = {

      bloom: {
          name: 'Bloom',
          stringParams:`new THREE.Vector2(
                      renderer.domElement.width,
                      renderer.domElement.height
                  ),
                  1,
                  0.79,
                  0.85`,
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
          stringParams: `scene, camera, {
                  focus: 4,
                  aperture: 0.0001,
                  maxblur: 0.01
              }`,
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
          stringParams: `0.95`, 
          create: () => {
              return new AfterimagePass(0.95);
          }
      },

      chromaticAberration: {
          name: 'Chromatic Aberration',
          stringParams: `RGBShiftShader`,
          create: () => {
              const pass = new ShaderPass(RGBShiftShader);
              pass.uniforms.amount.value = 0.02;
              pass.uniforms.angle.value = 2;
              return pass;
          }
      },

      vignette: {
          name: 'Vignette',
          stringParams: ``,
          create: () => {
              const pass = new ShaderPass(VignetteShader);
              pass.uniforms.darkness.value = 1.9;
              pass.uniforms.offset.value = 2.0;
              return pass;
          }
      },

      filmGrain: {
          name: 'Film Grain',
          stringParams:`1.0,false`,
          create: () => {
              return new FilmPass(
                  1.0,
                  false
              );
          }
      },

      brightnessContrast: {
          name: 'Brightness / Contrast',
          stringParams: `BrightnessContrastShader`,
          create: () => {
              const pass = new ShaderPass(BrightnessContrastShader);
              pass.uniforms.brightness.value = 0.1;
              pass.uniforms.contrast.value = 0.8;
              return pass;
          }
      },

      hueSaturation: {
          name: 'Hue / Saturation',
          stringParams: `HueSaturationShader`,
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
          stringParams:`scene,
                  camera,
                  renderer.domElement.width,
                  renderer.domElement.height`,
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
          stringParams:``,
          create: () => {
              const pass = new GlitchPass();
              pass.goWild = false;
              return pass;
          }
      },

      fxaa: {
          name: 'FXAA',
          stringParams:``,
          create: () => {
              return new FXAAPass();
          }
      },

      smaa: {
          name: 'SMAA',
          stringParams:`renderer.domElement.width,
  renderer.domElement.height`,
          create: (renderer) => {
              return new SMAAPass(
                  renderer.domElement.width,
                  renderer.domElement.height
              );
          }
      },

      halftone: {
          name: 'Halftone',
          stringParams:`{
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
              }`,
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
          stringParams:`DotScreenShader`,
          create: () => {
              const pass = new ShaderPass(DotScreenShader);
              pass.uniforms.scale.value = 1;
              pass.uniforms.angle.value = 1.57;
              return pass;
          }
      },

      sepia: {
          name: 'Sepia',
          stringParams:`SepiaShader`,
          create: () => {
              const pass = new ShaderPass(SepiaShader);
              pass.uniforms.amount.value = 1;
              return pass;
          }
      },

      colorify: {
          name: 'Colorify',
          stringParams:`ColorifyShader`,
          create: () => {
              const pass = new ShaderPass(ColorifyShader);
              pass.uniforms.color.value.set(0xffffff);
              return pass;
          }
      },

      technicolor: {
          name: 'Technicolor',
          stringParams:`TechnicolorShader`,
          create: () => {
              return new ShaderPass(TechnicolorShader);
          }
      },

      bleachBypass: {
          name: 'Bleach Bypass',
          stringParams:`BleachBypassShader`,
          create: () => {
              return new ShaderPass(BleachBypassShader);
          }
      },

      kaleido: {
          name: 'Kaleidoscope',
          stringParams:`KaleidoShader`,
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
  function hideAllExtraOptions(){
    sceneSetting.background?.color && (sceneSetting.background.color.style.display = 'none')
    sceneSetting.background?.textureHtmlElement && (sceneSetting.background.textureHtmlElement.style.display = 'none')
    sceneSetting.background?.equirectHtmlElement && (sceneSetting.background.equirectHtmlElement.style.display = 'none')
  }
  let sceneSetting = {
    'background':{
      properties:{
        default: ()=>{
          hideAllExtraOptions()
          MainRealscene.background = SCENE_DEFAULT_BACKGROUND_COLOR
        },
        color: ()=>{
          hideAllExtraOptions()
          MainRealscene.background = new THREE.Color(sceneSetting.background.color.value)
          sceneSetting.background.color.style.display = 'block'
        },
        texture: ()=>{
          hideAllExtraOptions()
          MainRealscene.background = sceneSetting.background.texture ?? SCENE_DEFAULT_BACKGROUND_COLOR
          sceneSetting.background.textureHtmlElement.style.display = 'block'

        },
        equirect:()=>{
          hideAllExtraOptions()
          MainRealscene.background = sceneSetting.background.equirect ?? SCENE_DEFAULT_BACKGROUND_COLOR
          sceneSetting.background.equirectHtmlElement.style.display = 'block'

        }
      },
      initialize:(container)=>{
        // color
        let color = createColorInput('#000000')
        
        color.style.display ='none'
        color.addEventListener('input',(e)=>{
          MainRealscene.background = new THREE.Color(e.target.value)
        })
        sceneSetting.background.color = color
        container.appendChild(color)
        
        // texture 
        let square = document.createElement('div')
        square.style.display ='none'
        square.style.width = '30px'
        square.style.height = '20px'
        square.style.cursor = 'pointer'
        square.style.backgroundColor = 'white'
        square.addEventListener('click',(event)=>{
          Photo.click()
          functionAfterPhotoUpload = (url)=>{
            const loader = new THREE.TextureLoader();
            loader.load(url, (texture) => {
              sceneSetting.background.texture = texture
              MainRealscene.background = texture;
              URL.revokeObjectURL(url);
            });
          }

        })
        sceneSetting.background.textureHtmlElement = square
        container.appendChild(square)

        // equirect
        let square2 = document.createElement('div')
        square2.style.display ='none'
        square2.style.width = '30px'
        square2.style.height = '20px'
        square2.style.cursor = 'pointer'
        square2.style.backgroundColor = 'white'
        square2.addEventListener('click',(event)=>{
          Photo.click()
          functionAfterPhotoUpload = (url)=>{
            const loader = new THREE.TextureLoader();
            loader.load(url, (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              sceneSetting.background.equirect = texture
              MainRealscene.background = texture;
              URL.revokeObjectURL(url);
            });
          }

        })
        sceneSetting.background.equirectHtmlElement = square2
        container.appendChild(square2)
      }
    },
    'environment':{
      properties:{
        default: ()=>{
          sceneSetting.environment.equirectHtmlElement.style.display = 'none'
          MainRealscene.environment = null
        },
        equirect:()=>{
          MainRealscene.environment = sceneSetting.environment.equirect ?? null
          sceneSetting.environment.equirectHtmlElement.style.display = 'block'

        }
      },
      initialize:(container)=>{
        // equirect
        let square = document.createElement('div')
        square.style.display ='none'
        square.style.width = '30px'
        square.style.height = '20px'
        square.style.cursor = 'pointer'
        square.style.backgroundColor = 'white'
        square.addEventListener('click',(event)=>{
          Photo.click()
          functionAfterPhotoUpload = (url)=>{
            const loader = new THREE.TextureLoader();
            loader.load(url, (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              sceneSetting.environment.equirect = texture
              MainRealscene.environment = texture;
              URL.revokeObjectURL(url);
            });
          }

        })
        sceneSetting.environment.equirectHtmlElement = square
        container.appendChild(square)
        }
    },
    'fog':{
      properties:{
      none: ()=>{
        sceneSetting.fog.color.style.display = 'none'
        MainRealscene.fog = null

      },
      linear: ()=>{
        sceneSetting.fog.color.style.display = 'block'
        sceneSetting.fog.fogProp.style.display = 'inline-block'
        sceneSetting.fog.fogExpo.style.display = 'none'
        MainRealscene.fog = fog

      },
      exponential:()=>{
        sceneSetting.fog.color.style.display = 'block'
        sceneSetting.fog.fogProp.style.display = 'none'
        sceneSetting.fog.fogExpo.style.display = 'inline-block'
        MainRealscene.fog = fogExpo
      }
    },
    initialize:(container)=>{
        let row = createRow('fog')
        row.style.marginLeft = '160px'        
        let color = createColorInput('#' + fog.color.getHexString())
        color.style.padding = 0
        color.style.width = '32px'
        color.style.height = '22px'
        color.style.outline = '2px white'
        color.style.backgroundColor = 'transparent'
        let fogPropDiv = document.createElement('div')
        let fogNear = createNumberInput(fog.near)
        let fogFar = createNumberInput(fog.far)
        let fogExpoDensity = createNumberInput(fogExpo.density)
        fogNear.style.width = '40px'
        fogFar.style.width = '40px'
        fogExpoDensity.style.width = '40px'
        fogPropDiv.style.display = 'none'
        fogExpoDensity.style.display = 'none'

        function fogNearHandleMovement(event){
          let Xmulti = event.clientX - initialMouseXPosition 
          let Ymulti = initialMouseYPosition - event.clientY
          initialMouseXPosition = event.clientX 
          initialMouseYPosition = event.clientY
          numberInputValueControl(event,fogNear,0.020, 0.000, 999999999,'',Xmulti,Ymulti)
          MainRealscene.fog.near = +fogNear.value
        }
        function fogFarHandleMovement(event){
          let Xmulti = event.clientX - initialMouseXPosition 
          let Ymulti = initialMouseYPosition - event.clientY
          initialMouseXPosition = event.clientX 
          initialMouseYPosition = event.clientY
          numberInputValueControl(event,fogFar,0.020, 0.000, 999999999,'',Xmulti,Ymulti)
            MainRealscene.fog.far = +fogFar.value

        }
        function fogDensityHandleMovement(event){
          let Xmulti = event.clientX - initialMouseXPosition 
          let Ymulti = initialMouseYPosition - event.clientY
          initialMouseXPosition = event.clientX 
          initialMouseYPosition = event.clientY
          numberInputValueControl(event,fogExpoDensity,0.00020, 0.0000, 0.100,'',Xmulti,Ymulti)
            MainRealscene.fog.density = +fogExpoDensity.value
            
        }

        fogNear.addEventListener("mousedown",(e)=>{
          initialMouseXPosition = e.clientX
          initialMouseYPosition = e.clientY
          
          window.addEventListener("mousemove",fogNearHandleMovement)
          window.addEventListener('mouseup',(e)=>{
            window.removeEventListener('mousemove',fogNearHandleMovement)
        })
        })
        fogNear.addEventListener('input',(e)=>{          
          MainRealscene.fog.near = +(e.target.value)
        })

        fogFar.addEventListener("mousedown",(e)=>{
          initialMouseXPosition = e.clientX
          initialMouseYPosition = e.clientY
          
          window.addEventListener("mousemove",fogFarHandleMovement)
          window.addEventListener('mouseup',(e)=>{
            window.removeEventListener('mousemove',fogFarHandleMovement)
        })
        })
        fogFar.addEventListener('input',(e)=>{
          MainRealscene.fog.far = +(e.target.value)
        })

        fogExpoDensity.addEventListener("mousedown",(e)=>{
          initialMouseXPosition = e.clientX
          initialMouseYPosition = e.clientY
          
          window.addEventListener("mousemove",fogDensityHandleMovement)
          window.addEventListener('mouseup',(e)=>{
            window.removeEventListener('mousemove',fogDensityHandleMovement)
        })
        })
        fogExpoDensity.addEventListener('input',(e)=>{
            MainRealscene.fog.density = +(e.target.value)
        })



        row.style.display ='none'
        color.addEventListener('input',(e)=>{
          MainRealscene.fog.color = new THREE.Color(e.target.value)
        })
        sceneSetting.fog.color = row
        sceneSetting.fog.fogProp = fogPropDiv
        sceneSetting.fog.fogExpo = fogExpoDensity
        fogPropDiv.append(fogNear,fogFar)
        row.append(color,fogPropDiv,fogExpoDensity)
        
        sceneSettings.appendChild(row)
        
    }
    }
  }

  // html & Css & Animations

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
      settings.preview_3D && protoContainer.appendChild(proto);
      protoContainer.appendChild(label);
      objectContainer.appendChild(protoContainer);
      let color;
      protoContainer.addEventListener('pointerdown',(e)=>{
        document.body.style.cursor = "grabbing";
        protoContainer.style.cursor = 'grabbing'
        cursor.removeState("-fade-out");
        if(mode == "material"){
          hideTransformAndSelectionBox()
          window.addEventListener('mousemove',checkintersect);
      }
        function checkintersect(e){
          let x = (e.clientX / (window.innerWidth / 2) - 1 )
          let y = -(e.clientY / (window.innerHeight / 2) - 1 )
          if(isInsideCanvas(e.clientX)){
            panelEle.classList.remove('optrans')
            rayCast.setFromCamera(new THREE.Vector2(x,y),mainCamera)
            let filters = [];

            mainScene.traverseVisible((child)=>{
              if((child?.type == 'Mesh') && child?.material?.visible && (!child?.isLightHelper && !child.isTransformControlsRoot && !child?.type.includes("Grid") && !child?.type.includes("Axes"))){
                filters.push(child)
              }
            })
            let intersectObjs = rayCast.intersectObjects(filters,false)

            if(intersectObjs.length > 0 && intersectedObject != intersectObjs[0]?.object){
              if(intersectedObject){              
                intersectedObject.material.color.set(color)
                intersectedObject = null  
              }
              document.body.style.cursor = "cell";
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
             document.body.style.cursor !== "grabbing" && (document.body.style.cursor = "grabbing")

            }
          }else{ 
            panelEle.classList.add('optrans')
            if(intersectedObject){              
              intersectedObject.material.color.set(color)
              intersectedObject = null  
            }
          }
        }
        window.addEventListener('pointerup',(e)=>{
          document.body.style.cursor = "";
          protoContainer.style.cursor = ''

          if(mode == "material"){
            panelEle.classList.add('optrans')
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
              target.userData.isTarget = true
              target.position.set(0,0,0)
              target.name = light.type + "Target"
              light.target = target
              mainScene.add(target);
            }
            if(Object.keys(THREE).includes(objects[i] + "Helper")){
              const lighthelper = new THREE[objects[i] + "Helper"](light,...lights[objects[i]]?.mainHarg);
              lighthelper.userData.isLightHelper = true;
              lighthelper.visible = settings.showHelpers;
              mainScene.add(lighthelper);
              lighthelper.add(picker)
              light.userData.object = lighthelper.uuid
              target.userData.object = lighthelper.uuid
              lighthelper.update()
            }

            picker.name = 'picker';
            picker.userData.object = obj.uuid
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
              settings.openPanelOnChange && mainInit() 
            }
            return
          }  
          if(mode == 'specialEffects'){
            mainComposer = new EffectComposer(mainRenderer)
            let renderPass = new RenderPass(mainScene,mainCamera)
            mainComposer.addPass( renderPass )
            
            let specialEffect = effects[objects[i]].create(mainRenderer,mainScene,mainCamera)
            effectsNames.push(objects[i])
            mainComposer.addPass( specialEffect )
            let outputPass = new OutputPass()
            mainComposer.addPass( outputPass )
            saveSceneState()
            return
          }
            mainScene.add(obj)
            settings.openPanelOnChange && mainInit()
          }
          
        },{once:true})
      })
    }
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
          let AmbientLight = new THREE.DirectionalLight(0x404040,10)
          scene.add(AmbientLight)
          mesh = statue.clone()
          mesh.traverse((child) => {
          if (child.isMesh) {
            child.material = material
          }
          if(material?.isPointsMaterial){
            const pointsGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(-40, 1, 0),
              new THREE.Vector3(0, 4, 0),
              new THREE.Vector3(40, 1, 0),
            ]);
            mesh = new THREE.Points(
              pointsGeometry,
              material
            );
          }
          if(material?.isLineDashedMaterial || material?.isLineBasicMaterial ){
            camera.position.set(0, 6,0);
            camera.lookAt(new THREE.Vector3(0,0,0))
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(-3, 0, 0),
              new THREE.Vector3(3, 0, 0),
            ]);
            mesh = new THREE.Line(
              lineGeometry,
              material
            );
            mesh.computeLineDistances();
          }
          if(material?.isSpriteMaterial){
            const pivot = new THREE.Object3D();
            let sprite = new THREE.Sprite(
              material
            );
            sprite.position.set(100, -1, 0);
            sprite.scale.set(100, 100, 1)
            pivot.add(sprite);
            mesh = pivot
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
        if(settings.preview_3D){
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
  function createSceneSettings(){
    Object.keys(sceneSetting).forEach((key)=>{
      let row = createRow(key)
      let keyElement = createKeyElement(key,'tabs title')
      let containerDiv = document.createElement('div')
      containerDiv.style.width = '150px'
      containerDiv.style.display = 'flex'
      containerDiv.style.gap = '8px'

      let select = createSettingSelect()
      Object.keys(sceneSetting[key].properties).forEach((optionName)=>{
        let option = document.createElement('option')
        option.innerText = optionName
        option.value = optionName
        select.append(option)
      })

      select.addEventListener('change',(event)=>{
        sceneSetting[key].properties[event.target.value]()
      })
      containerDiv.appendChild(select)
      row.append(keyElement,containerDiv)
      sceneSettings.append(row)
      sceneSetting[key].initialize(containerDiv)
      
    })

  }
  function createSettingSelect(){
    let select = document.createElement('select')
    select.className = 'settingSelect'
    return select
  }
  createSceneSettings()
  // Init 

  function mainInit(v){
    if(chosenLayer){
      if(!mainOption.classList.contains('opop') && settings.openPanelOnChange)  
  {
        mainOption.click()
      }    
      if(v== 'main' && !mainOption.classList.contains('opop')){
        document.body.querySelectorAll('.opop').forEach((c)=>{c.classList.remove('opop')})
        toggleFirstAnimation(mainOption.firstElementChild)
        objectContainer.classList.remove('grid-layout')
        mainOption.classList.add('opop')
      }
      SelectLayerVisual()
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
        
      }
      if(chosenLayer?.material) {
        let label = document.createElement('div')
        label.classList.add('vertwr')
        label.innerHTML ='Material'
        label.addEventListener("click",selectLabel)
        console.log(chosenLayer);
        createMaterialPanel(chosenLayer,panelContainer)
        meshComponentContainer.appendChild(label)
      }
      if((rawObject?.effectsNames?.length ?? 0 > 0) || mainComposer){
        let label = document.createElement('div')
        label.classList.add('vertwr')
        label.innerHTML ='Effects'
        label.addEventListener("click",selectLabel)
        meshComponentContainer.appendChild(label)
        let effectStack = document.createElement('div')
        effectStack.id = 'effectsPanel'
        if((rawObject?.effectsNames?.length ?? 0 > 0)){
          rawObject.effectsNames.forEach((effectName)=>{
            let effect = document.createElement('div')
            let effectSpan = document.createElement('span')
            effect.className = 'effect'
            effectSpan.innerHTML = effectName
            effectSpan.dataset.effect = effectName
            effect.innerHTML = `<i class="far fa-arrows-alt handle"></i>` + effectSpan.outerHTML
            
            effectStack.append(effect)
          })
        }else{
          effectsNames.forEach((effectName)=>{
            let effect = document.createElement('div')
            let effectSpan = document.createElement('span')
            effect.className = 'effect'
            effectSpan.innerHTML = effectName
            effectSpan.dataset.effect = effectName
            effect.innerHTML = `<i class="far fa-arrows-alt handle"></i>` + effectSpan.outerHTML
            
            effectStack.append(effect)
          })
        }

        new Sortable(effectStack, {
          animation: 150,
          handle: '.handle',
          onEnd: () => {
              updateComposerOrder();
          }
});
      function updateComposerOrder() {
    const order = [...effectStack.children]
        .map(el => el.children[1].dataset.effect);

    const renderPass = new RenderPass(mainScene, mainCamera);

    mainComposer.passes = [renderPass];

    for (const effect of order) {
        const effectPass = effects[effect].create(
            mainRenderer,
            mainScene,
            mainCamera
        );
        mainComposer.passes.push(effectPass);
    }
}
      panelContainer.appendChild(effectStack)
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
    if(settings.preview_3D){
      optionDemo("geometry")  
    }
  }
  function materialInit(){
    appendOptionObjects(Object.keys(materials),"material")
    if(settings.preview_3D){
      optionDemo("material")
    }
  }
  function lightInit(){
    appendOptionObjects(Object.keys(lights),"light")
    if(settings.preview_3D){
      optionDemo("light")
    }
  }
  function specialEffectsInit(){
    appendOptionObjects(Object.keys(effects),"specialEffects")
    if(settings.preview_3D){
      optionDemo("specialEffects")  
    }
  }
  function customPresetsInit(){
  }
  function settingInit(){
    let jsonDiv = document.createElement('div')

    jsonDiv.style.whiteSpace = 'pre';
    jsonDiv.style.textWrap = 'wrap';
    
    
    jsonDiv.append(`{\n`);
    Object.keys(settings).forEach((key)=>{
      let text = createCustomText(`   ${key}: `)
      let select = createBooleanSelect()
      select.style.display = 'inline';
      select.value = settings[key]

      if(key == 'defaultGeomtriesMaterial'){
        select = document.createElement('select')
        let firstOption = document.createElement('option')
        firstOption.style.fontSize = '13px'
        firstOption.innerHTML = `THREE.${settings.defaultGeomtriesMaterial}()`
        select.append(firstOption)
        Object.keys(materials).forEach((mat)=>{
          if(mat != settings.defaultGeomtriesMaterial){
            let object = document.createElement('option')
            object.innerHTML = `THREE.${mat}()`;
            select.append(object);
          }
        })
        select.addEventListener('change',(event)=>{
          settings.defaultGeomtriesMaterial = event.target.value.slice(event.target.value.indexOf('.') + 1,event.target.value.indexOf('('))
          saveSettingState()
        })
      }
      else if(key == 'showHelpers'){
        select.addEventListener('change',(event)=>{
          settings.showHelpers = event.target.value === "true"
          mainScene.traverse((object)=>{
            if(object?.userData.isLightHelper){
              object.visible = event.target.value === "true"
            }
          })
          saveSettingState()
        })
      }
      else if(key == 'showTransformControls'){
        select.addEventListener('change',(event)=>{
          settings.showTransformControls = event.target.value === "true"
          saveSettingState()
          
          if(event.target.value === "true"){
            showTransform();
          }
          else{    
            TC.enabled = false
            TC.getHelper().visible = false 
  }
        })
      }
      else if(key == 'wireframe'){
        select.addEventListener('change',(event)=>{
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

          saveSettingState()
        })
      }   
      else {
        select.addEventListener('change',(event)=>{
          settings[key] = event.target.value === "true"
          saveSettingState()
        })
      }
      jsonDiv.append(text);
      jsonDiv.append(select);
      jsonDiv.append(`\n`);
    })

    jsonDiv.append(`}`);
    jsonDiv.className = 'jsonDiv'
    objectContainer.append(jsonDiv)
  }
  function uploadInit(){
    upload.click()
    upload.addEventListener("change",uploadListener)
  }

  // Create Functions Section
  function createCustomButtonElement(text) {
    let button = document.createElement('button')
    button.className = "Row"
    button.innerText = text
    return button
  }
  function createInfoDisplaySpan(thingValue,Vvalue){
    let div = document.createElement('div')
    div.className = "DisplayDiv"
    let thing = document.createElement('div')
    thing.style.width = '60px'
    thing.innerText = thingValue
    let value = document.createElement('div')
    value.innerText = Vvalue
    div.append(thing,value)
    return div
  }
  function createKeyElement(key,className){
    let keyElement = document.createElement('div')
    if(className)keyElement.className = 'Text ' + className
    else{keyElement.className = 'Text'}
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
    // name & uuid 
    let row = createRow('name')
    let keyElement = createKeyElement('name')
    let TextInput = createTextInput()
    let row1 = createRow('uuid')
    let keyElement1 = createKeyElement('uuid')
    let TextInput1 = createTextInput()
    TextInput1.disabled = true
    TextInput1.value = object.uuid
    row1.append(keyElement1,TextInput1)
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
    // type 
    if(object?.type){
      let typeRow = createRow('type')
      let tkeyElement = createKeyElement('type')
      let tTextInput = createTextInput()
      tTextInput.value = object.type
      tTextInput.disabled = true
      typeRow.append(tkeyElement,tTextInput)
      panel.appendChild(typeRow)
    }


    panel.appendChild(row1)
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
    let divForButtons = document.createElement('div')
    let computeTangents = createCustomButtonElement('compute Tangents')
    let computeVertexNormals = createCustomButtonElement('compute Vertex Normals')
    let center = createCustomButtonElement('center')
    let divForToNonIndex = document.createElement('div')
    let toNonIndex;
    let showVertexNormals = createCustomButtonElement('show Vertex Normals')
    let Row = createRow('attribute')
    let attributes = createKeyElement('attributes (points)')
    let divForAttributes = document.createElement('div')
    let spanForDisplay = createInfoDisplaySpan('index',object.geometry?.index?.count ?? 'Non Indexed')
    let spanForDisplay1 = createInfoDisplaySpan('position',object.geometry.attributes.position.count)
    let spanForDisplay2 = createInfoDisplaySpan('normal',object.geometry.attributes.normal.count)
    let spanForDisplay3 = createInfoDisplaySpan('uv',object.geometry?.attributes?.uv?.count ?? 0)
    
    divForAttributes.style.display = 'flex'
    divForAttributes.style.flexDirection = 'column'
    divForAttributes.style.gap = '6px'
    divForButtons.style.marginLeft = '140px'
    divForToNonIndex.style.marginLeft = '140px'
    let firstTime = true;
    let toggle = true;
    divForAttributes.append(spanForDisplay,spanForDisplay1,spanForDisplay2,spanForDisplay3)
    computeTangents.addEventListener('click',(e)=>{      
      object.geometry.computeTangents()
    })
    computeVertexNormals.addEventListener('click',(e)=>{
      object.geometry.computeVertexNormals()
    })
    center.addEventListener('click',(e)=>{
      object.geometry.center()
    })
  
    showVertexNormals.addEventListener('click',(e)=>{
      if(firstTime){
        firstTime = false
        vertexNormalsHelper = new VertexNormalsHelper(object, 1);
        vertexNormalsHelper.userData.isVertexNormalsHelper = true
        vertexNormalsHelper.userData.skip = true
        mainScene.add(vertexNormalsHelper)
        object.userData.vertexNormalsHelper = vertexNormalsHelper.uuid
      }
      vertexNormalsHelper.visible = toggle
      toggle = !toggle
    })
    panel.id = 'geometryPanel'
    // type
    let row = createRow('name')
    let keyElement = createKeyElement('type')
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
          numberInputValueControl(event,numberInput,key.includes('Segments') ? 1 :0.020,key.includes('Segments') ? 1 :0.0,1000,key,Xmulti,Ymulti,key.includes('Segments') ? 0 : undefined)
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
    if(object.geometry?.index){
      toNonIndex = createCustomButtonElement('to_Non_Indexed')
      toNonIndex.addEventListener('click',(e)=>{
        object.geometry = object.geometry.toNonIndexed()
        Row.remove()
        divForToNonIndex.remove()
        let spanForDisplayVertex = createInfoDisplaySpan('vertex',object.geometry.attributes.position.count)
        divForAttributes.innerHTML = ''
        divForAttributes.append(spanForDisplayVertex)
        Row.append(attributes,divForAttributes)
        panel.appendChild(Row)
    })
    }
    divForButtons.append(computeTangents,computeVertexNormals,center)
    if(object.geometry?.index)divForToNonIndex.append(toNonIndex,showVertexNormals)
    else{divForToNonIndex.append(showVertexNormals)}
    Row.append(attributes,divForAttributes)
    panel.appendChild(divForButtons)
    panel.appendChild(Row)
    panel.appendChild(divForToNonIndex)
    panelContainer.appendChild(panel)
  }

  function createMaterialPanel(object,panelContainer){
    let panel = document.createElement('div')
    panel.id = 'materialPanel'
    let material;
    let indexOfMaterial;
    if(Array.isArray(object.material)){
      if(object.material.length > 1){        
        let row = createRow('Slot')
        let keyElement = createKeyElement('Slot')
        let slotSelect = createSettingSelect()
        slotSelect.style.textTransform = 'none'
        slotSelect.innerText = 1 + '. Material'
        slotSelect.value = 0
        indexOfMaterial = 0;
        material = object.material[0]
        object.material.forEach((material,i)=>{
        let option = document.createElement('option')
        option.innerText = (i + 1) + '. Material'
        option.value = (i)

        slotSelect.append(option);
    })
        slotSelect.addEventListener('change',(event)=>{
          material = object.material[+slotSelect.value]
          indexOfMaterial = slotSelect.value;
          typeSelect.value = arrayOfMaterialNames.indexOf(material.type)
          document.querySelectorAll('.removeable').forEach((child)=>child.remove())
          appendMaterialParameters(object.material[indexOfMaterial],panel,true)

        })
          row.append(keyElement,slotSelect)
          panel.append(row)
      }
    }else{
        material = object.material
    }

    let row = createRow('materialType')
    let keyElement = createKeyElement('type')
    let typeSelect = createSettingSelect()

    typeSelect.style.textTransform = 'none'
    arrayOfMaterialNames.forEach((materialName,i)=>{
      let option = document.createElement('option')
      option.innerText = materialName
      const materialType = materials[materialName];
      option.value = i

      const objectType = {
        Sprite: "Sprite",
        Line: "Line",
        LineSegments: "Line",
        Points: "Points"
      }[object.type];

      if (!materialType?.Line && !materialType?.Sprite && !materialType?.Points) {
        typeSelect.append(option);
      }
      else if (materialType?.[objectType]) {
        typeSelect.append(option);
      }
      
      if(materialName == material.type){
        typeSelect.value = i
     }
    })
    typeSelect.addEventListener('change',(event)=>{    
      if(indexOfMaterial)object.material[indexOfMaterial] = new THREE[arrayOfMaterialNames[typeSelect.value]]
      else{object.material = new THREE[arrayOfMaterialNames[typeSelect.value]]}
      document.querySelectorAll('.removeable').forEach((child)=>child.remove())
      appendMaterialParameters(indexOfMaterial ? object.material[indexOfMaterial] : object.material,panel,true)
    })

    
    row.append(keyElement,typeSelect)
    panel.append(row)
    appendMaterialParameters(material,panel,false)
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


  // Helping functions
  function appendMaterialParameters(material,container,initialize){
    Object.entries(materialProperties[material.type]).forEach(property => {
      let propertyName = property[0]
      let objectMaterial = material
      let propValue = initialize ? property[1].value : objectMaterial[propertyName]
      let row = createRow(propertyName)
      row.classList.add('removeable')
      let keyElement = createKeyElement(propertyName)
      row.appendChild(keyElement)
      if(property[1].type === "color"){
        if(!initialize)propValue = '#' + propValue.getHexString()
        let color = createColorInput(propValue)
        color.addEventListener('input',(e)=>{
          objectMaterial[propertyName].set(e.target.value)
        })
         row.appendChild(color)
      }
      if(property[1].type === "number"){
        let number = createNumberInput(propValue)
        number.addEventListener('change',(e)=>{
          objectMaterial[propertyName] = +number.value
        })
        function valueHandler(event) {
          let Xmulti = event.clientX - initialMouseXPosition 
          let Ymulti = initialMouseYPosition - event.clientY
          initialMouseXPosition = event.clientX 
          initialMouseYPosition = event.clientY
          numberInputValueControl(event,number,0.0020, property[1].min , property[1].max,'',Xmulti,Ymulti)     
          objectMaterial[propertyName] = +number.value   
        }
        number.addEventListener('mousedown',(event)=>{
          initialMouseXPosition = event.clientX 
          initialMouseYPosition = event.clientY
          window.addEventListener("mousemove",valueHandler)
          window.addEventListener('mouseup',(e)=>{
            window.removeEventListener('mousemove',valueHandler)
        })
        })
        number.value = +objectMaterial[propertyName]

         row.appendChild(number)

      }
      if(property[1].type === "boolean"){
        let boolean = createCheckBoxInput(objectMaterial,property[0])
        boolean.addEventListener('input',(e)=>{
          objectMaterial[propertyName] = e.target.checked
          objectMaterial.needsUpdate = true;              

        })
        
        boolean.checked =  objectMaterial[propertyName] 
        row.appendChild(boolean)
      }
      if(property[1].type === "select"){
        let select = createSettingSelect()

        select.style.textTransform = 'none'
        Object.keys(property[1].options).forEach((optionName)=>{
          let option = document.createElement('option')
          option.innerText = optionName
          select.append(option)
        })

        select.addEventListener('change',(e)=>{
          objectMaterial[propertyName] = property[1].options[e.target.value]
        })

        select.value = Object.keys(property[1].options).find(key => property[1].options[key] === propValue);
        row.appendChild(select)
      
      }
      if(property[1].type === "texture"){
        let square = document.createElement('div')
        square.style.width = '30px'
        square.style.height = '20px'
        square.style.cursor = 'pointer'
        square.style.backgroundColor = 'white'
        square.addEventListener('click',(event)=>{
          Photo.click()
          functionAfterPhotoUpload = (url)=>{
            const loader = new THREE.TextureLoader();
            loader.load(url, (texture) => {
             objectMaterial[propertyName] = texture;
             objectMaterial.needsUpdate = true;              
              URL.revokeObjectURL(url);
            });
          }

        })
        row.appendChild(square)

      }
      if(property[1].type === "vector2"){

      }
      if(property[1].type === "vector3"){

      }
      if(property[1].type === "vector4"){

      }
      if(property[1].type === "string"){
        let text = document.createElement('textarea')
        text.addEventListener('keydown',(e)=>{
          e.stopPropagation()
        })
        text.innerText = objectMaterial[propertyName]
        row.appendChild(text)
      }
      container.append(row)
    });
  }
  function saveSettingState(){
    window.localStorage.setItem('setting',JSON.stringify(settings))
    saveSceneState()
  }
  function saveSceneState(){    
    let pasr = mainScene.toJSON()
    pasr.cameraPosition = mainCamera.position.toArray(); 
    if(chosenLayer)pasr.chosenLayer = chosenLayer.uuid
    else{
      pasr.chosenLayer = undefined
    }
    if(effectsNames?.length ?? 0 > 0)pasr.effectsNames = effectsNames;
    const tx = db.transaction("states", "readwrite");
    const store = tx.objectStore("states");     
    const putRequest = store.put(pasr,0);
    window.scene = mainScene
  }
  function SelectLayerVisual(){
    let htmlLayer = layerContainer.querySelector(`[data-uuid="${chosenLayer.uuid}"]`)
    htmlLayer && handleActivation(htmlLayer)
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
    TC.enabled = settings.showTransformControls;
    TC.getHelper().visible = settings.showTransformControls;
  }

  function showBoxHelper(){
    
    selectionBox.visible = true;
  }

  function selectLabel(e){
    if(!e.target.classList.contains('selected')){
      document.querySelectorAll('.selected').forEach((e)=>e.classList.remove('selected'))
      document.querySelectorAll('.panelOpen').forEach((e)=>e.classList.remove('panelOpen'))
      document.querySelector(`#${e.target.innerHTML.toLowerCase() + 'Panel'}`).classList.add('panelOpen')
      e.target.classList.add('selected')
    }

  }

  function formatNumber(value, decimals = 3) {
  const rounded = Number(value.toFixed(decimals));
  return rounded === 0 ? "0" : rounded.toFixed(decimals);
}

  function numberInputValueControl(event,element,offset,min,max,key,Xmulti,Ymulti,fixNum){ 
    
    if(key != "rotation"){      
      let newValue = formatNumber(+element.value + offset * (Xmulti + Ymulti),fixNum !== undefined ? fixNum : 3) 
      if(Number.isFinite(min) && Number.isFinite(max) ){
        if(min <= newValue && max >= newValue){
          element.value = newValue
        }else if(min >= newValue){          
          element.value = formatNumber(min,fixNum !== undefined ? fixNum : 3)
        }else{
          element.value = formatNumber(max,fixNum !== undefined ? fixNum : 3)
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
    
    if((object?.isLight || object?.userData?.userData?.isTarget) && object?.userData.object){    
      mainScene.getObjectByProperty('uuid', object.userData.object).update()
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


  let names = {}
  function handleExport(child) {
    if(child.constructor.name && Object.hasOwn(THREE,child.constructor.name)){
        // if(child?.userData?.isFileImport && child.isGroup){
        //   handleImportedSceneExport(child)
        //   return null
        // }
        if(child.isGroup){
          let name = generateName('group')
          codeSection += `let ${name} = new THREE.group()\n`
          changeIfNotDefaultTransformValues(child)
          child.children.forEach((groupChild)=>handleExport(groupChild,name))
          sceneAddSection += `scene.add(${name})\n`
          return
        }

        // console.log(child);

        
        if(child?.isMesh){
          handleMeshExport(child)
      }
  }

  function checkWhichMaterialValuesChanged(material) {
    let finalParamObject = '{\n';
    Object.entries(materialDefaultProperties[material.type]).forEach(element => {
      let propertyName = element[0]
      let propertyValues = element[1]
      let MatValue = material[propertyName];
      let valueText = null;
      
      if(MatValue?.isVector2 ||MatValue?.isVector3 || MatValue?.isEuler){
        if(MatValue?.isEuler){
          MatValue = MatValue.toArray().slice(0,3)
        }else{ 
          MatValue = MatValue.toArray()
        }
      }

      if(MatValue?.isColor){
        valueText = `0x${MatValue.getHexString()}`
        MatValue = MatValue.getHex()
      }

      if(Array.isArray(MatValue) && Array.isArray(propertyValues)){
        if(!checkIfArraysEqual(MatValue,propertyValues)){
          finalParamObject += `${propertyName}: ${valueText ?? MatValue}\n`
        }
      }
      else if(MatValue !== propertyValues){
        finalParamObject += `${propertyName}: ${valueText ?? MatValue}\n`
      }
    });
    finalParamObject += '}'
    return finalParamObject
  }
  function checkIfArraysEqual(arr,arr1){
    return arr.length === arr1.length && arr.every((value,i)=>value == arr1[i])
  }
  function handleImportedSceneExport(child){
    let fileNameWithoutExtention = child.userData.fileName
    importSection += `import { ${loaderMap[child.userData.fileExtention]} } from 'three/addons/loaders/${loaderMap[child.userData.fileExtention]}.js';\n`
    codeSection += `let loader = THREE.${loaderMap[child.userData.fileExtention]}()
let ${fileNameWithoutExtention} = await loader.loadAsync("./assets/${child.userData.name}")\n`
    changeIfNotDefaultTransformValues(child,fileNameWithoutExtention)
sceneAddSection += `scene.add(${fileNameWithoutExtention}.scene)\n` 
  }

  function handleMeshExport(child,group){
    let meshVarName = generateName((child?.userData?.name ? child.userData.name : child.name ? child.name : child.type).replaceAll('.','_'));
    let geoVarName;
    let matVarName;
    
    if(child?.geometry){
      geoVarName = generateName((child.geometry?.userData?.name ? child.geometry.userData.name : child.geometry.name ? child.geometry.name : child.geometry.type).replaceAll('.','_'))
// console.log(child.geometry);

      if(child.geometry.type == 'BufferGeometry'){
        codeSection += `let ${geoVarName} = new THREE.${child.geometry.constructor.name}()\n`
        codeSection += `const vertices = new Float32Array( [${[...child.geometry.attributes.position.array]}] );\n`
        codeSection += `geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, ${child.geometry.attributes.position.itemSize} ) );;\n`
        
      }else{
        let geoParams = Object.values(child.geometry.parameters)
        geoVarName = generateName((child.geometry?.userData?.name ? child.geometry.userData.name : child.geometry.name ? child.geometry.name : child.geometry.type).replaceAll('.','_'))
        codeSection += `let ${geoVarName} = new THREE.${child.geometry.constructor.name}(${geoParams ? geoParams.join(',') : ''})\n`
      }
    }
    if(child?.material){
      let matParam = checkWhichMaterialValuesChanged(child.material)
      matVarName = generateName((child.material?.userData?.name ? child.material.userData.name : child.material.name ? child.material.name : child.material.type).replaceAll('.','_'))
      codeSection += `let ${matVarName} = new THREE.${child.material.type}(${matParam ? matParam : ''})\n`
    }
    codeSection += `let ${meshVarName} = new THREE.${child.constructor.name}(${child?.geometry ? geoVarName : ''},${child?.material ? matVarName : ''})\n`
    changeIfNotDefaultTransformValues(child,meshVarName)
    codeSection += '\n'
    sceneAddSection += `${group ?? 'scene'}.add(${meshVarName})\n` 
  }
  }
  function handleAnimate() {
    animateSection = `function animate(){
  requestAnimationFrame(animate)
  controls.update();
  ${mainComposer ? 'composer.render()' : 'renderer.render(scene,camera)'}
}
animate()`
  }
  function generateName(name) {
    if(Object.hasOwn(names,name)){
      names[name] += 1
      return name + (+names[name] - 1)
    }else{
      names[name] = 1
      return name
    }
    
  }
  function changeIfNotDefaultTransformValues(child,varName) {
    if(checkIfDefaultPosition(child)){
      codeSection += `${varName}.position.set(${child.position.x} ,${child.position.y},${child.position.z})\n`
    }
    if(checkIfDefaultRotation(child)){
      codeSection += `${varName}.rotation.set(${child.rotation.x} ,${child.rotation.y},${child.rotation.z})\n`
    }
    if(checkIfDefaultScale(child)){
      codeSection += `${varName}.scale.set(${child.scale.x} ,${child.scale.y},${child.scale.z})\n`
    }

  }
  function checkIfDefaultPosition(child) {
    return child.position.x !== 0 || child.position.y !== 0  || child.position.z !== 0 
  }
  function checkIfDefaultRotation(child) {
    return child.rotation.x !== 0 || child.rotation.y !== 0  || child.rotation.z !== 0 
  }
  function checkIfDefaultScale(child) {
    return child.scale.x !== 1 || child.scale.y !== 1  || child.scale.z !== 1
  }
  function layerFiltering(e){        
      if(!e?.isCamera && !e?.userData.isLightHelper && !e?.controls && !e?.type.includes("Grid") && !e?.type.includes("Axes") && e?.name !== 'TransformControlsHelper'&& !e?.isTransformControlsRoot && !e?.userData.skip ){ 
        
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
            e.userData.name = fileName ?? e.userData.name 
            appendLayer(e ,layerContainer,'type ',false)

            e.children.forEach((f)=>{              
              layerFiltering(f)
            })
            return null;
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
      mainInit('main')
    })
    parent.appendChild(layer)
  }

  function updateInfo(){
    let arr = ["x",'y','z']
      for (let i = 0; i < infoP.children.length; i++) {
        infoP.children.item(i).innerHTML = `${arr[i]}:  ${(+chosenLayer?.position[arr[i]]).toFixed(5) || 0}`;
      }
  }

  function uploadListener(e){ 
    for (let i = 0; i < e.target.files.length; i++) {
      const element = e.target.files[i];
      fileName = element.name
      let blobUrl = URL.createObjectURL(element)
      let extention = (element.name).split('.').pop().toLowerCase()
      let fileNameWithoutExtention = (element.name).split('.').shift().toLowerCase()
      switch (extention) {
        case 'glb' :
        case 'gltf' :
          loader.load(blobUrl,(e)=>{            
            e.scene.userData.fileExtention = extention
            e.scene.userData.isFileImport = true
            e.scene.userData.fileName = fileNameWithoutExtention.replaceAll('.','_')
            chosenLayer = e.scene
            mainScene.add(e.scene)
          })
          break;
        case 'fbx':
          fbxLoader.load(blobUrl,(e)=>{
            e.userData.fileExtention = extention
            e.userData.isFileImport = true
            e.userData.fileName = fileNameWithoutExtention.replaceAll('.','_')
            chosenLayer = e
            mainScene.add(e)
          })
          break; 
        case 'svg':
          break; 
        case 'obj':
          objLoader.load(blobUrl,(e)=>{
            e.userData.fileExtention = extention
            e.userData.isFileImport = true
            e.userData.fileName = fileNameWithoutExtention.replaceAll('.','_')
            chosenLayer = e            
            mainScene.add(e)
          })
          break; 
        case 'stl' :
          stloader.load( blobUrl,(e)=>{
            let stlMesh;
            if ( e.hasColors ) {
              material = new THREE.MeshPhongMaterial( { opacity: e.alpha, vertexColors: true } );
              stlMesh = new THREE.Mesh( e, material );
            }else{
              stlMesh = new THREE.Mesh( e ) ;
            }
            stlMesh.userData.fileExtention = extention
            stlMesh.userData.isFileImport = true
            stlMesh.userData.fileName = fileNameWithoutExtention.replaceAll('.','_')
            chosenLayer = stlMesh

            mainScene.add(stlMesh);
          } )

          break; 
        case 'ply':
          plyLoader.load( blobUrl,(e)=>{            
            let plyMesh = new THREE.Mesh( e )
            plyMesh.userData.fileExtention = extention
            plyMesh.userData.isFileImport = true
            plyMesh.userData.fileName = fileNameWithoutExtention.replaceAll('.','_')
            chosenLayer = plyMesh
            
            mainScene.add(plyMesh);
          })
          break; 
        default:
          break;
      }
    }
    e.target.value = ''
  }



  initializeCanvas(mainscene)
  async function initializeCanvas(mainscene){
    mainScene = mainscene;
    let light = new THREE.AmbientLight("white",10)
    mainRenderer = new THREE.WebGLRenderer({antialias:true})

    mainRenderer.shadowMap.enabled = true;

    mainRenderer.setSize(window.innerWidth,window.innerHeight)
    mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    appElement.appendChild(mainRenderer.domElement)


    mainCamera = new THREE.PerspectiveCamera(...mainCameraParam);
    if(rawObject){    
      if(rawObject?.effectsNames?.length ?? 0 > 0){
          mainComposer = new EffectComposer(mainRenderer)
          let renderPass = new RenderPass(mainScene,mainCamera)
          mainComposer.addPass( renderPass )    
          // handle effects parameters here                     
          effectsNames = rawObject.effectsNames
          rawObject.effectsNames.forEach((effect)=>{
            let specialEffect = effects[effect].create(mainRenderer,mainScene,mainCamera)
            mainComposer.addPass( specialEffect )
          })
          
          let outputPass = new OutputPass()
          mainComposer.addPass( outputPass )
      }
      [...mainScene.children].forEach((child)=>{        
        if(child?.isTransformControls || child.name == "TransformControlsHelper" || child?.userData?.isVertexNormalsHelper){
          child.removeFromParent()
        }
      })
      mainCamera.position.set(...rawObject.cameraPosition);
    }else{
      mainCamera.position.set(3,5,20);
    }
    mainCamera.name = 'Camera'

    controls = new OrbitControls( mainCamera, mainRenderer.domElement );
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
      Grid.checked = true
      GridHelper.visible = true
    }
    MainRealscene = new THREE.Scene()
    mainScene.name = 'Scene'
    MainRealscene.background = SCENE_DEFAULT_BACKGROUND_COLOR
    MainRealscene.add(mainCamera)
    MainRealscene.add(AxesHelper)
    MainRealscene.add(GridHelper)
    MainRealscene.add(mainScene)

    function animate(){
      animationId = requestAnimationFrame(animate)
      if (controls) {
          controls.update();
      }
      if(mainComposer){
        mainComposer.render()
      }else{
        mainRenderer.render(MainRealscene,mainCamera)
      }
    }
    animate()

    selectionBox = new THREE.BoxHelper();
    selectionBox.visible = false;
    TC = new TransformControls(mainCamera,mainRenderer.domElement)
    TC.setMode('translate')
    TC.enabled = true;    
    if(rawObject?.chosenLayer){
      chosenLayer = mainScene.getObjectByProperty('uuid', rawObject.chosenLayer)
      handleTranformControlsAndBoxHelper(chosenLayer)
    }
    TC.isTransformControls = true
    const helper = TC.getHelper();
    helper.name = "TransformControlsHelper";
    mainScene.add(helper);
    MainRealscene.add(selectionBox);
    TC.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;      
      isDraggingTransformControls = event.value;
    })
    TC.addEventListener('mouseDown', () => {
    isUsingTransformControls = true;
    });

    TC.addEventListener('mouseUp', () => {
        isUsingTransformControls = false;
    });
    let positionMapArr = ['x','y','z']
    TC.addEventListener('change',(e)=>{
      if(chosenLayer?.userData?.vertexNormalsHelper){
        let ob = mainScene.getObjectByProperty('uuid', chosenLayer.userData.vertexNormalsHelper);
        if(ob?.update)ob.update()
      }
      if((chosenLayer?.isLight || chosenLayer?.userData?.isTarget) && chosenLayer?.userData.object){    
        let ob = mainScene.getObjectByProperty('uuid', chosenLayer.userData.object);
        if(ob?.update)ob.update()
      }
    if(chosenLayer){
      if(TC.mode == "translate"){
          updateInfo()    
          document.querySelectorAll('.position input').forEach((e,i)=>{
            let positionValue = +chosenLayer.position[positionMapArr[i]]
            if(!Number.isNaN(positionValue)){
              e.value = (positionValue).toFixed(3)
            }
          })
        }
      if(TC.mode == "rotate"){document.querySelectorAll('.rotation input').forEach((e,i)=>{
        let rotationValue = +chosenLayer.rotation[positionMapArr[i]]
        if(!Number.isNaN(rotationValue)){
          e.value = (+(rotationValue).toFixed(3) * 180 / Math.PI).toFixed(3)
        }
      })}
      if(TC.mode == "scale"){
        document.querySelectorAll('.scale input').forEach((e,i)=>{
          let scaleValue = +chosenLayer.scale[positionMapArr[i]]
          if(!Number.isNaN(scaleValue)){
          e.value = (scaleValue).toFixed(3)
        }})
        }
      }
      selectionBox.update()

    })

  


    let panel1 = document.createElement('div')
    panel1.id = 'objectPanel'  
    let panelContainer = document.createElement('div')
    panelContainer.id = "panelContainer"

    createRowWith3args(mainScene,[mainScene.position.x,mainScene.position.y,mainScene.position.z],panel1,'position',0.020)


    panelContainer.appendChild(panel1)
    objectContainer.appendChild(panelContainer)

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



    // Event Listeners
    window.addEventListener("mouseup",(e)=>{
      
      if(isDraggingTransformControls && document.getElementById('optionMenu').getBoundingClientRect().x > e.clientX){
        let x = (e.clientX / (window.innerWidth / 2) - 1 )
        let y = -(e.clientY / (window.innerHeight / 2) - 1 )
        rayCast.setFromCamera(new THREE.Vector2(x,y),mainCamera)
        let filters = [];
        mainScene.traverseVisible((child)=>{
          if((child.type == 'Mesh' || child?.isLight || child.name == 'picker') && (!child?.userData.isLightHelper && !child.isTransformControlsRoot && !child?.type.includes("Grid") && !child?.type.includes("Axes"))){
            filters.push(child)
          }
        })
        let intersectObj = rayCast.intersectObjects(filters,false)
        if(intersectObj.length > 0 ){
          let mesh = intersectObj[0].object
          if(mesh.userData.object !== undefined){
            chosenLayer = mainScene.getObjectByProperty('uuid', mesh.userData.object )
          }else{
            chosenLayer = mesh
          }
          hideTransformAndSelectionBox()
          handleTranformControlsAndBoxHelper(chosenLayer)
          mainInit()

          saveSceneState()
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

      mainRenderer.setSize(window.innerWidth, window.innerHeight);
      mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
            chosenLayer.userData?.object && (mainScene.getObjectByProperty('uuid', chosenLayer.userData.object)).removeFromParent()
            if(chosenLayer.target){
              layerContainer.querySelector(`[data-uuid="${chosenLayer.target}"]`).remove()
              (mainScene.getObjectByProperty('uuid', chosenLayer.target)).removeFromParent()
            }
          } 
          if(chosenLayer?.isGroup){
            chosenLayer.children.forEach((child)=>{
              layerContainer.querySelector(`[data-uuid="${child.uuid}"]`).remove()
            })  
          }
          chosenLayer.removeFromParent() 
          chosenLayer = null
          mainInit()
          saveSceneState()
          
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

    appendLayer(mainCamera,layerContainer,'type camera',false,)
    appendLayer(mainScene,layerContainer,'type scene',false,)
    
    function updateLayers(e){
      handleTranformControlsAndBoxHelper(chosenLayer)
      layerFiltering(e.child)
      saveSceneState()

    }

    // Export Code 
    document.getElementById('export-code').addEventListener('click',(event)=>{
      document.getElementById('language-jsContain').hidden = false
      let text = ``
      exportCode = ``
      importSection = `import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
`;
      codeSection = `\nlet scene = new THREE.Scene()
let camera = new THREE.${mainCamera.type}(${[...mainCameraParam]})

let renderer = new THREE.${mainRenderer.constructor.name}()
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement)

let controls = new OrbitControls( camera, renderer.domElement );

`
      if(mainComposer){
        mainComposer.passes.forEach((effect)=>{
        importSection += `import { ${effect.constructor.name} } from 'three/addons/shaders/${effect.constructor.name}.js';
`
        text += `let composer = new EffectComposer(renderer)
let ${effect.constructor.name} = new ${effect.constructor.name}(scene,camera)
composer.addPass( ${effect.constructor.name} )

`
        })
      }
      sceneAddSection = ``
      animateSection = ``
      mainScene.children.forEach(handleExport)
      exportCode += importSection 
      exportCode += codeSection 
      exportCode += sceneAddSection 
      exportCode += text
      handleAnimate()
      exportCode += animateSection 
      let codeExportElement = document.getElementById('language-js')
      codeExportElement.textContent = exportCode
      Prism.highlightElement(codeExportElement);
    })

    function getConstructorParamters(object){
      let source = object.toString()
      let match = source.match(/this\.parameters\s*=\s*\{([\s\S]*?)\}/)
      return match[1].split(',').map(param => param.trim())
    }
    // End of Export Code 


    [...mainScene.children].forEach((child)=>{
      
      if(child.isMesh){
        if(child.geometry && child.children.length < 1){
          let positions = child.geometry.attributes.position.array
          let unique = [];
          let seen = new Set();
          for (let i = 0; i < positions.length; i += 3) {
              let x = positions[i];
              let y = positions[i + 1];
              let z = positions[i + 2];
              let key = `${x},${y},${z}`;
              if (!seen.has(key)) {
                  seen.add(key);
                  unique.push([x, y, z,i / 3]);
              }
          }
          unique.forEach((cord)=>{              
            let buffer = new THREE.BufferGeometry()
            let vertices = new Float32Array([
              cord[0],cord[1],cord[2]
            ])
            buffer.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
            const geometry = new THREE.SphereGeometry(0.020, 8, 8);
            let points = new THREE.Mesh( geometry,new THREE.MeshBasicMaterial({color: 'grey'}))
            points.position.set( cord[0],cord[1],cord[2])
            points.userData.skip = true
            points.userData.index = cord[3]
            points.userData.vertexVisual = true
            child.add(points)
          })                    
        }
          
      }
        if(child.userData.isLightHelper){
          child.removeFromParent()
          return null
        }
        if (child.isPointLight) {
          let geometry = new THREE.SphereGeometry(2,4,2)
          let material = new THREE.MeshBasicMaterial({color: 'white',visible:false})
          let picker = new THREE.Mesh(geometry,material)
          picker.name = 'picker';
          picker.userData.object = child.uuid
          const helper = new THREE.PointLightHelper(child, ...lights['PointLight']?.mainHarg);
          helper.userData.isLightHelper = true;
          helper.visible = settings.showHelpers;
          mainScene.add(helper);
          helper.add(picker)
          child.userData.object = helper.uuid
          
          helper.update()
        }
        if (child.isHemisphereLight) {
          let geometry = new THREE.SphereGeometry(2,4,2)
          let material = new THREE.MeshBasicMaterial({color: 'white',visible:false})
          let picker = new THREE.Mesh(geometry,material)
          picker.name = 'picker';
          picker.userData.object = child.uuid
          const helper = new THREE.HemisphereLightHelper(child, ...lights['HemisphereLight']?.mainHarg);
          helper.userData.isLightHelper = true;
          helper.visible = settings.showHelpers;
          mainScene.add(helper);
          helper.add(picker)
          child.userData.object = helper.uuid
          
          helper.update()
        }
        if (child.isDirectionalLight) {
            let geometry = new THREE.SphereGeometry(2,4,2)
            let material = new THREE.MeshBasicMaterial({color: 'white',visible:false})
            let picker = new THREE.Mesh(geometry,material)
            picker.name = 'picker';
            picker.userData.object = child.uuid
            const helper = new THREE.DirectionalLightHelper(child, ...lights['DirectionalLight']?.mainHarg);
            helper.userData.isLightHelper = true;
            helper.visible = settings.showHelpers;
            mainScene.add(helper);
            helper.add(picker)
            child.userData.object = helper.uuid
            child.target.userData.object =  helper.uuid      
            helper.update()
      
        }
        if (child.isSpotLight) {
            let geometry = new THREE.SphereGeometry(2,4,2)
            let material = new THREE.MeshBasicMaterial({color: 'white',visible:false})
            let picker = new THREE.Mesh(geometry,material)
            picker.name = 'picker';
            picker.userData.object = child.uuid
            const helper = new THREE.SpotLightHelper(child);
            helper.userData.isLightHelper = true;
            helper.visible = settings.showHelpers;
            mainScene.add(helper);
            helper.add(picker)
            child.userData.object = helper.uuid
            child.target.userData.object =  helper.uuid      
            helper.update()
        }

      layerFiltering(child)
    })
     if(initialization){
      saveSceneState()
    }

      let mouseIsDown = false
    let firstMouseDown = true
    let referencePoint;
    let index;
    let instantIndex;
    let instantCords;
    const dragPlane = new THREE.Plane();

    const cameraDirection = new THREE.Vector3();
    mainCamera.getWorldDirection(cameraDirection);

    window.addEventListener(('mousemove'),(e)=>{            
      if(!isInsideCanvas(e.clientX) || isUsingTransformControls)return
      
      let x = (e.clientX / (window.innerWidth / 2) - 1 )
      let y = -(e.clientY / (window.innerHeight / 2) - 1 )
      rayCast.setFromCamera(new THREE.Vector2(x,y),mainCamera)
    
    mainScene.children.forEach((child)=>{
      if(child.type === "Mesh"){
        let point;
        let intersectObjects = rayCast.intersectObject(child,false)
        if(mouseIsDown){
            point = new THREE.Vector3();
            if(referencePoint){
              dragPlane.setFromNormalAndCoplanarPoint(
                cameraDirection,
                referencePoint
              );
              rayCast.ray.intersectPlane(dragPlane, point);
            }
            
        }
        if(intersectObjects.length > 0){
          intersectObjects.forEach((intersect)=>{
          let cords = checkIfValidPoint(intersect.object,intersect.point);
          instantIndex = cords[3]
          instantCords = cords
          let positions = intersect.object.geometry.attributes.position
          
          if(mouseIsDown){
            index == undefined && (index = instantIndex)
            controls.enabled = false
            point = new THREE.Vector3();
            if(referencePoint){
                dragPlane.setFromNormalAndCoplanarPoint(
                cameraDirection,
                referencePoint
              );
              rayCast.ray.intersectPlane(dragPlane, point);
            }
              let THEpoint = intersect.object.children.find((child)=>index.includes(child.userData.index))        
                
            // visual feedback (points) update 
            // intersect.object.children.forEach((childpoint)=>{
            //   let pointCords = childpoint.geometry.attributes.position.array
            //   if(pointCords[0] == cords[0] && pointCords[1] == cords[1] && pointCords[2] == cords[2]){
            //       childpoint.geometry.attributes.position.setXYZ(0,point.x ,point.y,point.z)
            //       childpoint.geometry.attributes.position.needsUpdate = true
            //     }
            //   })
            for (let i = 0; i < index.length; i++) {      
                intersect.object.geometry.attributes.position.setXYZ(index[i],point.x ,point.y,point.z)
                intersect.object.geometry.attributes.position.needsUpdate = true;
            }
            // THEpoint.geometry.attributes.position.setXYZ(0,point.x ,point.y,point.z)
            THEpoint.position.set(point.x ,point.y,point.z)
            selectionBox.update()

            // THEpoint.geometry.attributes.position.needsUpdate = true;
    
          }
    
        })
        }
        else if(point){
          let cords = checkIfValidPoint(child,point);
          console.log(cords);
          
          if(cords){
            console.log('found a close point by');
            instantIndex = cords[3]
            instantCords = cords
            let positions = child.geometry.attributes.position          
            index == undefined && (index = cords[3])
            controls.enabled = false
            // visual feedback (points) update 
            // child.children.forEach((childpoint)=>{
            //   let pointCords = childpoint.geometry.attributes.position.array
            //   if(pointCords[0] == cords[0] && pointCords[1] == cords[1] && pointCords[2] == cords[2]){
            //       childpoint.geometry.attributes.position.setXYZ(0,point.x ,point.y,point.z)
            //       childpoint.geometry.attributes.position.needsUpdate = true
            //     }
            //   })
            let THEpoint = child.children.find((child)=>index.includes(child.userData.index))        

            for (let i = 0; i < index.length; i++) {              
                child.geometry.attributes.position.setXYZ(index[i],point.x ,point.y,point.z)
                child.geometry.attributes.position.needsUpdate = true
            }
            THEpoint.position.set(point.x ,point.y,point.z)
            selectionBox.update()
    
          }else{
            if(firstMouseDown){
              mouseIsDown = false
            }
          }

        }else{
          if(firstMouseDown){
            mouseIsDown = false
          }
        }
  
  }}
  
  )
    firstMouseDown = false
  })
    window.addEventListener('mousedown',(event)=>{
      if(!isInsideCanvas(event.clientX))return
      mouseIsDown= true
      firstMouseDown = true
      if(instantCords){      
        referencePoint = new THREE.Vector3(instantCords[0],instantCords[1],instantCords[2])
      }
      if(instantIndex){
        index = instantIndex
      }
    })
    window.addEventListener('mouseup',(event)=>{
      out && (codecont.hidden = true)
      if(!isInsideCanvas(event.clientX))return
      controls.enabled = true
      firstMouseDown = true
      mouseIsDown= false})
  }
  function checkIfPointExist(mainScene,cords) {
    let exist = false
    mainScene.children.forEach((child)=>{
      if(child?.children && child.type == 'Mesh'){
        child.children.forEach((subChild)=>{
          if(subChild.type == 'Points' && subChild.userData.customPoint == true){
            let pointCords = subChild.geometry.attributes.position.array
            if(cords[0] == pointCords[0] && cords[1] == pointCords[1] && cords[2] == pointCords[2]){
              exist = true
            }
          }
        })
      }
      })
    return exist
  }

  function checkIfValidPoint(object,point) {
    let positions = object.geometry.attributes.position.array
    let found = false;
    let indexOfAllPoints = []
    let cords = []
    
    for (let i = 0; i < positions.length; i+= 3) {
      if((Math.abs(point.x - positions[i]) < .3)
        && (Math.abs(point.y - positions[i + 1]) < .3)
      && (Math.abs(point.z - positions[i + 2]) < .3))
      {
        cords = [positions[i],positions[i + 1],positions[i + 2]]
        indexOfAllPoints.push((i / 3))
        found = true
      }
    }
    cords.push(indexOfAllPoints)
    if(found)return cords
    return false
        
  }
  function isInsideCanvas(mouseX){
    return document.getElementById('optionMenu').getBoundingClientRect().x > mouseX
  }
  function disposeEverything() {
    mainComposer = null
    effectsNames = []
    chosenLayer = null
    document.getElementById('panelContainer') && document.getElementById('panelContainer').remove()
    hideTransformAndSelectionBox()  
      if(TC)TC.detach();
      ([...mainScene.children]).forEach((child)=>{
        if(child?.isGroup){
          [...child.children].forEach((groupChild)=>{
            let layer = layerContainer.querySelector(`[data-uuid="${groupChild.uuid}"]`)
            if(layer)layer.remove()
            groupChild.removeFromParent()        
          }
          )
        }
        if(!child?.isTransformControlsRoot){
          let layer = layerContainer.querySelector(`[data-uuid="${child.uuid}"]`)
          if(layer)layer.remove()
          child.removeFromParent()
        }
      })
  }
  }

function saveBuffer(data,downloadFileName){
    const blob = new Blob([data], {
    type: 'application/octet-stream'
  })
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a')
    a.href = url
    a.download = downloadFileName
    a.click()
    URL.revokeObjectURL(url)
}