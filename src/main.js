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

MouseFollower.registerGSAP(gsap);

const cursor = new MouseFollower({
    speed: 0.3,
});
cursor.addState("-fade-out");
const rayCast = new THREE.Raycaster()
const map = new THREE.TextureLoader().load("./textures/sprite.jpg");

let initialMouseXPosition;
let initialMouseYPosition;

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
let settingFromLocalstorage = window.localStorage.getItem('setting')

let settings =settingFromLocalstorage ? JSON.parse(settingFromLocalstorage) :{
  defaultGeomtriesMaterial: 'MeshBasicMaterial',
  wireframe: true,
  showHelpers: true,
  showTransformControls: true,
  preview: true 
}
let objectContainer = document.getElementById('ObjectsContainer')



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

let helpers = {
}
let panel = {
  width: 450
}

let mesh;
let layerObjects = [];
let panelEle = document.getElementById("panel");
let infoP = document.getElementById('infoPanel');
let isDraggingTransformControls = true;



const Mainscene = new THREE.Group();
let light = new THREE.AmbientLight("white",10)
let renderer = new THREE.WebGLRenderer({antialias:true})
let Mainrenderer = new THREE.WebGLRenderer({antialias:true})
let chosenLayer;
Mainrenderer.shadowMap.enabled = true;

Mainrenderer.setSize(window.innerWidth,window.innerHeight)
Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("app").appendChild(Mainrenderer.domElement)


const MainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
MainCamera.position.set(2, 3, 20);
MainCamera.name = 'Camera'
const controls = new OrbitControls( MainCamera, Mainrenderer.domElement );
controls.zoomSpeed = 2

const AxesHelper = new THREE.AxesHelper(3)
const GridHelper = new THREE.GridHelper(30,40,0x565656,0x444444)

const Grid = document.querySelector("#G")
const Axes = document.querySelector("#Ax")

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
Mainscene.name = 'Scene'
MainRealscene.background = new THREE.Color('#333333')
MainRealscene.add(MainCamera)
MainRealscene.add(AxesHelper)
MainRealscene.add(GridHelper)
MainRealscene.add(Mainscene)

function animate(){
  Mainrenderer.render(MainRealscene,MainCamera)
  controls.update()
  requestAnimationFrame(animate)
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

async function appendOptionObjects(objects,mode){
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
          rayCast.setFromCamera(new THREE.Vector2(x,y),MainCamera)
          let filters = [];
          Mainscene.traverseVisible((child)=>{
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
          if(lights[objects[i]]?.hasTarget){
            console.log(objects[i]);
            let target = new THREE.Object3D()
            target.isTarget = true
            target.position.set(0,0,0)
            light.target = target
            Mainscene.add(target);
          }
          if(Object.keys(THREE).includes(objects[i] + "Helper")){
            const lighthelper = new THREE[objects[i] + "Helper"](light,...lights[objects[i]]?.mainHarg);
            lighthelper.isLightHelper = true;
            lighthelper.visible = settings.showHelpers;
            Mainscene.add(lighthelper);
            lighthelper.add(picker)
            light.userData.object = lighthelper
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
          Mainscene.add(obj)
          handleTranformControlsAndBoxHelper(chosenLayer)
          mainInit()
        }
        
      },{once:true})
    })
  }
}

let TC = new TransformControls(MainCamera,Mainrenderer.domElement)
const selectionBox = new THREE.BoxHelper();
selectionBox.visible = false;
TC.setMode('translate')
TC.enabled = true
Mainscene.add(selectionBox);
Mainscene.add(TC.getHelper())
TC.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
  updateInfo()    
})
let positionMapArr = ['x','y','z']
TC.addEventListener('change',(e)=>{
  isDraggingTransformControls = false
  if(chosenLayer?.isLight && chosenLayer?.userData.object){
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
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

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
      scene.add(mesh);
      scene.background = new THREE.Color('black')
      previews.push({
          element: prototypes[i],
          scene,
          camera,
          mesh,
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
          renderer.render(preview.scene, preview.camera);
        }
      }
    }

  animate();

  window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
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
    Mainscene.traverse((object)=>{
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
    Mainscene.traverse((object)=>{
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

function createCustomText(innerText) {
  let text = document.createElement('span')
  text.innerText = innerText
  text.style.fontWeight = '300'
  text.style.fontSize = '12px'
  text.style.fontFamily = "American Typewriter"
  return text
}
function lightInit(){
  appendOptionObjects(Object.keys(lights),"light")
  if(settings.preview){
    optionDemo("light")
  }
}
let mainOption = document.querySelector('[data-type="main"]')
function materialInit(){
  appendOptionObjects(Object.keys(materials),"material")
  if(settings.preview){
    optionDemo("material")
  }
}

function geometryInit(){
  appendOptionObjects(Object.keys(geometries),"geometry")
  if(settings.preview){
    optionDemo("geometry")  
  }
}

function removeAllActiveClass(){
  document.querySelectorAll('.layerActive').forEach((e)=>{
    e.classList.remove('layerActive')
  })
}

function addActiveClass(htmlLayer){
  htmlLayer.classList.add('layerActive')
}

function handleActivation(htmlLayer){
  removeAllActiveClass()
  addActiveClass(htmlLayer)
}


function selectLabel(e){
  if(!e.target.classList.contains('selected')){
    document.querySelectorAll('.selected').forEach((e)=>e.classList.remove('selected'))
    document.querySelectorAll('.panelOpen').forEach((e)=>e.classList.remove('panelOpen'))
    document.querySelector(`#${e.target.innerText.toLowerCase() + 'Panel'}`).classList.add('panelOpen')
    e.target.classList.add('selected')
  }

}

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
  return numberInput
}

function createColorInput(color){
  let colorInput = document.createElement('input')
  colorInput.className = 'Color'
  colorInput.type = "Color"
  colorInput.value = color
  return colorInput
}

function numberInputValueControl(event,element,offset,min,max,key,Xmulti,Ymulti,fixNum){ 
  if(key != "rotation"){
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
  firstArg.addEventListener('change',(e)=>{
  if(key != "rotation" ){
      object[key]['set'+ 'x'.toUpperCase()](+e.target.value)
    }else{
      e.target.value = e.target.value.replace('°','')
      object[key]['x'] = +(e.target.value) / 180 * Math.PI 
      e.target.value = (+e.target.value).toFixed(2) + '°'
    }
    selectionBox.update()
  })
  secondArg.addEventListener('change',(e)=>{
    if(key != "rotation" ){
      object[key]['set'+ 'y'.toUpperCase()](+e.target.value)
    }else{
      e.target.value = e.target.value.replace('°','')
      object[key]['y'] = +(e.target.value) / 180 * Math.PI 
      e.target.value = (+e.target.value).toFixed(2) + '°'
    }
    selectionBox.update()
  })
  thirdArg.addEventListener('change',(e)=>{
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
        }
        number.addEventListener('mousedown',(e)=>{
          initialMouseXPosition = e.clientX
          initialMouseYPosition = e.clientY
          window.addEventListener("mousemove",lightMouseMovementHandler)
          window.addEventListener('mouseup',(e)=>{
            window.removeEventListener('mousemove',lightMouseMovementHandler)
        })})
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
  Object.keys(object.geometry.parameters).forEach((key)=>{
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
function changeObjectTransformValueBasedOnMouseDrag(event,valueSymbol,element,object,key){
  if(key != "rotation" ){
    object[key]['set'+ valueSymbol.toUpperCase()](+element.value)
  }else{
    object[key][valueSymbol] = +(((+(element.value.replace('°','')) / 180 * Math.PI)))
  }
  TC.update()  
  selectionBox.update()
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

createRowWith3args(Mainscene,[Mainscene.position.x,Mainscene.position.y,Mainscene.position.z],panel1,'position',0.020)


panelContainer.appendChild(panel1)
objectContainer.appendChild(panelContainer)

let upload = document.getElementById('upload')
function uploadInit(){
  upload.click()
  upload.addEventListener("change",uploadListener)
}
let fileName;
function uploadListener(e){
  // console.log(e)
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
          Mainscene.add(e.scene)
        })
        break;
      case 'fbx':
        const lo = loaderMap[extention]
        const fbxLoader = new lo()        
        let fbxObj = fbxLoader.load(blobUrl,(e)=>{
          Mainscene.add(e.scene)
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
    // check if the option is selected 
    // if it was selected when you clicked 
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
    // if it wasn't selected when you clicked
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
      if(b.target.dataset.type == "helper"){
        
      }
      if(b.target.dataset.type == "setting"){
        objectContainer.classList.remove('grid-layout')
        settingInit()
      }

    }


})
})

// Helping functions

function updateInfo(){
  let arr = ["x",'y','z']
    for (let i = 0; i < infoP.children.length; i++) {
      infoP.children.item(i).innerHTML = `${arr[i]}:  ${chosenLayer?.position[arr[i]] || 0}`;
    }
}

// Event Listeners
window.addEventListener("mouseup",(e)=>{
  if(isDraggingTransformControls && document.getElementById('optionMenu').getBoundingClientRect().x > e.clientX){
    let x = (e.clientX / (window.innerWidth / 2) - 1 )
    let y = -(e.clientY / (window.innerHeight / 2) - 1 )
    rayCast.setFromCamera(new THREE.Vector2(x,y),MainCamera)
    let filters = [];
    Mainscene.traverseVisible((child)=>{
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
  MainCamera.aspect = window.innerWidth / window.innerHeight;
  MainCamera.updateProjectionMatrix();

  Mainrenderer.setSize(window.innerWidth, window.innerHeight);
  Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousedown",(e)=>{
  isDraggingTransformControls = true
})

window.addEventListener("mousemove",(e)=>{
  isDraggingTransformControls = false
})

let layerContainer = document.getElementById('layersControl');

appendLayer(MainCamera,layerContainer,'type camera',false,
)
appendLayer(Mainscene,layerContainer,'type scene',false,)

Mainscene.addEventListener("childadded",updateLayers)

// Export Code 

document.getElementById('export-code').addEventListener('click',(event)=>{
  let code = ``
  document.getElementById('language-jsContain').hidden = false
  Mainscene.children.forEach((child)=>{
    console.log(child);
    console.log(child.constructor.name);
    if(child.constructor.name && Object.hasOwn(THREE,child.constructor.name)){
      code += `let ${child.constructor.name} = new THREE.${child.constructor.name}()\n`
    }
  })
  let codeExportElement = document.getElementById('language-js')
  codeExportElement.textContent = code
  Prism.highlightElement(codeExportElement);
})
// console.log(code);

// End of Export Code 

function updateLayers(e){
  layerFiltering(e.child)
}
window.scene = Mainscene
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
    if(Mainscene.uuid == object.uuid){
      chosenLayer = Mainscene
    }
    else if(MainCamera.uuid == object.uuid){
      chosenLayer = MainCamera
    }else{
      chosenLayer = Mainscene.getObjectByProperty("uuid",object.uuid)
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

window.addEventListener('keydown',(e)=>{
  if(e.keyCode == 8){
    if(chosenLayer && chosenLayer.uuid !== Mainscene.uuid && chosenLayer.uuid !== MainCamera.uuid ){
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