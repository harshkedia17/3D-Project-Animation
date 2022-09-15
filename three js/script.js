import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { controls } from './movement.js';
import './movement.js';
import desert from '../img/desert.jpg'
import * as skeletonUtils from '../node_modules/three/examples/jsm/utils/SkeletonUtils.js'

//renderer
const renderer=new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;

document.body.appendChild(renderer.domElement);

// Scene and camera
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,10,20);

//orbit Contols
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.update();


const textureLoader=new THREE.TextureLoader();
scene.background=textureLoader.load(desert);

//Plane
const plane=new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({map:textureLoader.load(desert),
        side:THREE.DoubleSide
    })
)
plane.rotateX(-Math.PI/2)
plane.receiveShadow=true;
scene.add(plane);


//Model Loader
const loader=new GLTFLoader();
let contols;
const url=new URL('../model/Soldier.glb',import.meta.url);
loader.load(url.href,(gltf)=>{
    console.log('call')
    const model=gltf.scene;
    model.traverse(obj=>{obj.castShadow=true;})
    const clone1=skeletonUtils.clone(model)
    clone1.position.set(-1,0,0)
    const clone2=skeletonUtils.clone(model)
    clone2.position.set(1,0,0)
    scene.add(clone1);
    scene.add(clone2);

    const mixer1=new THREE.AnimationMixer(clone1);
    const mixer2=new THREE.AnimationMixer(clone2);
    const clips=gltf.animations;
    const animationMap=new Map();
    clips.forEach(clip=>{
        if(clip.name!="TPose"){
            animationMap.set(clip.name,[mixer1.clipAction(clip),mixer2.clipAction(clip)]);
        }
    })
    contols=new controls([clone1,clone2],animationMap,[mixer1,mixer2],['Idle','Idle'],camera,orbitControls);
})


const keyPressed={}
window.addEventListener('keydown',(e)=>{
    if(e.shiftKey && controls){
        contols.toggleShift(e.code);
    }
    else{
        keyPressed[e.key.toLowerCase()]=true;
    }
})
console.log('hello')

window.addEventListener('keyup',(e)=>{
    keyPressed[e.key.toLowerCase()]=false;
})

const clock=new THREE.Clock();

// lights
const directionLight=new THREE.DirectionalLight('white',1);
directionLight.castShadow=true;
directionLight.position.set(0,40,40);
directionLight.shadow.camera.left=50
directionLight.shadow.camera.right=-50
directionLight.shadow.camera.top=50
directionLight.shadow.camera.bottom=-50
directionLight.shadow.mapSize.width = 4096;
directionLight.shadow.mapSize.height = 4096;
scene.add(directionLight);
scene.add(new THREE.AmbientLight('white',0.5))

//Animate Function
function animate(){
    const time=clock.getDelta();
    if(contols){
    contols.update(time,keyPressed,0);
    contols.update(time,keyPressed,1);}
    renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);

//resize 
window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
})