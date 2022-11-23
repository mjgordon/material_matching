
let numberOfShapesControl: p5.Element;

function setup() {
  console.log("🚀 - Setup initialized - P5 is running");
  createCanvas(windowWidth, windowHeight)
  rectMode(CENTER).noFill().frameRate(30);

  numberOfShapesControl = select("#sizeSlider");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  
   // CLEAR BACKGROUND
  background(255);

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