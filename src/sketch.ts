import * as p5 from "p5";

import {DesignPart, Scene, SimMode} from "./Scene";
import {SceneElement, SENode, SEBeam} from "./SceneElement";
import {connectToDispatcher, requestSolve} from "./socketio";

export let p:p5 = null;

let controlDiv: p5.Element = null;
export let scene:Scene = null;

let toolLabel: p5.Element = null;
export let simLabel: p5.Element = null;

let selectedNameLabel: p5.Element = null;

let designPartTypeDiv: p5.Element = null;
let stockPieceDiv: p5.Element = null;


enum MouseMode {
  EMPTY,
  PLACE_SUPPORT,
  PLACE_NODE,
  PLACE_BEAM_A,
  PLACE_BEAM_B
}

let currentMode: MouseMode = MouseMode.EMPTY;

let dummySupport: SENode;
let dummyNode: SENode;
let dummyBeam: SEBeam;

let mouseOverControl:boolean = false;

var sketch = (_p: p5) => {
  p = _p;
  _p.setup = () => {
    setup();
  };

  _p.draw = () => {
    draw();
  };

  _p.windowResized = () => {
    windowResized();
  };

  _p.mousePressed = () => {
    mousePressed();
  };

  _p.keyPressed = () => {
    keyPressed();
  }

};

new p5(sketch);


function setup() {
  console.log("🚀 - Setup initialized - P5 is running");
  p.createCanvas(p.windowWidth, p.windowHeight)
  p.rectMode(p.CENTER).noFill().frameRate(30);

  scene = new Scene();

  controlDiv = p.select("#controlDiv");
  controlDiv.mouseOver(function() {
    mouseOverControl = true;
    p.noCursor();
  });
  controlDiv.mouseOut(function() {
    mouseOverControl = false;
    p.cursor(p.ARROW);
  });

  toolLabel = p.select("#toolLabel");
  simLabel = p.select("#simLabel");

  selectedNameLabel = p.select("#selectedNameLabel");

  designPartTypeDiv = p.select("#matchingList");
  stockPieceDiv = p.select("#stockList");

  dummySupport = new SENode(p.createVector(-100,-100),true);
  dummySupport.visible = false;

  dummyNode = new SENode(p.createVector(-100,-100),false);
  dummyNode.visible = false;

  dummyBeam = new SEBeam(null,null);

  uiUpdateStockPieces();

  setupControl();

  connectToDispatcher();
}

function windowResized() {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
}


function draw() {
  p.background(127);
  
  p.stroke(255);
  p.strokeWeight(0.5);
  for (var x = 0; x < p.width; x+= 100) {
    p.line(x,0,x,p.height);
  }
  for (var y = 0; y < p.height; y+= 100) {
    p.line(0,y,p.width,y);
  }

  switch(currentMode) {
    case MouseMode.PLACE_SUPPORT:
      dummySupport.position.x = p.mouseX;
      dummySupport.position.y = p.mouseY;

      dummySupport.simPosition.x = p.mouseX;
      dummySupport.simPosition.y = p.mouseY;
      dummySupport.draw(false, scene);
    break;

    case MouseMode.PLACE_NODE:
      dummyNode.position.x = p.mouseX;
      dummyNode.position.y = p.mouseY;
      dummyNode.simPosition.x = p.mouseX;
      dummyNode.simPosition.y = p.mouseY;
      dummyNode.draw(false, scene);
    break;

    case MouseMode.PLACE_BEAM_B:
      dummyBeam.dummyB = p.createVector(p.mouseX, p.mouseY);
      dummyBeam.draw(false,scene);
    break;
  }

  if (scene.simMode == SimMode.PLAYING) {
    scene.tick();
  }

  scene.draw();
}


/**
 * Change the current selected element in the scene, including to null
 * @param se 
 */
function setSelectedElement(se:SceneElement):void {
  scene.selectedElement = se;
  if (se == null) {
    selectedNameLabel.html("");
  }
  else {
    let contentString = se.getDisplayName() + " " + se.id + "<br>";
    if (se instanceof SENode) {
      contentString += "Position : " + se.position.x + "," + se.position.y + "," + se.position.z;
    }
    else if (se instanceof SEBeam) {
      let restLength = p.int(se.restLength * 1000) / 1000.0;
      contentString += "Length : " + restLength;
    }
    selectedNameLabel.html( contentString);
  }
}


/**
 * Change the current MouseMode
 * @param mode
 */
function switchMode(mode: MouseMode) {
  currentMode = mode;
  dummySupport.visible = false;
  switch(currentMode) {
    case MouseMode.EMPTY:
      toolLabel.html("No Tool");
    break;
    case MouseMode.PLACE_SUPPORT:
      dummySupport.visible = true;
      toolLabel.html("Support");
    break;

    case MouseMode.PLACE_NODE:
      dummyNode.visible = true;
      toolLabel.html("Node");
    break;

    case MouseMode.PLACE_BEAM_A:
      dummyBeam = new SEBeam(null,null);
      dummyBeam.visible = true;
      toolLabel.html("Beam First Node");
    break;

    case MouseMode.PLACE_BEAM_B:
      dummyBeam.visible = true;
      toolLabel.html("Beam Second Node");
    break;
  }
}


function keyPressed() {
  if (p.keyCode == p.ESCAPE) {
    switchMode(MouseMode.EMPTY);
  }
  

  switch(p.key) {
    case 's':
      switchMode(MouseMode.PLACE_SUPPORT);
    break;

    case 'n':
      switchMode(MouseMode.PLACE_NODE);
    break;

    case 'b':
      switchMode(MouseMode.PLACE_BEAM_A);
    break;

    case ' ':
      switch(scene.simMode) {
        case SimMode.STOPPED:
          scene.switchSimMode(SimMode.PLAYING);
        break;
        case SimMode.PLAYING:
          scene.switchSimMode(SimMode.PAUSED);
        break;
        case SimMode.PAUSED:
          scene.switchSimMode(SimMode.PLAYING);
        break;
      }
    break;
  }
}

function mousePressed():void {
  if (mouseOverControl) {
    return;
  }

  switch(currentMode) {
    case MouseMode.EMPTY:
      var elementPick:SceneElement = scene.pickElement(p.createVector(p.mouseX,p.mouseY));
      setSelectedElement(elementPick);
    break;

    case MouseMode.PLACE_SUPPORT:
      scene.addElement(new SENode(p.createVector(p.mouseX, p.mouseY),true));
    break;

    case MouseMode.PLACE_NODE:
      scene.addElement(new SENode(p.createVector(p.mouseX, p.mouseY),false));
    break;

    case MouseMode.PLACE_BEAM_A:
      var nodePick:SENode = scene.pickNode(p.createVector(p.mouseX,p.mouseY));
      if (nodePick) {
        dummyBeam.childA = nodePick;
        switchMode(MouseMode.PLACE_BEAM_B);
      }
    break;

    case MouseMode.PLACE_BEAM_B:
      var nodePick:SENode = scene.pickNode(p.createVector(p.mouseX,p.mouseY));
      if (nodePick) {
        dummyBeam.childB = nodePick;
        dummyBeam.restLength = dummyBeam.childA.position.dist(dummyBeam.childB.position);
        scene.addElement(dummyBeam);
        switchMode(MouseMode.PLACE_BEAM_A);
        uiUpdateDesignParts();
      }
    break;
  }
}


/**
 * Updates the html list showing the current design parts
 */
function uiUpdateDesignParts() {
  scene.updateDesignParts();

  let contentString: string = "<table><tr><th></th><th>id</th><th>Length</th><th></th><th>Count</th></tr>";

  for (const dp of scene.designPartsArray) {
    contentString += "<tr><td><div style='width:20px; height:20px; background-color:" + dp.color.toString('#rrggbb') + "'></div>";
    contentString += "<td>" + dp.typeId + "</td><td>" + dp.lengthRep + "</td><td>&nbsp:&nbsp</td><td>" + dp.count + "</td></tr>";
  }

  contentString += "</table>";

  designPartTypeDiv.html(contentString);
}


/**
 * Updates the html list showing the current stock pieces
 */
function uiUpdateStockPieces() {
  let contentString: string = "<table><tr><th>Id</th><th></th><th>Length</th></tr>";
  let counter = 0;
  
  for (const sp of scene.stock) {
    contentString += "<tr><td>" + counter + "</td><td>&nbsp:&nbsp</td><td>" + sp.size + "</td></tr>"
    counter += 1;
  }
  contentString += "</table>";

  stockPieceDiv.html(contentString);
}


/**
 * Attach functionality to HTML Objects
 */
function setupControl() {
  let buttonSupport = p.select("#buttonCreateSupport");
  buttonSupport.mousePressed(function() {
    switchMode(MouseMode.PLACE_SUPPORT);
  });

  let buttonNode = p.select("#buttonCreateNode");
  buttonNode.mousePressed(function() {
    switchMode(MouseMode.PLACE_NODE);
  });

  let buttonBeam = p.select("#buttonCreateBeam");
  buttonBeam.mousePressed(function() {
    switchMode(MouseMode.PLACE_BEAM_A);
  });

  let buttonPlay = p.select("#buttonPlay");
  buttonPlay.mousePressed(function() {
    scene.switchSimMode(SimMode.PLAYING);
  });

  let buttonPause = p.select("#buttonPause");
  buttonPause.mousePressed(function() {
    scene.switchSimMode(SimMode.PAUSED);
  });

  let buttonReset = p.select("#buttonReset");
  buttonReset.mousePressed(function() {
    scene.switchSimMode(SimMode.STOPPED);
    scene.reset();
  });

  let buttonDemo = p.select("#buttonLoadDemo");
  buttonDemo.mousePressed(function() {
    scene.clear();
    scene.addElement(new SENode(p.createVector(600,600),true));  // 0
    scene.addElement(new SENode(p.createVector(800,600),true));  // 1

    scene.addElement(new SENode(p.createVector(600,500),false)); // 2
    scene.addElement(new SENode(p.createVector(800,500),false)); // 3
    scene.addElement(new SENode(p.createVector(600,400),false)); // 4
    scene.addElement(new SENode(p.createVector(800,400),false)); // 5

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

    uiUpdateDesignParts();

    scene.switchSimMode(SimMode.STOPPED);
  });


  let buttonSolveRequest = p.select("#buttonSolve");
  buttonSolveRequest.mousePressed(function() {
    requestSolve();
  });

}






