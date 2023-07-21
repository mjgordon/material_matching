import {Vector} from "p5";

import {p} from "./sketch";
import {Scene} from "./Scene";

export abstract class SceneElement {
    static counter:number = 0;

    visible:boolean = true;
    id:number = -1;

    constructor() {
        this.id = SceneElement.counter;
        SceneElement.counter += 1;
    }

    equals(se:SceneElement):boolean {
        if (se == null) {
            return false;
        }
        return this.id == se.id;
    }

    abstract draw(isSelected:boolean, scene:Scene): void;
    abstract simInit():void;
    abstract simTick():void;
    abstract getDisplayName():string;
}


export class SENode extends SceneElement {
    support:boolean;

    static simDrag = 0.99;
    static simMaxSpeed = 20;

    static nodeSize:number = 20;
    
    position: Vector;

    simPosition: Vector;
    simVelocity: Vector;
    simAcceleration: Vector;

    constructor(position: Vector, support:boolean) {
        super();
        this.position = position;
        this.simInit();
        this.support = support;
    }

    draw(isSelected:boolean, scene:Scene): void {
        if (!this.visible) {
            return;
        }

        if (isSelected) {
            p.stroke(255);
            p.strokeWeight(2);
        }
        else {
            p.stroke(0);
            p.strokeWeight(1);
        }
        
        
        if (this.support) {
            p.fill(64);
        }
        else {
            p.fill(20,20,255);
        }
        
        p.ellipse(this.simPosition.x, this.simPosition.y, SENode.nodeSize,SENode.nodeSize);
    }

    simInit():void {
        this.simPosition = this.position.copy();
        this.simVelocity = p.createVector(0,0);
        this.simAcceleration = p.createVector(0,0);
    }

    simTick():void {
        if (this.support) {
            return;
        }
        this.simVelocity.mult(SENode.simDrag);
        this.simVelocity.add(this.simAcceleration);
        if (this.simVelocity.mag() > SENode.simMaxSpeed) {
            this.simVelocity.setMag(SENode.simMaxSpeed);
        }
        this.simPosition.add(this.simVelocity);
        this.simAcceleration.set(0,0);
    }

    simSetAcceleration(accel:Vector):void {
        this.simAcceleration.set(accel);
    }

    getDisplayName(): string {
        return(this.support ? "Support" : "Node");
    }
}

export class SEBeam extends SceneElement {
    childA:SENode;
    childB:SENode;

    dummyB:Vector;

    designPartId:number;

    /**
     * Default length of the beam
     */
    restLength:number = 100;

    strength:number = 0.1;

    constructor(childA:SENode, childB:SENode) {
        super();
        this.childA = childA;
        this.childB = childB;

        if (childA && childB) {
            this.restLength = childA.position.dist(childB.position);
        }
    }

    draw(isSelected:boolean, scene:Scene): void {
        if (!this.visible) {
            return;
        }

        if (this.childA) {
            p.strokeWeight(4);
            if (isSelected) {
                p.stroke(255);
            }
            else {
                p.stroke(0);
            }
            if (this.childB) {
                p.line(this.childA.simPosition.x,this.childA.simPosition.y, this.childB.simPosition.x,this.childB.simPosition.y);
            }
            else {
                p.line(this.childA.position.x,this.childA.position.y, this.dummyB.x,this.dummyB.y);
            }

            if (this.designPartId != null) {
                p.strokeWeight(2);
                p.stroke(scene.designPartsArray[this.designPartId].color);
            }
            
            
            
            if (this.childB) {
                p.line(this.childA.simPosition.x,this.childA.simPosition.y, this.childB.simPosition.x,this.childB.simPosition.y);
            }
            else {
                p.line(this.childA.position.x,this.childA.position.y, this.dummyB.x,this.dummyB.y);
            }
        }
    }

    simInit():void {

    }

    simTick():void {
        let childDelta:Vector = Vector.sub(this.childB.simPosition, this.childA.simPosition);
        let deltaLength:number = this.restLength - childDelta.mag();

        if (Math.abs(deltaLength) > 1) {
            var push:number = this.strength * Math.sign(deltaLength);
            //push = deltaLength * 0.1;
            if (!this.childA.support && !this.childB.support) {
                var pushDelta = childDelta.copy().normalize().mult(-push / 2);
                this.childA.simVelocity.add(pushDelta);

                var pushDelta = childDelta.copy().normalize().mult(push / 2);
                this.childB.simVelocity.add(pushDelta);
            }
            if (!this.childA.support) {
                var pushDelta = childDelta.copy().normalize().mult(-push);
                this.childA.simVelocity.add(pushDelta);
            }
            if (!this.childB.support) {
                var pushDelta = childDelta.copy().normalize().mult(push);
                this.childB.simVelocity.add(pushDelta);
            }
        }

    }

    getDisplayName(): string {
        return("Beam");
    }

    getClosestPoint(vec:Vector):[Vector,number] {
        const a:Vector = this.childA.position;
        const b:Vector = this.childB.position;
        const l2:number = this.distSquared(a,b);
        if (l2 == 0.0) return([a, vec.dist(a)]);
        const t:number = Math.max(0, Math.min(1, Vector.dot(Vector.sub(vec,a), Vector.sub(b,a)) / l2));
        const projection:Vector = Vector.add(a, Vector.sub(b, a).mult(t));
        return( [ projection, projection.dist(vec)]);
    }

    getMidPoint():Vector {
        return Vector.add(this.childA.position, this.childB.position).div(2);
    }


    /**
     * Refactor where this lives
     * @param a 
     * @param b 
     * @returns 
     */
    distSquared(a:Vector, b: Vector) {
        return (Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2) + Math.pow(a.z - b.z,2));
    }
}