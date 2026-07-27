import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from "three/addons/controls/TransformControls.js";

let materialConfig = {
  wireFrame: false,
}
let settings = {
  preview: true
}
let objectContainer = document.getElementById('ObjectsContainer')
let lights = {
  AmbientLight:{
    args: [ 0x404040 , 10],
    hparg:[],
    pos:[2,5,20]
  },
  DirectionalLight:{
    args: [0xffffff, 1.0],
    hparg:[30],
    pos:[100,50,-4]
  },
  HemisphereLight:{
    args: [ 0xffffff, 0x080820, 1]
    ,hparg:[50],
    pos:[80,10,-10]
  },
  RectAreaLight:{
    args: [ 0xffffff, 1.0, 70,70],
    hparg:[1],
    pos:[50,5 ,50]
  },
  PointLight:{
    args: [ 0xffffff, 200, 100],
    hparg:[0.2],
    pos:[10,5,50]
  },
  SpotLight:{
     args: [ 0xffffff , 560,0,Math.PI/6,1,1.9],
     hparg:[],
    pos:[40, 35,100]

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
  // RawShaderMaterial:{

  // },
  // ShaderMaterial:{

  // },
  ShadowMaterial:{
    args:[]
  },
  SpriteMaterial:{
    args:[]
  }
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
  width: 550
}

let mesh;
let focuseObj;
let Objects = [];
let panelEle = document.getElementById("panel");
let infoP = document.getElementById('infoPanel');
let dos = true;


const Mainscene = new THREE.Scene();
Mainscene.background = new THREE.Color('#333333')

let light = new THREE.AmbientLight("white",10)

let renderer = new THREE.WebGLRenderer({antialias:true})
let Mainrenderer = new THREE.WebGLRenderer({antialias:true})
Mainrenderer.setSize(window.innerWidth,window.innerHeight)
Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("app").appendChild(Mainrenderer.domElement)


const MainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
MainCamera.position.set(2, 3, 20);
const controls = new OrbitControls( MainCamera, Mainrenderer.domElement );


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
    protoContainer.draggable = true
    label.className = "ll"
    label.innerText = objects[i]
    proto.className = "prototype"
    proto.dataset.TE = objects[i]
    protoContainer.dataset.TE = objects[i]
    protoContainer.className = "prototypeContainer"
    settings.preview && protoContainer.appendChild(proto)
    protoContainer.appendChild(label)
    objectContainer.appendChild(protoContainer)
    // protoContainer.addEventListener('drag',(e)=>{
    //   console.log(e.clientX)
    //   console.log(e.clientY)
    // })
    protoContainer.addEventListener('dragend',(e)=>{
      if(document.getElementById('optionMenu').getBoundingClientRect().x > e.clientX){
      let obj;
      if(mode == "light"){
        const light = new THREE[objects[i]](...lights[objects[i]].args);
        obj=light;
      }
      if(mode == "geometry"){
        let geo = new THREE[objects[i]]()
        let material = new THREE.MeshBasicMaterial({color: "white",wireframe:true})
        obj = new THREE.Mesh(geo,material);
        focuseObj = obj
        updateInfo()
        let TC = new TransformControls(MainCamera,Mainrenderer.domElement)
        TC.setMode('translate')
        TC.attach(obj)
        obj.transform = TC
        TC.addEventListener("change",(e)=>{
          updateInfo()
        })
        Mainscene.add(TC.getHelper())
        TC.addEventListener("dragging-changed", (event) => {
          controls.enabled = !event.value;
        });
      }
      if(mode == "material"){
        let material = new THREE[e.targetobjects[i]](...materials[objects[i]].args)
        let AmbientLight = new THREE.AmbientLight(0x404040)
        let geo = new THREE.SphereGeometry()
        obj = new THREE.Mesh(geo,material);
      }  
        Mainscene.add(obj)
      }
      
    })
  }
}

function optionDemo(mode,statue){
  const prototypes = document.querySelectorAll(".prototype");
  const previews = [];
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false;
  renderer.setScissorTest(true);

  document.getElementById(
    "ObjectsContainer"
  ).appendChild(renderer.domElement);

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
          lighthelper.position.set(...pos);
          scene.add(lighthelper);
        }
        if(prototypes[i].dataset.TE + "Helper"  == 'RectAreaLightHelper'){
          const lighthelper = new RectAreaLightHelper(light);
          lighthelper.position.set(...pos);
          scene.add(lighthelper);
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
        camera.position.set(0, .3,5);
        let material = new THREE[prototypes[i].dataset.TE](...materials[prototypes[i].dataset.TE].args)
        let AmbientLight = new THREE.AmbientLight(0x404040)
        let geo = new THREE.SphereGeometry()
        mesh = new THREE.Mesh(geo,material);
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

// Init 

function lightInit(){
  appendOptionObjects(Object.keys(lights),"light")
  if(settings.preview){
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
    optionDemo("light",statue)
  }
}

function materialInit(){
  appendOptionObjects(Object.keys(materials),"material")
  optionDemo("material")
}

function geometryInit(){
  appendOptionObjects(Object.keys(geometries),"geometry")
  optionDemo("geometry")
}

function helperInit(){
  
}

function cameraInit(){

}

document.querySelectorAll('.option').forEach((a)=> { 
  a.addEventListener('click',(b)=>{
    if(b.target.classList.contains('opop')){
      document.body.querySelectorAll('.opop').forEach((c)=>
        c.classList.remove('opop')
      ) 
      panelEle.classList.remove('optrans') 
      panelEle.style.width = "80px"  

    }else{
      objectContainer.innerHTML = ``
      document.body.querySelectorAll('.opop').forEach((c)=>{
        if(c.dataset.type == "main"){
          toggleFirstAnimation(c.firstElementChild) 
        }
        c.classList.remove('opop')
      }
      ) 
      if(!panelEle.classList.contains('optrans')){
         panelEle.classList.add('optrans')
         panelEle.style.width = panel.width + "px"
      } 
      if(b.target.dataset.type == "light"){
        lightInit()
      }
      if(b.target.dataset.type == "main"){
        
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
      b.target.classList.add('opop')
    }

    if(b.target.dataset.type == "main"){
      console.log(b.target)
      console.log(b.target.firstElementChild)
        toggleFirstAnimation(b.target.firstElementChild)
    }else if(b.target.dataset.type == "light"){

    }

})
})

// Helping functions

function hideAllTransform(){
    Mainscene.children.forEach((e)=>{
      if(e?.isTransformControlsRoot){
        e.controls.enabled = false
        e.visible = false
      }
     })    
}

function showTransform(obj){
    obj.object.transform.enabled = true
    obj.object.transform.getHelper().visible = true
}

function updateInfo(){
  let arr = ["x",'y','z']
    for (let i = 0; i < infoP.children.length; i++) {
      infoP.children.item(i).innerHTML = `${arr[i]}:  ${focuseObj.position[arr[i]]}`;
    }
}

// Event Listeners
window.addEventListener("mouseup",(e)=>{
  const rayCast = new THREE.Raycaster()
  let x = (e.clientX / (window.innerWidth / 2) - 1 )
  let y = -(e.clientY / (window.innerHeight / 2) - 1 )
  rayCast.setFromCamera(new THREE.Vector2(x,y),MainCamera)
  let filters = Mainscene.children.filter((e)=> e.type.includes('Mesh'))
  let intersectObj = rayCast.intersectObjects(filters)
  console.log(intersectObj)
  if(intersectObj.length > 0){
    let mesh = intersectObj[0]
    hideAllTransform()
    showTransform(mesh)
    focuseObj = mesh.object
    updateInfo()
  }else if (dos && intersectObj.length < 1 && e.clientX < panelEle.getBoundingClientRect().x){
    hideAllTransform()
  }
})

window.addEventListener("resize", () => {
  MainCamera.aspect = window.innerWidth / window.innerHeight;
  MainCamera.updateProjectionMatrix();

  Mainrenderer.setSize(window.innerWidth, window.innerHeight);
  Mainrenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousedown",(e)=>{
  dos = true
})

window.addEventListener("mousemove",(e)=>{
  dos = false
})