import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.001,10000)
const map = new THREE.TextureLoader().load("textures/sprite.jpg");
let loader = new GLTFLoader()
let dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); 
loader.setDRACOLoader(dracoLoader)
let gltb = await loader.loadAsync('https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/3D/Statue.glb')
let renderer = new THREE.WebGLRenderer({antialias:true})
let box = new THREE.PlaneGeometry(100,100,1,10,10)
let boxmat = new THREE.MeshBasicMaterial({color:"red",map:map})
let mesh = new THREE.Mesh(box,boxmat)
let light = new THREE.DirectionalLight("white",3)
let lightHelper = new THREE.DirectionalLightHelper(light,20)
let controls = new OrbitControls(camera,renderer.domElement)

light.position.set(100,20,-20)
lightHelper.position.set(0,20,0)
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


document.body.append(renderer.domElement)
mesh.position.set(0,0,0)
camera.position.set(0, .3,200);
// scene.add(mesh)
let boxhelper;
gltb.scene.position.set(0,0,0)
gltb.scene.traverse((child)=>{
    if(child?.geometry){
        child?.geometry.center()
        boxhelper = new THREE.BoxHelper(child)
        light.target = child
        // scene.add(child)

        child.material = new THREE.MeshToonMaterial()
    }
})
scene.add(light)
// scene.add(boxhelper)

const material = new THREE.SpriteMaterial( { map: map, } );
const sprite = new THREE.Sprite( material );
sprite.scale.set(200, 200, 1)
// scene.add( sprite );
// mesh.rotation.x = Math.PI / 2
// mesh.scale.setX()

scene.add(sprite)
scene.add(lightHelper)
scene.add(camera)

// const rayCast = new THREE.Raycaster()

// window.addEventListener('mouseup',(e)=>{
//     let x = (e.clientX / (window.innerWidth / 2) - 1 )
//     let y = -(e.clientY / (window.innerHeight / 2) - 1 )
//     let objects = []
//     rayCast.setFromCamera(new THREE.Vector2(x,y),camera)
//     scene.traverse((child)=>{
//         objects.push(child)
//     })
//     console.log(objects)
//     let intersectObj = rayCast.intersectObjects(objects,false)
//     console.log(intersectObj)
//     if(intersectObj.length > 0 ){
//       let mesh = intersectObj[0]
//       console.log(mesh)
//     }
// })
window.addEventListener('resize',(e)=>{
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

})
function animate(){
    renderer.render(scene,camera)
    controls.update()
    requestAnimationFrame(animate)

}
animate()