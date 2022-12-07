abstract class SceneElement {
    static nodeSize:number = 20;
    
    position: p5.Vector;
    visible: boolean = true;

    

    constructor(position: p5.Vector) {
        this.position = position;
    }

    abstract draw(): void;
}

class SESupport extends SceneElement {
    draw(): void {
        if (!this.visible) {
            return;
        }
        fill(128);
        ellipse(this.position.x, this.position.y, SceneElement.nodeSize,SceneElement.nodeSize);
    }
}

class SENode extends SceneElement {
    draw(): void {
        if (!this.visible) {
            return;
        }
        fill(20,20,255);
        ellipse(this.position.x, this.position.y, SceneElement.nodeSize,SceneElement.nodeSize);
    }
}