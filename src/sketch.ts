let controlDiv: p5.Element = null;
let scene:Scene = null;

let toolLabel: p5.Element = null;
let simLabel: p5.Element = null;

let selectedNameLabel: p5.Element = null;

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
  simLabel = select("#simLabel");

  selectedNameLabel = select("#selectedNameLabel");

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
  background(127);
  
  stroke(255);
  strokeWeight(0.5);
  for (var x = 0; x < width; x+= 100) {
    line(x,0,x,height);
  }
  for (var y = 0; y < height; y+= 100) {
    line(0,y,width,y);
  }

  switch(currentMode) {
    case MouseMode.PLACE_SUPPORT:
      dummySupport.position.x = mouseX;
      dummySupport.position.y = mouseY;

      dummySupport.simPosition.x = mouseX;
      dummySupport.simPosition.y = mouseY;
      dummySupport.draw(false);
    break;

    case MouseMode.PLACE_NODE:
      dummyNode.position.x = mouseX;
      dummyNode.position.y = mouseY;
      dummyNode.simPosition.x = mouseX;
      dummyNode.simPosition.y = mouseY;
      dummyNode.draw(false);
    break;

    case MouseMode.PLACE_BEAM_B:
      dummyBeam.dummyB = createVector(mouseX, mouseY);
      dummyBeam.draw(false);
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
function setSelectedElement(se:SENode):void {
  scene.selectedNode = se;
  if (se == null) {
    selectedNameLabel.html("");
  }
  else {
    selectedNameLabel.html( se.getDisplayName() + " " + se.id);
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
      var nodePick:SENode = scene.pickNode(createVector(mouseX,mouseY));
      setSelectedElement(nodePick);
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
        dummyBeam.restLength = dummyBeam.childA.position.dist(dummyBeam.childB.position);
        scene.addElement(dummyBeam);
        switchMode(MouseMode.PLACE_BEAM_A);
      }
    break;
  }
}


/**
 * Attach functionality to HTML Objects
 */
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
    scene.reset();
  });

  let buttonDemo = select("#buttonLoadDemo");
  buttonDemo.mousePressed(function() {
    scene.clear();
    scene.addElement(new SENode(createVector(600,600),true));  // 0
    scene.addElement(new SENode(createVector(800,600),true));  // 1

    scene.addElement(new SENode(createVector(600,500),false)); // 2
    scene.addElement(new SENode(createVector(800,500),false)); // 3
    scene.addElement(new SENode(createVector(600,400),false)); // 4
    scene.addElement(new SENode(createVector(800,400),false)); // 5

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
  });
}






