import {p} from "./sketch";
import { Color } from "p5";

const viridisRaw:string[] = ["#fde725",
"#e5e419",
"#c8e020",
"#addc30",
"#90d743",
"#75d054",
"#5ec962",
"#48c16e",
"#35b779",
"#28ae80",
"#20a486",
"#1f9a8a",
"#21918c",
"#24868e",
"#287c8e",
"#2c728e",
"#31688e",
"#365d8d",
"#3b528b",
"#404688",
"#443983",
"#472d7b",
"#481f70",
"#471063",
"#440154"];


var viridisColors:Color[] = [];

export function setupPalette():void {
    viridisColors = viridisRaw.map(function(s) {return p.color(s)});
}


export function sampleViridis(input:number):Color {
    const colorCount = viridisColors.length;
    input = p.constrain(input,0,1);
    const tick = 1.0 / colorCount;
    const start = Math.floor(input / tick);
    const offsetFactor = (input - (start * tick)) / tick;

    if (start == colorCount) {
        return viridisColors[colorCount - 1];
    }
    
    return p.lerpColor(viridisColors[start],viridisColors[start + 1], offsetFactor);
}