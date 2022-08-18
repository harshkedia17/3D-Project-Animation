import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/orbitcontrols';

export class controls{
    constructor(models,animationMap,mixers,currentStates,camera,orbit){
        this.models=models;
        this.animationMap=animationMap;
        this.currentStates=currentStates;
        this.mixers=mixers;
        this.animationMap.forEach((value,key)=>{
            if(key==this.currentStates[0]){
                value[0].play();
            }
            if(key==this.currentStates[1]){
                value[1].play();}
        })
        this.shifts=[false,false];
        this.keys=[['w','a','s','d'],['arrowup'
            ,'arrowleft'
            ,'arrowdown'
            ,'arrowright']];
        this.fadeDuration=0.2;
        this.camera=camera;
        this.orbit=orbit;
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuarternion= new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();
        this.walkSpeed=2;
        this.runSpeed=5;
    }

    toggleShift(code){
        if(code == 'ShiftLeft')
        this.shifts[0]=!this.shifts[0];
        else{
            this.shifts[1]=!this.shifts[1];
        }
    }
    update(delta,keyPressed,i) {
        const iskeyPressed=this.keys[i].some(key=>{
            if(keyPressed[key]){
                return true;
            }
        })
        let play="";
        if(iskeyPressed && this.shifts[i]) play="Run";
        else if(iskeyPressed) play="Walk";
        else play="Idle";

        if(this.currentStates[i] != play){
            const next=this.animationMap.get(play);
            const prev=this.animationMap.get(this.currentStates[i]);

            prev[i].fadeOut(this.fadeDuration);
            next[i].reset().fadeIn(this.fadeDuration).play();
            // console.log(next);
            this.currentStates[i]=play;
        }
        this.mixers[i].update(delta);

        if(this.currentStates[i] == 'Walk' || this.currentStates[i] == 'Run'){
            const Ycameradirection =Math.atan2(
                this.camera.position.x-this.models[i].position.x,
                this.camera.position.y-this.models[i].position.y
            )
            const directionOffset=this.directionOffSet(keyPressed,i);
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle,Ycameradirection+directionOffset); // x y z w coordinate
            this.models[i].quaternion.rotateTowards(this.rotateQuarternion,2); 

            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
    

            const speed=this.currentStates[i] == 'Run' ? this.runSpeed :this.walkSpeed;

                const moveX=this.walkDirection.x*speed*delta;
                const movez=this.walkDirection.z*speed*delta;
                this.models[i].position.x +=moveX;
                this.models[i].position.z +=movez;
                // this.moveCamera(moveX,movez,i);
        }
    }

    moveCamera(x,z,i){
        this.camera.position.x +=x;
        this.camera.position.z +=z;

        this.cameraTarget.x = this.models[i].position.x
        this.cameraTarget.y = this.models[i].position.y + 1
        this.cameraTarget.z = this.models[i].position.z
        this.orbit.target = this.cameraTarget
    }

    directionOffSet(keyPressed,i){
        var direction=0; 
        
        if(keyPressed[this.keys[i][0]]){
            if(keyPressed[this.keys[i][1]]){
                direction=Math.PI/4;
            }
            else if(keyPressed[this.keys[i][3]]){
                direction=-Math.PI/4
            }
        }
        else if(keyPressed[this.keys[i][2]]){
            if(keyPressed[this.keys[i][1]]){
                direction=Math.PI/4+Math.PI/2;
            }
            else if(keyPressed[this.keys[i][3]]){
                direction=-Math.PI/4-Math.PI/2
            }
            else{
                direction=Math.PI;
            }
        }
        else if(keyPressed[this.keys[i][1]]) direction=Math.PI/2;
        else if(keyPressed[this.keys[i][3]]) direction=-Math.PI/2;
        return direction;
    }
}