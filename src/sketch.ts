
let numberOfShapesControl: p5.Element;

let scene:Scene = null;

let toolLabel: p5.Element = null;

enum MouseMode {
  EMPTY,
  PLACE_SUPPORT,
  PLACE_NODE,
  PLACE_BEAM
}

let currentMode: MouseMode = MouseMode.EMPTY;

let dummySupport: SESupport;
let dummyNode: SENode;

function setup() {
  console.log("🚀 - Setup initialized - P5 is running");
  createCanvas(windowWidth, windowHeight)
  rectMode(CENTER).noFill().frameRate(30);

  numberOfShapesControl = select("#sizeSlider");
  toolLabel = select("#toolLabel");

  dummySupport = new SESupport(createVector(-1,-1));
  dummySupport.visible = false;

  dummyNode = new SENode(createVector(-1,-1));
  dummyNode.visible = false;

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
      dummySupport.draw();
    break;

    case MouseMode.PLACE_NODE:
      dummyNode.position.x = mouseX;
      dummyNode.position.y = mouseY;
      dummyNode.draw();
    break;
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
}

function keyPressed() {
  if (keyCode == ESCAPE) {
    switchMode(MouseMode.EMPTY);
  }
}

function mousePressed() {
  switch(currentMode) {
    case MouseMode.EMPTY:

    break;

    case MouseMode.PLACE_SUPPORT:
      scene.addElement(new SESupport(createVector(mouseX, mouseY)));
    break;

    case MouseMode.PLACE_NODE:
      scene.addElement(new SENode(createVector(mouseX, mouseY)));
    break;
  }
}

function drawSpirograph() {
// CENTER OF SCREEN
translate(width / 2,height / 2);

const numberOfShapes = <number>numberOfShapesControl.value();
const colours = ColorHelper.getColorsArray(numberOfShapes);

// CONSISTENT SPEED REGARDLESS OF FRAMERATE
const speed = (frameCount / (numberOfShapes * 30)) * 2;

// DRAW ALL SHAPES
for (var i = 0; i < numberOfShapes; i++) {
  push();
    const lineWidth = 8;
    const spin = speed * (numberOfShapes - i);
    const numberOfSides = 4;
    const width = 40 * i;
    strokeWeight(lineWidth); 
    stroke(colours[i]);
    rotate(spin);
    PolygonHelper.draw(numberOfSides, width)
  pop();
}
}

