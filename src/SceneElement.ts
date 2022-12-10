abstract class SceneElement {
    visible: boolean = true;

    abstract draw(): void;
    abstract simInit():void;
    abstract simTick():void;
}


class SENode extends SceneElement {
    support:boolean;

    static simDrag = 0.99;
    static simMaxSpeed = 20;

    static nodeSize:number = 20;
    
    position: p5.Vector;

    simPosition: p5.Vector;
    simVelocity: p5.Vector;
    simAcceleration: p5.Vector;

    constructor(position: p5.Vector, support:boolean) {
        super();
        this.position = position;
        this.simInit();
        this.support = support;
    }

    draw(): void {
        if (!this.visible) {
            return;
        }
        if (this.support) {
            fill(128);
        }
        else {
            fill(20,20,255);
        }
        
        ellipse(this.simPosition.x, this.simPosition.y, SENode.nodeSize,SENode.nodeSize);
    }

    simInit():void {
        this.simPosition = this.position.copy();
        this.simVelocity = createVector(0,0);
        this.simAcceleration = createVector(0,0);
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
    }

    simSetAcceleration(accel:p5.Vector):void {
        this.simAcceleration.set(accel);
    }
}

class SEBeam extends SceneElement {
    childA:SENode;
    childB:SENode;

    dummyB:p5.Vector;

    constructor(childA:SENode, childB:SENode) {
        super();
        this.childA = childA;
        this.childB = childB;
    }

    draw(): void {
        if (!this.visible) {
            return;
        }

        if (this.childA) {
            stroke(0);
            strokeWeight(3);
            if (this.childB) {
                line(this.childA.simPosition.x,this.childA.simPosition.y, this.childB.simPosition.x,this.childB.simPosition.y);
            }
            else {
                line(this.childA.position.x,this.childA.position.y, this.dummyB.x,this.dummyB.y);
            }
        }
    }

    simInit():void {

    }

    simTick():void {

    }
}