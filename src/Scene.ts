enum SimMode {
    STOPPED = "Stopped",
    PLAYING = "Playing",
    PAUSED = "Paused"
}

class Scene{
    sceneElements: SceneElement[] = [];
    nodes: SENode[] = [];
    beams: SEBeam[] = [];

    selectedElement:SceneElement = null;

    gravity:number = 0.02;

    sceneWidth: number = 800;
    sceneHeight: number = 600;

    simMode:SimMode = SimMode.STOPPED;

    draw() {
        for (const se of this.beams) {
            se.draw(se.equals(this.selectedElement));
        }
        for (const se of this.nodes) {
            se.draw(se.equals(this.selectedElement));
        }
    }

    addElement(se:SceneElement) {
        this.sceneElements.push(se);

        if (se instanceof SENode) {
            this.nodes.push(se);
        }
        else if (se instanceof SEBeam) {
            this.beams.push(se);
        }
    }

    clear() {
        this.sceneElements = [];
        this.nodes = [];
        this.beams = [];
    }

    reset() {
        for (const se of this.sceneElements) {
            se.simInit();
        }
    }

    tick() {
        for (const node of this.nodes) {
            node.simAcceleration.y = this.gravity;
            node.simTick();

            if (node.position.y > height) {
                node.position.y = height;
            }
        }

        for (const beam of this.beams) {
            beam.simTick();
        }
    }

    switchSimMode(mode:SimMode):void {
        if (this.simMode == SimMode.STOPPED && mode == SimMode.PLAYING) {
            this.reset();
        }
        this.simMode = mode;
        simLabel.html(mode);
    }


    pickElement(vMouse:p5.Vector):SceneElement {
        let clickRadius:number = 20;
        let bestElement:SceneElement = null;
        let bestDist:number = 10000;

        for (const beam of this.beams) {
            const [beamPoint, d] = beam.getClosestPoint(vMouse);
            if (d < clickRadius) {
                if (bestElement == null || d < bestDist) {
                    bestElement = beam;
                    bestDist = d;
                }
            }
        }
        
        if (bestDist < clickRadius) {
            bestDist = clickRadius;
        }

        for (const node of this.nodes) {
            let d:number = vMouse.dist(node.simPosition);
            if (d < clickRadius) {
                if (bestElement == null || d < bestDist) {
                    bestElement = node;
                    bestDist = d;
                }
            }
        }

        return bestElement;
    }

    pickNode(vMouse:p5.Vector):SENode {
        let clickRadius:number = 20;
        let bestNode:SENode = null;
        let bestDist:number = 10000;

        for (const node of this.nodes) {
            let d:number = vMouse.dist(node.simPosition);
            if (d < clickRadius) {
                if (bestNode == null || d < bestDist) {
                    bestNode = node;
                    bestDist = d;
                }
            }
        }
        

        return bestNode
    }
}