import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { controls } from './movement';
import road from '../img/desert.jpg'
import * as skeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
const renderer=new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,10,20);
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.update();


const textureLoader=new THREE.TextureLoader();
scene.background=textureLoader.load(road);

const plane=new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({map:textureLoader.load(road),
    })
)
scene.add(new THREE.AmbientLight('white'));
plane.rotateX(-Math.PI/2)
scene.add(plane);

const loader=new GLTFLoader();
let contols;
const url=new URL('../model/Soldier.glb',import.meta.url);
loader.load(url.href,(gltf)=>{
    const model=gltf.scene;
    const clone1=skeletonUtils.clone(model)
    clone1.position.set(-1,0,0)
    const clone2=skeletonUtils.clone(model)
    clone2.position.set(1,0,0)
    // scene.add(model);
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
        // console.log(e.code)
        contols.toggleShift(e.code);
    }
    else{
        // console.log(e.key.toLowerCase());
        keyPressed[e.key.toLowerCase()]=true;
    }
})

window.addEventListener('keyup',(e)=>{
    keyPressed[e.key.toLowerCase()]=false;
})

const clock=new THREE.Clock();
function animate(){
    const time=clock.getDelta();
    if(contols){
    contols.update(time,keyPressed,0);
    contols.update(time,keyPressed,1);}
    renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
})