var ColorHelper = (function () {
    function ColorHelper() {
    }
    ColorHelper.getColorVector = function (c) {
        return createVector(red(c), green(c), blue(c));
    };
    ColorHelper.rainbowColorBase = function () {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    };
    ColorHelper.getColorsArray = function (total, baseColorArray) {
        var _this = this;
        if (baseColorArray === void 0) { baseColorArray = null; }
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(function (x) { return _this.getColorVector(x); });
        ;
        var colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    };
    ColorHelper.getColorByPercentage = function (firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    };
    return ColorHelper;
}());
var PolygonHelper = (function () {
    function PolygonHelper() {
    }
    PolygonHelper.draw = function (numberOfSides, width) {
        push();
        var angle = TWO_PI / numberOfSides;
        var radius = width / 2;
        beginShape();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = cos(a) * radius;
            var sy = sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
    };
    return PolygonHelper;
}());
var Scene = (function () {
    function Scene() {
        this.sceneElements = [];
    }
    Scene.prototype.draw = function () {
        this.sceneElements.forEach(function (se) {
            se.draw();
        });
    };
    Scene.prototype.addElement = function (se) {
        this.sceneElements.push(se);
    };
    return Scene;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SceneElement = (function () {
    function SceneElement(position) {
        this.visible = true;
        this.position = position;
    }
    SceneElement.nodeSize = 20;
    return SceneElement;
}());
var SESupport = (function (_super) {
    __extends(SESupport, _super);
    function SESupport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SESupport.prototype.draw = function () {
        if (!this.visible) {
            return;
        }
        fill(128);
        ellipse(this.position.x, this.position.y, SceneElement.nodeSize, SceneElement.nodeSize);
    };
    return SESupport;
}(SceneElement));
var SENode = (function (_super) {
    __extends(SENode, _super);
    function SENode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SENode.prototype.draw = function () {
        if (!this.visible) {
            return;
        }
        fill(20, 20, 255);
        ellipse(this.position.x, this.position.y, SceneElement.nodeSize, SceneElement.nodeSize);
    };
    return SENode;
}(SceneElement));
var numberOfShapesControl;
var scene = null;
var toolLabel = null;
var MouseMode;
(function (MouseMode) {
    MouseMode[MouseMode["EMPTY"] = 0] = "EMPTY";
    MouseMode[MouseMode["PLACE_SUPPORT"] = 1] = "PLACE_SUPPORT";
    MouseMode[MouseMode["PLACE_NODE"] = 2] = "PLACE_NODE";
    MouseMode[MouseMode["PLACE_BEAM"] = 3] = "PLACE_BEAM";
})(MouseMode || (MouseMode = {}));
var currentMode = MouseMode.EMPTY;
var dummySupport;
var dummyNode;
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER).noFill().frameRate(30);
    numberOfShapesControl = select("#sizeSlider");
    toolLabel = select("#toolLabel");
    dummySupport = new SESupport(createVector(-1, -1));
    dummySupport.visible = false;
    dummyNode = new SENode(createVector(-1, -1));
    dummyNode.visible = false;
    setupControl();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(255);
    switch (currentMode) {
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
function switchMode(mode) {
    currentMode = mode;
    dummySupport.visible = false;
    switch (currentMode) {
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
    var buttonSupport = select("#buttonCreateSupport");
    buttonSupport.mousePressed(function () {
        switchMode(MouseMode.PLACE_SUPPORT);
    });
    var buttonNode = select("#buttonCreateNode");
    buttonNode.mousePressed(function () {
        switchMode(MouseMode.PLACE_NODE);
    });
}
function keyPressed() {
    if (keyCode == ESCAPE) {
        switchMode(MouseMode.EMPTY);
    }
}
function mousePressed() {
    switch (currentMode) {
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
    translate(width / 2, height / 2);
    var numberOfShapes = numberOfShapesControl.value();
    var colours = ColorHelper.getColorsArray(numberOfShapes);
    var speed = (frameCount / (numberOfShapes * 30)) * 2;
    for (var i = 0; i < numberOfShapes; i++) {
        push();
        var lineWidth = 8;
        var spin = speed * (numberOfShapes - i);
        var numberOfSides = 4;
        var width_1 = 40 * i;
        strokeWeight(lineWidth);
        stroke(colours[i]);
        rotate(spin);
        PolygonHelper.draw(numberOfSides, width_1);
        pop();
    }
}
//# sourceMappingURL=build.js.map