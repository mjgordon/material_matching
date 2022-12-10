enum SimMode {
    STOPPED,
    PLAYING,
    PAUSED
}

class Scene{
    sceneElements: SceneElement[] = [];
    nodes: SENode[] = [];
    beams: SEBeam[] = [];

    gravity:number = 0.02;

    sceneWidth: number = 800;
    sceneHeight: number = 600;

    simMode:SimMode = SimMode.STOPPED;


    draw() {
        this.beams.forEach(function(se) {
            se.draw();
        });
        this.nodes.forEach(function(se) {
            se.draw();
        });
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
    }

    reset() {
        this.nodes.forEach(function(node) {
            node.simInit();
        });
    }

    tick() {
        let gravity:number = this.gravity;
        this.nodes.forEach(function(node) {
            node.simAcceleration.y = gravity;
            node.simTick();

            if (node.position.y > height) {
                node.position.y = height;
            }
        });

        this.beams.forEach(function(beam) {
            beam.simTick();
        });
    }

    switchSimMode(mode:SimMode):void {
        if (this.simMode == SimMode.STOPPED && mode == SimMode.PLAYING) {
            this.sceneElements.forEach(function(se) {
                se.simInit();
              });
        }
        this.simMode = mode;
    }

    pickNode(vMouse:p5.Vector):SENode {
        let clickRadius:number = 20;
        let bestNode:SENode = null;
        let bestDist:number = 10000;

        this.nodes.forEach(function(n) {
            let d:number = vMouse.dist(n.simPosition);
            if (d < clickRadius) {
                if (bestNode == null || d < bestDist) {
                    bestNode = n;
                    bestDist = d;
                }
            }
        });

        return bestNode
    }
}