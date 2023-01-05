import {p,simLabel} from "./sketch";
import {SceneElement, SENode, SEBeam} from "./SceneElement";
import { Vector, Color } from "p5";
import { StockPiece } from "./StockPiece";
import { debugPort } from "process";



export enum SimMode {
    STOPPED = "Stopped",
    PLAYING = "Playing",
    PAUSED = "Paused"
}

export class Scene{
    sceneElements: SceneElement[] = [];
    nodes: SENode[] = [];
    beams: SEBeam[] = [];

    stock: StockPiece[] = [];

    designPartsArray:DesignPart[];

    selectedElement:SceneElement = null;

    gravity:number = 0.02;

    sceneWidth: number = 800;
    sceneHeight: number = 600;

    simMode:SimMode = SimMode.STOPPED;

    currentSolution:number[] = null;

    constructor() {
        this.loadDefaultStock();
    }

    draw() {
        for (const se of this.beams) {
            se.draw(se.equals(this.selectedElement), this);
        }
        for (const se of this.nodes) {
            se.draw(se.equals(this.selectedElement), this);
        }

        let startX = 100;
        let startY = p.height - 20;
        for (const sp of this.stock) {
            p.fill(100);
            p.stroke(0);
            p.rectMode(p.CORNER);
            p.rect(startX,startY - sp.size,10,sp.size);
            startX += 20;
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

            if (node.position.y > p.height) {
                node.position.y = p.height;
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


    pickElement(vMouse:Vector):SceneElement {
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

    pickNode(vMouse:Vector):SENode {
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
     * Update part design mapping
     */
    updateDesignParts() {
        p.colorMode(p.HSB,1.0);
        let designParts:Map<string,DesignPart> = new Map<string,DesignPart>();
        this.designPartsArray = [];

        let partTypeCounter:number = 0;

        for (const beam of this.beams) {

            let lengthString:string = beam.restLength.toFixed(3).toString();

            let dp:DesignPart;

            if (!designParts.has(lengthString)) {
                dp = new DesignPart(partTypeCounter, lengthString, beam.restLength);
                designParts.set(lengthString,dp);
                this.designPartsArray.push(dp);
                partTypeCounter += 1;
                
            }
            else {
                dp = designParts.get(lengthString);
            }
            dp.count += 1;
            beam.designPartId = dp.typeId;
        }

        for (var i = 0; i < this.designPartsArray.length; i++) {
            this.designPartsArray[i].color = p.color(1.0 * i / this.designPartsArray.length, 1,1);
        }
        p.colorMode(p.RGB,255);
    }


    /**
     * Return the lengths of the current stock pieces as an array of numbers
     */
    getStockLengths():number[] {
        return this.stock.map(s => (s.size));
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

export class DesignPart {
    count:number = 0;
    length:number;
    lengthRep: string;
    color:Color;
    typeId:number;

    constructor(typeId:number, lengthRep:string, length:number) {
        this.typeId = typeId;
        this.lengthRep = lengthRep;
        this.length = length;
    }

}