import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { controls } from './movement';
import road from '../img/desert.jpg'
const renderer=new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,5,10);
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
    scene.add(model);

    const mixer=new THREE.AnimationMixer(model);
    const clips=gltf.animations;
    const animationMap=new Map();
    clips.forEach(clip=>{
        if(clip.name!="TPose"){
            animationMap.set(clip.name,mixer.clipAction(clip));
        }
    })
    contols=new controls(model,animationMap,mixer,'Idle',camera,orbitControls);
})

const keyPressed={}

window.addEventListener('keydown',(e)=>{
    if(e.shiftKey && controls){
        contols.toggleShift();
    }
    else{
        keyPressed[e.key.toUpperCase()]=true;
    }
})

window.addEventListener('keyup',(e)=>{
    keyPressed[e.key.toUpperCase()]=false;
})

const clock=new THREE.Clock();
function animate(){
    if(contols){
    contols.update(clock.getDelta(),keyPressed);}
    renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
})