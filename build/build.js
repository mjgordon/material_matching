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
var SimMode;
(function (SimMode) {
    SimMode[SimMode["STOPPED"] = 0] = "STOPPED";
    SimMode[SimMode["PLAYING"] = 1] = "PLAYING";
    SimMode[SimMode["PAUSED"] = 2] = "PAUSED";
})(SimMode || (SimMode = {}));
var Scene = (function () {
    function Scene() {
        this.sceneElements = [];
        this.nodes = [];
        this.beams = [];
        this.gravity = 0.02;
        this.sceneWidth = 800;
        this.sceneHeight = 600;
        this.simMode = SimMode.STOPPED;
    }
    Scene.prototype.draw = function () {
        this.sceneElements.forEach(function (se) {
            se.draw();
        });
    };
    Scene.prototype.addElement = function (se) {
        this.sceneElements.push(se);
        if (se instanceof SENode) {
            this.nodes.push(se);
        }
        else if (se instanceof SEBeam) {
            this.beams.push(se);
        }
    };
    Scene.prototype.clear = function () {
        this.sceneElements = [];
        this.nodes = [];
    };
    Scene.prototype.tick = function () {
        var gravity = this.gravity;
        this.nodes.forEach(function (node) {
            node.simAcceleration.y = gravity;
            node.simTick();
            if (node.position.y > height) {
                node.position.y = height;
            }
        });
    };
    Scene.prototype.switchSimMode = function (mode) {
        if (this.simMode == SimMode.STOPPED && mode == SimMode.PLAYING) {
            this.sceneElements.forEach(function (se) {
                se.simInit();
            });
        }
        this.simMode = mode;
    };
    Scene.prototype.pickNode = function (vMouse) {
        var clickRadius = 20;
        var bestNode = null;
        var bestDist = 10000;
        this.nodes.forEach(function (n) {
            var d = vMouse.dist(n.simPosition);
            if (d < clickRadius) {
                if (bestNode == null || d < bestDist) {
                    bestNode = n;
                    bestDist = d;
                }
            }
        });
        return bestNode;
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
    function SceneElement() {
        this.visible = true;
    }
    return SceneElement;
}());
var SENode = (function (_super) {
    __extends(SENode, _super);
    function SENode(position, support) {
        var _this = _super.call(this) || this;
        _this.position = position;
        _this.simInit();
        _this.support = support;
        return _this;
    }
    SENode.prototype.draw = function () {
        if (!this.visible) {
            return;
        }
        if (this.support) {
            fill(128);
        }
        else {
            fill(20, 20, 255);
        }
        ellipse(this.simPosition.x, this.simPosition.y, SENode.nodeSize, SENode.nodeSize);
    };
    SENode.prototype.simInit = function () {
        this.simPosition = this.position.copy();
        this.simVelocity = createVector(0, 0);
        this.simAcceleration = createVector(0, 0);
    };
    SENode.prototype.simTick = function () {
        if (this.support) {
            return;
        }
        this.simVelocity.mult(SENode.simDrag);
        this.simVelocity.add(this.simAcceleration);
        if (this.simVelocity.mag() > SENode.simMaxSpeed) {
            this.simVelocity.setMag(SENode.simMaxSpeed);
        }
        this.simPosition.add(this.simVelocity);
    };
    SENode.prototype.simSetAcceleration = function (accel) {
        this.simAcceleration.set(accel);
    };
    SENode.simDrag = 0.99;
    SENode.simMaxSpeed = 20;
    SENode.nodeSize = 20;
    return SENode;
}(SceneElement));
var SEBeam = (function (_super) {
    __extends(SEBeam, _super);
    function SEBeam(childA, childB) {
        var _this = _super.call(this) || this;
        _this.childA = childA;
        _this.childB = childB;
        return _this;
    }
    SEBeam.prototype.draw = function () {
        if (!this.visible) {
            return;
        }
        if (this.childA) {
            stroke(0);
            strokeWeight(3);
            if (this.childB) {
                line(this.childA.simPosition.x, this.childA.simPosition.y, this.childB.simPosition.x, this.childB.simPosition.y);
            }
            else {
                line(this.childA.position.x, this.childA.position.y, this.dummyB.x, this.dummyB.y);
            }
        }
    };
    SEBeam.prototype.simInit = function () {
    };
    SEBeam.prototype.simTick = function () {
    };
    return SEBeam;
}(SceneElement));
var controlDiv = null;
var scene = null;
var toolLabel = null;
var MouseMode;
(function (MouseMode) {
    MouseMode[MouseMode["EMPTY"] = 0] = "EMPTY";
    MouseMode[MouseMode["PLACE_SUPPORT"] = 1] = "PLACE_SUPPORT";
    MouseMode[MouseMode["PLACE_NODE"] = 2] = "PLACE_NODE";
    MouseMode[MouseMode["PLACE_BEAM_A"] = 3] = "PLACE_BEAM_A";
    MouseMode[MouseMode["PLACE_BEAM_B"] = 4] = "PLACE_BEAM_B";
})(MouseMode || (MouseMode = {}));
var currentMode = MouseMode.EMPTY;
var dummySupport;
var dummyNode;
var dummyBeam;
var mouseOverControl = false;
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER).noFill().frameRate(30);
    scene = new Scene();
    controlDiv = select("#controlDiv");
    controlDiv.mouseOver(function () {
        mouseOverControl = true;
        noCursor();
    });
    controlDiv.mouseOut(function () {
        mouseOverControl = false;
        cursor(ARROW);
    });
    toolLabel = select("#toolLabel");
    dummySupport = new SENode(createVector(-100, -100), true);
    dummySupport.visible = false;
    dummyNode = new SENode(createVector(-100, -100), false);
    dummyNode.visible = false;
    dummyBeam = new SEBeam(null, null);
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
        case MouseMode.PLACE_BEAM_A:
            dummyBeam = new SEBeam(null, null);
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
    var buttonSupport = select("#buttonCreateSupport");
    buttonSupport.mousePressed(function () {
        switchMode(MouseMode.PLACE_SUPPORT);
    });
    var buttonNode = select("#buttonCreateNode");
    buttonNode.mousePressed(function () {
        switchMode(MouseMode.PLACE_NODE);
    });
    var buttonBeam = select("#buttonCreateBeam");
    buttonBeam.mousePressed(function () {
        switchMode(MouseMode.PLACE_BEAM_A);
    });
    var buttonPlay = select("#buttonPlay");
    buttonPlay.mousePressed(function () {
        scene.switchSimMode(SimMode.PLAYING);
    });
    var buttonPause = select("#buttonPause");
    buttonPause.mousePressed(function () {
        scene.switchSimMode(SimMode.PAUSED);
    });
    var buttonReset = select("#buttonReset");
    buttonReset.mousePressed(function () {
        scene.switchSimMode(SimMode.STOPPED);
        scene.clear();
    });
}
function keyPressed() {
    if (keyCode == ESCAPE) {
        switchMode(MouseMode.EMPTY);
    }
}
function mousePressed() {
    if (mouseOverControl) {
        return;
    }
    switch (currentMode) {
        case MouseMode.EMPTY:
            break;
        case MouseMode.PLACE_SUPPORT:
            scene.addElement(new SENode(createVector(mouseX, mouseY), true));
            break;
        case MouseMode.PLACE_NODE:
            scene.addElement(new SENode(createVector(mouseX, mouseY), false));
            break;
        case MouseMode.PLACE_BEAM_A:
            var nodePick = scene.pickNode(createVector(mouseX, mouseY));
            if (nodePick) {
                dummyBeam.childA = nodePick;
                switchMode(MouseMode.PLACE_BEAM_B);
            }
            break;
        case MouseMode.PLACE_BEAM_B:
            var nodePick = scene.pickNode(createVector(mouseX, mouseY));
            if (nodePick) {
                dummyBeam.childB = nodePick;
                scene.addElement(dummyBeam);
                switchMode(MouseMode.EMPTY);
            }
            break;
    }
}
//# sourceMappingURL=build.js.map