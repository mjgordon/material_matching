import * as p5 from "p5";

import {Scene} from "./Scene";


export function loadDesignBridge(p:p5, scene:Scene) {
    const midW = Math.round(p.width / 2 / 100) * 100;
    const midH = Math.round(p.height / 2 / 100) * 100;

    scene.clear();

    scene.addNode(midW - 300, midH, true); // 0
    scene.addNode(midW - 200, midH, false); // 1
    scene.addNode(midW - 100, midH, false); // 2
    scene.addNode(midW, midH, false); // 3
    scene.addNode(midW + 100, midH, false); // 4
    scene.addNode(midW + 200, midH, false); // 5
    scene.addNode(midW + 300, midH, true); // 6

    scene.addNode(midW - 200, midH - 100, false); // 7
    scene.addNode(midW - 100, midH - 150, false); // 8
    scene.addNode(midW, midH - 200, false); // 9
    scene.addNode(midW + 100, midH - 150, false); // 10
    scene.addNode(midW + 200, midH - 100, false); // 11

    scene.addBeam(0,1);
    scene.addBeam(1,2);
    scene.addBeam(2,3);
    scene.addBeam(3,4);
    scene.addBeam(4,5);
    scene.addBeam(5,6);

    scene.addBeam(0,7);
    scene.addBeam(7,8);
    scene.addBeam(8,9);
    scene.addBeam(9,10);
    scene.addBeam(10,11);
    scene.addBeam(11,6);

    scene.addBeam(1,8);
    scene.addBeam(2,9);
    scene.addBeam(4,9);
    scene.addBeam(5,10);

    scene.addBeam(1,7);
    scene.addBeam(2,8);
    scene.addBeam(3,9);
    scene.addBeam(4,10);
    scene.addBeam(5,11);
}


export function loadDesignFeasible(p:p5, scene:Scene) {
    const mid = Math.floor(p.width / 2 / 100) * 100;

    scene.clear();

    scene.addNode(mid - 100,600, true); // 0
    scene.addNode(mid + 100,600, true); // 1

    scene.addNode(mid - 100,500, false); // 2
    scene.addNode(mid + 100,500, false); // 3
    scene.addNode(mid - 100,400, false); // 4
    scene.addNode(mid + 100,400, false); // 5

    scene.addBeam(0,2);
    scene.addBeam(1,3);
    scene.addBeam(2,3);
    scene.addBeam(4,5);
    scene.addBeam(2,4);
    scene.addBeam(3,5);
    
    scene.addBeam(0,3);
    scene.addBeam(1,2);
    scene.addBeam(2,5);
    scene.addBeam(3,4);
}


export function loadDesignInfeasible(p:p5, scene:Scene) {
    const mid = Math.floor(p.width / 2 / 100) * 100;
    scene.clear();

    scene.addNode(mid - 100,600, true); // 0
    scene.addNode(mid + 100,600, true); // 1

    scene.addNode(mid - 100,500, false); // 2
    scene.addNode(mid + 100,500, false); // 3
    scene.addNode(mid - 100,400, false); // 4
    scene.addNode(mid + 100,400, false); // 5

    scene.addNode(mid,100, false); // 6

    scene.addBeam(0,2);
    scene.addBeam(1,3);
    scene.addBeam(2,3);
    scene.addBeam(4,5);
    scene.addBeam(2,4);
    scene.addBeam(3,5);
    
    scene.addBeam(0,3);
    scene.addBeam(1,2);
    scene.addBeam(2,5);
    scene.addBeam(3,4);

    scene.addBeam(6,0);
    scene.addBeam(6,1);
    scene.addBeam(6,2);
    scene.addBeam(6,3);
    scene.addBeam(6,4);
    scene.addBeam(6,5);    
}