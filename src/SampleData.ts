import * as p5 from "p5";

import {Scene} from "./Scene";
import {SENode, SEBeam} from "./SceneElement";

export function loadDesignFeasible(p:p5, scene:Scene) {
    const mid = Math.floor(p.width / 2 / 100) * 100;

    scene.clear();
    scene.addElement(new SENode(p.createVector(mid - 100,600),true));  // 0
    scene.addElement(new SENode(p.createVector(mid + 100,600),true));  // 1

    scene.addElement(new SENode(p.createVector(mid - 100,500),false)); // 2
    scene.addElement(new SENode(p.createVector(mid + 100,500),false)); // 3
    scene.addElement(new SENode(p.createVector(mid - 100,400),false)); // 4
    scene.addElement(new SENode(p.createVector(mid + 100,400),false)); // 5

    scene.addElement(new SEBeam(scene.nodes[0],scene.nodes[2]));
    scene.addElement(new SEBeam(scene.nodes[1],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[2],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[4],scene.nodes[5]));
    scene.addElement(new SEBeam(scene.nodes[2],scene.nodes[4]));
    scene.addElement(new SEBeam(scene.nodes[3],scene.nodes[5]));

    scene.addElement(new SEBeam(scene.nodes[0],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[1],scene.nodes[2]));

    scene.addElement(new SEBeam(scene.nodes[2],scene.nodes[5]));
    scene.addElement(new SEBeam(scene.nodes[3],scene.nodes[4]));
}

export function loadDesignInfeasible(p:p5, scene:Scene) {
    const mid = Math.floor(p.width / 2 / 100) * 100;
    scene.clear();
    scene.addElement(new SENode(p.createVector(mid - 100,600),true));  // 0
    scene.addElement(new SENode(p.createVector(mid + 100,600),true));  // 1

    scene.addElement(new SENode(p.createVector(mid - 100,500),false)); // 2
    scene.addElement(new SENode(p.createVector(mid + 100,500),false)); // 3
    scene.addElement(new SENode(p.createVector(mid - 100,400),false)); // 4
    scene.addElement(new SENode(p.createVector(mid + 100,400),false)); // 5

    scene.addElement(new SENode(p.createVector(mid ,100),false)); // 6

    scene.addElement(new SEBeam(scene.nodes[0],scene.nodes[2]));
    scene.addElement(new SEBeam(scene.nodes[1],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[2],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[4],scene.nodes[5]));
    scene.addElement(new SEBeam(scene.nodes[2],scene.nodes[4]));
    scene.addElement(new SEBeam(scene.nodes[3],scene.nodes[5]));

    scene.addElement(new SEBeam(scene.nodes[0],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[1],scene.nodes[2]));

    scene.addElement(new SEBeam(scene.nodes[2],scene.nodes[5]));
    scene.addElement(new SEBeam(scene.nodes[3],scene.nodes[4]));

    scene.addElement(new SEBeam(scene.nodes[6],scene.nodes[0]));
    scene.addElement(new SEBeam(scene.nodes[6],scene.nodes[1]));
    scene.addElement(new SEBeam(scene.nodes[6],scene.nodes[2]));
    scene.addElement(new SEBeam(scene.nodes[6],scene.nodes[3]));
    scene.addElement(new SEBeam(scene.nodes[6],scene.nodes[4]));
    scene.addElement(new SEBeam(scene.nodes[6],scene.nodes[5]));
}