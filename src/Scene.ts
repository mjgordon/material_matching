enum SimMode {
    STOPPED = "Stopped",
    PLAYING = "Playing",
    PAUSED = "Paused"
}

class Scene{
    sceneElements: SceneElement[] = [];
    nodes: SENode[] = [];
    beams: SEBeam[] = [];

    stock: StockPiece[] = [];

    selectedElement:SceneElement = null;

    gravity:number = 0.02;

    sceneWidth: number = 800;
    sceneHeight: number = 600;

    simMode:SimMode = SimMode.STOPPED;

    constructor() {
        this.loadDefaultStock();
    }

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


    /**
     * Deletes all design elements in the scene
     */
    clear() {
        this.sceneElements = [];
        this.nodes = [];
        this.beams = [];
    }


    /**
     * Resets the physics simulation of the scene
     */
    reset() {
        for (const se of this.sceneElements) {
            se.simInit();
        }
    }


    /**
     * Advances the physics simulation
     */
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


    /**
     * Returns a map describing the number of each design part type
     */
    getDesignParts():Map<string,number> {
        let hashMap:Map<string, number> = new Map<string,number>();

        for (const beam of this.beams) {

            let length:string = beam.restLength.toFixed(3).toString();

            if (hashMap.has(length)) {
                hashMap.set(length,hashMap.get(length) + 1);
            }
            else {
                hashMap.set(length,1);
            }
        }

        return hashMap;
    }


    /**
     * Sets the stock to demo/testing values
     */
    loadDefaultStock() {
        this.stock = [];

        this.stock.push(new StockPiece(500));
        this.stock.push(new StockPiece(500));
        this.stock.push(new StockPiece(400));
        this.stock.push(new StockPiece(400));
        this.stock.push(new StockPiece(300));
        this.stock.push(new StockPiece(300));
        this.stock.push(new StockPiece(200));
        this.stock.push(new StockPiece(200));
        this.stock.push(new StockPiece(100));
        this.stock.push(new StockPiece(100));
    }
}