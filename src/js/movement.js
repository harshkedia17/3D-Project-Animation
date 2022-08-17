import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/orbitcontrols';

export class controls{
    constructor(model,animationMap,mixer,currentState,camera,orbit){
        this.model=model;
        this.animationMap=animationMap;
        this.currentState=currentState;
        this.mixer=mixer;
        this.animationMap.forEach((value,key)=>{
            if(key==this.currentState){
                value.play();
            }
        })
        this.shift=false;
        this.keys=['W','A','S','D'];
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

    toggleShift(){
        this.shift=!this.shift;
    }
    update(delta,keyPressed) {
        const iskeyPressed=this.keys.some(key=>{
            if(keyPressed[key]){
                return true;
            }
        })
        let play="";
        if(iskeyPressed && this.shift) play="Run";
        else if(iskeyPressed) play="Walk";
        else play="Idle";

        if(this.currentState != play){
            const next=this.animationMap.get(play);
            const prev=this.animationMap.get(this.currentState);

            prev.fadeOut(this.fadeDuration);
            next.reset().fadeIn(this.fadeDuration).play();
            this.currentState=play;
        }
        this.mixer.update(delta);

        if(this.currentState == 'Walk' || this.currentState == 'Run'){
            const Ycameradirection =Math.atan2(
                this.camera.position.x-this.model.position.x,
                this.camera.position.y-this.model.position.y
            )
            const directionOffset=this.directionOffSet(keyPressed);
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle,Ycameradirection+directionOffset); // x y z w coordinate
            this.model.quaternion.rotateTowards(this.rotateQuarternion,2); 

            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
    

            const speed=this.currentState == 'Run' ? this.runSpeed :this.walkSpeed;

                const moveX=this.walkDirection.x*speed*delta;
                const movez=this.walkDirection.z*speed*delta;
                console.log("movex"+moveX)
                console.log("movez"+movez)
                this.model.position.x +=moveX;
                this.model.position.z +=movez;
                this.moveCamera(moveX,movez);
        }
    }

    moveCamera(x,z){
        this.camera.position.x +=x;
        this.camera.position.z +=z;

        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y + 1
        this.cameraTarget.z = this.model.position.z
        this.orbit.target = this.cameraTarget
    }

    directionOffSet(keyPressed){
        var direction=0; 
        
        if(keyPressed['W']){
            if(keyPressed['A']){
                direction=Math.PI/4;
            }
            else if(keyPressed['D']){
                direction=-Math.PI/4
            }
        }
        else if(keyPressed['S']){
            if(keyPressed['A']){
                direction=Math.PI/4+Math.PI/2;
            }
            else if(keyPressed['D']){
                direction=-Math.PI/4-Math.PI/2
            }
            else{
                direction=Math.PI;
            }
        }
        else if(keyPressed['A']) direction=Math.PI/2;
        else if(keyPressed['D']) direction=-Math.PI/2;
        return direction;
    }
}