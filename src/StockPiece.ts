import {p} from "./sketch";
import { SceneElement, SEBeam } from "./SceneElement";
import { Scene } from "./Scene";
import { Vector } from "p5";

export class StockPiece {
    size:number;

    matchedBeams:SEBeam[] = [];
    

    constructor(size:number) {
        this.size = size;
    }

    
    draw(scene:Scene, startX:number) {
        let stockWidth:number = 10;
        let startY = p.height - 20 - this.size;
        if (this.matchedBeams.length > 0) {
            p.fill(50);
        }
        else {
            p.fill(100);
        }
        
        p.stroke(0);
        p.rectMode(p.CORNER);
        p.rect(startX,startY,stockWidth,this.size);

        let startMatchY = startY;
        for (let beam of this.matchedBeams) {
            p.fill( scene.designPartsArray[beam.designPartId].color);
            p.stroke(0);
            p.rect(startX + 2, startMatchY + 2, stockWidth - 4, beam.restLength - 4);
            startMatchY += beam.restLength;

            
        }
    }

    drawMatchLines(scene:Scene, startX:number, selectedElement:SceneElement) {
        let stockWidth:number = 10;
        let startY = p.height - 20 - this.size;
        let startMatchY = startY;

        for (let beam of this.matchedBeams) {
            let midPoint:Vector = beam.getMidPoint();

            if (selectedElement && selectedElement.equals(beam)) {
                p.stroke(255);
                p.strokeWeight(2);
            }
            else {
                p.stroke(0,128);
                p.strokeWeight(1)
            }

            
            p.line(startX + stockWidth / 2, startMatchY + beam.restLength / 2, midPoint.x, midPoint.y);
            
            startMatchY += beam.restLength;

            
        }
    }
}