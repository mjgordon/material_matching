import * as p5 from "p5";

import * as sampleData from "./SampleData";
import {Scene, SimMode} from "./Scene";
import {SceneElement, SENode, SEBeam} from "./SceneElement";
import * as socketio from "./socketio";

import * as util from "./Util";

export let p:p5 = null;

export let scene:Scene = null;

export let simLabel: p5.Element = null;
export let solveResponseLabel: p5.Element = null;
export let solveStatusLabel:p5.Element = null;

let selectedNameLabel: p5.Element = null;

let designPartTypeDiv: p5.Element = null;
let stockPieceDiv: p5.Element = null;

let buttonElementDelete: p5.Element = null;

export let solveMethod = "waste";


enum MouseMode {
  SELECT,
  PLACE_SUPPORT,
  PLACE_NODE,
  PLACE_BEAM_A,
  PLACE_BEAM_B
}

let currentMode: MouseMode = MouseMode.SELECT;

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

  util.setupPalette();

  scene = new Scene();


  const funMouseOver = function() {
    mouseOverControl = true;
    p.noCursor();
  }
  const funMouseOut = function() {
    mouseOverControl = false;
    p.cursor(p.ARROW);
  }

  let div = null;
  div = p.select("#controlDiv");
  div.mouseOver(funMouseOver);
  div.mouseOut(funMouseOut);

  div = p.select("#controlElementDiv");
  div.mouseOver(funMouseOver);
  div.mouseOut(funMouseOut);

  div = p.select("#matchingDiv");
  div.mouseOver(funMouseOver);
  div.mouseOut(funMouseOut);

  div = p.select("#stockPiecesDiv");
  div.mouseOver(funMouseOver);
  div.mouseOut(funMouseOut);

  div = p.select("#designPartsDiv");
  div.mouseOver(funMouseOver);
  div.mouseOut(funMouseOut);

  simLabel = p.select("#simLabel");
  solveResponseLabel = p.select("#solveResponseLabel");
  solveStatusLabel = p.select("#solveStatusLabel");

  selectedNameLabel = p.select("#selectedNameLabel");

  designPartTypeDiv = p.select("#matchingList");
  stockPieceDiv = p.select("#stockList");

  dummySupport = new SENode(p.createVector(-100,-100),true);
  dummySupport.visible = false;

  dummyNode = new SENode(p.createVector(-100,-100),false);
  dummyNode.visible = false;

  dummyBeam = new SEBeam(null,null);

  sampleData.loadDesignFeasible(p, scene);

  uiUpdateDesignParts();
  uiUpdateStockPieces();

  scene.switchSimMode(SimMode.STOPPED);

  setupControl();

  socketio.connectToDispatcher();
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
    buttonElementDelete.hide();
  }
  else {
    let contentString = se.getDisplayName() + " Id " + se.id + "<br>";
    if (se instanceof SENode) {
      contentString += "Position : " + se.position.x + "," + se.position.y + "," + se.position.z;
    }
    else if (se instanceof SEBeam) {
      let restLength = p.int(se.restLength * 1000) / 1000.0;
      contentString += "Length (cm) : " + restLength;
    }
    selectedNameLabel.html( contentString);
    buttonElementDelete.show();
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
    case MouseMode.SELECT:
      
    break;
    case MouseMode.PLACE_SUPPORT:
      dummySupport.visible = true;
      
    break;

    case MouseMode.PLACE_NODE:
      dummyNode.visible = true;
    break;

    case MouseMode.PLACE_BEAM_A:
      dummyBeam = new SEBeam(null,null);
      dummyBeam.visible = true;
    break;

    case MouseMode.PLACE_BEAM_B:
      dummyBeam.visible = true;
    break;
  }
}


function keyPressed() {
  if (p.keyCode == p.ESCAPE) {
    switchMode(MouseMode.SELECT);
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
    case MouseMode.SELECT:
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
      if (nodePick && !nodePick.equals(dummyBeam.childA)) {

        // Don't create if beam already 'exists', this reads messy right now, cleanup if possible
        let flag:boolean = false;
        for (const beam of scene.beams) {
          if ( (beam.childA.equals(dummyBeam.childA) && beam.childB.equals(nodePick)) ||
          (beam.childA.equals(nodePick) && beam.childB.equals(dummyBeam.childA))) {
            flag = true;
            break;
          }
        }
        if (flag) {
          return;
        }

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

  let contentString: string = "<table> <tr> <th></th> <th>Id&nbsp</th ><th>Length (cm)</th> <th></th> <th>Count</th> </tr>";

  for (const dp of scene.designPartsArray) {
    contentString += "<tr> <td><div style='width:20px; height:20px; background-color:" + dp.color.toString('#rrggbb') + "'></div></td>";
    contentString += "<td>" + dp.typeId + "</td> <td>" + dp.lengthRep + "</td> <td>&nbsp:&nbsp</td> <td>" + dp.count + "</td> </tr>";
  }

  contentString += "</table>";

  designPartTypeDiv.html(contentString);
}


/**
 * Updates the html list showing the current stock pieces
 */
function uiUpdateStockPieces() {
  let contentString: string = "<table><tr><th>Id</th><th></th><th>Length (cm)</th></tr>";
  let counter = 0;
  
  for (const sp of scene.stock) {
    contentString += "<tr><td>" + counter + "</td><td>&nbsp:&nbsp</td><td>" + sp.size.toFixed(1) + "</td></tr>"
    counter += 1;
  }
  contentString += "</table>";

  stockPieceDiv.html(contentString);
}


/**
 * Attach functionality to HTML Objects
 */
function setupControl() {
  let radioToolSelect:HTMLElement = document.getElementById("radioToolSelectLabel");
  radioToolSelect.addEventListener("mousedown", (event) => {
    switchMode(MouseMode.SELECT);
  });

  let radioToolSupport:HTMLElement = document.getElementById("radioToolSupportLabel");
  radioToolSupport.addEventListener("mousedown", (event) => {
    switchMode(MouseMode.PLACE_SUPPORT);
  });

  let radioToolNode:HTMLElement = document.getElementById("radioToolNodeLabel");
  radioToolNode.addEventListener("mousedown", (event) => {
    switchMode(MouseMode.PLACE_NODE);
  });

  let radioToolBeam:HTMLElement = document.getElementById("radioToolBeamLabel");
  radioToolBeam.addEventListener("mousedown", (event) => {
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
    sampleData.loadDesignFeasible(p, scene);
    uiUpdateDesignParts();
    scene.resetStockMatching();
    scene.switchSimMode(SimMode.STOPPED);
  });

  let buttonDemoInfeasible = p.select("#buttonLoadDemoInfeasible");
  buttonDemoInfeasible.mousePressed(function() {
    sampleData.loadDesignInfeasible(p, scene);
    uiUpdateDesignParts();
    scene.resetStockMatching();
    scene.switchSimMode(SimMode.STOPPED);
  });

  let buttonDemoBridge = p.select("#buttonLoadDemoBridge");
  buttonDemoBridge.mousePressed(function() {
    sampleData.loadDesignBridge(p,scene);
    uiUpdateDesignParts();
    scene.resetStockMatching();
    scene.switchSimMode(SimMode.STOPPED);
  });

  let buttonInventoryExample = p.select("#buttonLoadInventoryExample");
  buttonInventoryExample.mousePressed(function() {
    scene.resetStockMatching();
    scene.loadDefaultStock();
    uiUpdateStockPieces();
  });

  let buttonInventoryRandom = p.select("#buttonLoadInventoryRandom");
  buttonInventoryRandom.mousePressed(function() {
    scene.resetStockMatching();
    scene.loadStockRandom();
    uiUpdateStockPieces();
  });



  buttonElementDelete = p.select("#buttonElementDelete");
  buttonElementDelete.mousePressed(function() {
    if (scene.selectedElement != null) {
      scene.removeElement(scene.selectedElement);
      uiUpdateDesignParts();
    }
  });

  let radioModeStock:HTMLElement = document.getElementById("radioModeStockLabel");
  radioModeStock.addEventListener("mousedown", (event) => {
    solveMethod = "default";
  });

  let radioModeWaste:HTMLElement = document.getElementById("radioModeWasteLabel");
  radioModeWaste.addEventListener("mousedown", (event) => {
    solveMethod = "waste";
  });

  let radioModeContiguous:HTMLElement = document.getElementById("radioModeContiguousLabel");
  radioModeContiguous.addEventListener("mousedown", (event) => {
    solveMethod = "max";
  });

  let radioModeOrder:HTMLElement = document.getElementById("radioModeOrderLabel");
  radioModeOrder.addEventListener("mousedown", (event) => {
    solveMethod = "order";
  });

  let radioModeToolChange:HTMLElement = document.getElementById("radioModeToolChangeLabel");
  radioModeToolChange.addEventListener("mousedown", (event) => {
    solveMethod = "homogenous";
  });


  let buttonSolveRequest = p.select("#buttonSolve");
  buttonSolveRequest.mousePressed(function() {
    switchMode(MouseMode.SELECT);
    socketio.requestSolve(solveMethod);
  });

}






