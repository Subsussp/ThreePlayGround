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
const map = new THREE.TextureLoader().load("./textures/sprite.jpg");
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

let materialConfig = {
  wireFrame: true,
}
let settings = {
  defaultGeomtriesMaterial: new THREE.MeshBasicMaterial({color: "white",wireframe:true}),
  preview: true 
}
let objectContainer = document.getElementById('ObjectsContainer')
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
    pos:[40,5,-4]

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
     
    pos:[40, 30,15]
    // pos:[40, 35,100]

  }

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
    args:[]
  },
  MeshDepthMaterial:{
    args:[]
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



const Mainscene = new THREE.Scene();
Mainscene.background = new THREE.Color('#333333')

let light = new THREE.AmbientLight("white",10)
let renderer = new THREE.WebGLRenderer({antialias:true})
let Mainrenderer = new THREE.WebGLRenderer({antialias:true})
let chosenLayer;

Mainrenderer.setSize(window.innerWidth,window.innerHeight)
Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("app").appendChild(Mainrenderer.domElement)


const MainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
MainCamera.position.set(2, 3, 20);
const controls = new OrbitControls( MainCamera, Mainrenderer.domElement );
controls.zoomSpeed = 2

const AxesHelper = new THREE.AxesHelper(3)
const GridHelper = new THREE.GridHelper(10,40,0x444444,0x444444)

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

Mainscene.add(MainCamera)
Mainscene.add(AxesHelper)
Mainscene.add(GridHelper)

function animate(){
  Mainrenderer.render(Mainscene,MainCamera)
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
    let protoContainer = document.createElement('div')
    let proto = document.createElement('div')
    let label = document.createElement('div')
    label.className = "ll"
    label.innerText = objects[i]
    proto.className = "prototype"
    proto.dataset.TE = objects[i]
    protoContainer.dataset.TE = objects[i]
    protoContainer.className = "prototypeContainer"
    settings.preview && protoContainer.appendChild(proto)
    protoContainer.appendChild(label)
    objectContainer.appendChild(protoContainer)

    protoContainer.addEventListener('pointerdown',(e)=>{
      cursor.removeState("-fade-out");
      window.addEventListener('pointerup',(e)=>{
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
          if(Object.keys(THREE).includes(objects[i] + "Helper")){
            const lighthelper = new THREE[objects[i] + "Helper"](light,...lights[objects[i]]?.mainHarg);
            lighthelper.isLightHelper = true;
            Mainscene.add(lighthelper);
            lighthelper.add(picker)
            light.userData.object = lighthelper
          }
          picker.name = 'picker';
          picker.userData.object = obj
          updateInfo()
        }
        if(mode == "geometry"){
          let geo = new THREE[objects[i]]()
          let material = settings.defaultGeomtriesMaterial
          obj = new THREE.Mesh(geo,material);
          chosenLayer = obj
          updateInfo()
        }
        if(mode == "material"){
          let material = new THREE[objects[i]](...materials[objects[i]].args)
          let geo = new THREE.SphereGeometry()
          obj = new THREE.Mesh(geo,material);
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
TC.addEventListener('change',(e)=>{
  isDraggingTransformControls = false
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

function showTransform(obj){
  TC.enabled = true;
  TC.getHelper().visible = true;
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

    let label = document.createElement('div')
    label.className ='vertwr selected'
    label.innerHTML ='Object'
    meshComponentContainer.appendChild(label)
    label.addEventListener("click",selectLabel)
    createPanels(chosenLayer)
    if(chosenLayer?.geometry) {
      let label = document.createElement('div')
      label.classList.add('vertwr')
      label.innerHTML ='Geometry'
      label.addEventListener("click",selectLabel)
      meshComponentContainer.appendChild(label)
      console.log(chosenLayer);
      
    }
    if(chosenLayer?.material) {
      let label = document.createElement('div')
      label.classList.add('vertwr')
      label.innerHTML ='Material'
      label.addEventListener("click",selectLabel)
      meshComponentContainer.appendChild(label)
    }

    objectContainer.innerHTML = ""
    objectContainer.appendChild(meshComponentContainer)
  }else{
    objectContainer.innerHTML = ""
  }
}
function selectLabel(e){
  if(!e.target.classList.contains('selected')){
    document.querySelectorAll('.selected').forEach((e)=>e.classList.remove('selected'))
    e.target.classList.add('selected')
  }

}
function createObjectPanel(object){
  let panel = document.createElement('div')
  panel.id = 'objectPanel'
}
function createGeometryPanel(object){
  let panel = document.createElement('div')
  panel.id = 'geometryPanel'


}
function createMaterialPanel(object){
  let panel = document.createElement('div')
  panel.id = 'materialPanel'

}
function helperInit(){
  
}

function cameraInit(){

}
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
      if(b.target.dataset.type == "camera"){
        cameraInit()
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
const rayCast = new THREE.Raycaster()
window.addEventListener("mouseup",(e)=>{
  if(isDraggingTransformControls){
    let x = (e.clientX / (window.innerWidth / 2) - 1 )
    let y = -(e.clientY / (window.innerHeight / 2) - 1 )
    rayCast.setFromCamera(new THREE.Vector2(x,y),MainCamera)
    let filters = [];
    Mainscene.traverseVisible((child)=>{
      console.log(child)
      if((child.type == 'Mesh' || child?.isLight || child.name == 'picker') && (!child?.isLightHelper && !child.isTransformControlsRoot && !child?.type.includes("Grid") && !child?.type.includes("Axes"))){
        filters.push(child)
      }
    })
    console.log(filters)
    let intersectObj = rayCast.intersectObjects(filters,false)
    console.log(intersectObj)
    if(intersectObj.length > 0 ){
      let mesh = intersectObj[0].object
      if(mesh.userData.object !== undefined){
        chosenLayer = mesh.userData.object 
      }else{
        chosenLayer = mesh
      }
      console.log(mesh)
      hideTransformAndSelectionBox()
      handleTranformControlsAndBoxHelper(chosenLayer)
      mainInit()
      updateInfo()
    }else if(intersectObj.length < 1 ){
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

appendLayer("Camera",layerContainer,'type camera',false,MainCamera.uuid)
appendLayer("scene",layerContainer,'type scene',false,Mainscene.uuid)

Mainscene.addEventListener("childadded",updateLayers)

// Export Code 

// let code = ``
// Mainscene.children.forEach((child)=>{
//   console.log(child);
//   console.log(child.constructor.name);
//   if(child.constructor.name && Object.hasOwn(THREE,child.constructor.name)){
//     code += `let ${child.constructor.name} = new THREE.${child.constructor.name}()\n`
//   }
// })
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
        appendLayer(e?.userData?.name ? e.userData.name : e.type,layerContainer,'type '+ classy,true,e.uuid)
      }
    }
}

function appendLayer(nameContent,parent,markC,opener,uuid){
  let layer = document.createElement('div')
  layer.className = "layer"
  layer.setAttribute('data-uuid',uuid)
  layer.innerHTML = `
    ${opener ? '<span class="opener"></span>' : ""}
    <span class="${markC}"></span>
    ${nameContent}
`
  layer.addEventListener('click',(e)=>{
    if(Mainscene.uuid == uuid){
      chosenLayer = Mainscene
    }
    else if(MainCamera.uuid == uuid){
      chosenLayer = MainCamera
    }else{
      chosenLayer = Mainscene.getObjectByProperty("uuid",uuid)
      handleTranformControlsAndBoxHelper(chosenLayer)
    }
    mainInit()
  })
  parent.appendChild(layer)
}
function handleTranformControlsAndBoxHelper(obj){
  if(obj.isLight){
    attachTranformControls(obj)
  }else{
    attachTranformControls(obj)
    attachBoxHelper(obj)
  }
}

window.addEventListener('keydown',(e)=>{
  if(e.keyCode == 8){
    if(chosenLayer){
      TC.detach()
      hideTransformAndSelectionBox()
      layerContainer.querySelector(`[data-uuid="${chosenLayer.uuid}"`).remove()
      if(chosenLayer.userData.object){
        chosenLayer.userData.object.removeFromParent()
      } 
      chosenLayer.removeFromParent() 
      chosenLayer = null
      mainInit()
    }
  }
})