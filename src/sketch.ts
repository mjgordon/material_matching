let controlDiv: p5.Element = null;
let scene:Scene = null;

let toolLabel: p5.Element = null;

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


function setup() {
  console.log("🚀 - Setup initialized - P5 is running");
  createCanvas(windowWidth, windowHeight)
  rectMode(CENTER).noFill().frameRate(30);

  scene = new Scene();

  controlDiv = select("#controlDiv");
  controlDiv.mouseOver(function() {
    mouseOverControl = true;
    noCursor();
  });
  controlDiv.mouseOut(function() {
    mouseOverControl = false;
    cursor(ARROW);
  });

  toolLabel = select("#toolLabel");

  dummySupport = new SENode(createVector(-100,-100),true);
  dummySupport.visible = false;

  dummyNode = new SENode(createVector(-100,-100),false);
  dummyNode.visible = false;

  dummyBeam = new SEBeam(null,null);

  setupControl();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  background(255);

  switch(currentMode) {
    case MouseMode.PLACE_SUPPORT:
      dummySupport.position.x = mouseX;
      dummySupport.position.y = mouseY;

      dummySupport.simPosition.x = mouseX;
      dummySupport.simPosition.y = mouseY;
      dummySupport.draw();
    break;

    case MouseMode.PLACE_NODE:
      dummyNode.position.x = mouseX;
      dummyNode.position.y = mouseY;
      dummyNode.simPosition.x = mouseX;
      dummyNode.simPosition.y = mouseY;
      dummyNode.draw();
    break;

    case MouseMode.PLACE_BEAM_B:
      dummyBeam.dummyB = createVector(mouseX, mouseY);
      dummyBeam.draw();
    break;
  }

  if (scene.simMode == SimMode.PLAYING) {
    scene.tick();
  }

  scene.draw();
}

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


function setupControl() {
  let buttonSupport = select("#buttonCreateSupport");
  buttonSupport.mousePressed(function() {
    switchMode(MouseMode.PLACE_SUPPORT);
  });

  let buttonNode = select("#buttonCreateNode");
  buttonNode.mousePressed(function() {
    switchMode(MouseMode.PLACE_NODE);
  });

  let buttonBeam = select("#buttonCreateBeam");
  buttonBeam.mousePressed(function() {
    switchMode(MouseMode.PLACE_BEAM_A);
  });

  let buttonPlay = select("#buttonPlay");
  buttonPlay.mousePressed(function() {
    scene.switchSimMode(SimMode.PLAYING);
  });

  let buttonPause = select("#buttonPause");
  buttonPause.mousePressed(function() {
    scene.switchSimMode(SimMode.PAUSED);
  });

  let buttonReset = select("#buttonReset");
  buttonReset.mousePressed(function() {
    scene.switchSimMode(SimMode.STOPPED);
    scene.clear();
  });
}

function keyPressed() {
  if (keyCode == ESCAPE) {
    switchMode(MouseMode.EMPTY);
  }

  switch(key) {
    case 's':
      switchMode(MouseMode.PLACE_SUPPORT);
    break;

    case 'n':
      switchMode(MouseMode.PLACE_NODE);
    break;

    case 'b':
      switchMode(MouseMode.PLACE_BEAM_A);
    break;
  }
}

function mousePressed():void {
  if (mouseOverControl) {
    return;
  }

  switch(currentMode) {
    case MouseMode.EMPTY:

    break;

    case MouseMode.PLACE_SUPPORT:
      scene.addElement(new SENode(createVector(mouseX, mouseY),true));
    break;

    case MouseMode.PLACE_NODE:
      scene.addElement(new SENode(createVector(mouseX, mouseY),false));
    break;

    case MouseMode.PLACE_BEAM_A:
      var nodePick:SENode = scene.pickNode(createVector(mouseX,mouseY));
      if (nodePick) {
        dummyBeam.childA = nodePick;
        switchMode(MouseMode.PLACE_BEAM_B);
      }
    break;

    case MouseMode.PLACE_BEAM_B:
      var nodePick:SENode = scene.pickNode(createVector(mouseX,mouseY));
      if (nodePick) {
        dummyBeam.childB = nodePick;
        scene.addElement(dummyBeam);
        switchMode(MouseMode.EMPTY);
      }
    break;
  }

  
}




