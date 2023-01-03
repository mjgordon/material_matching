class ColorHelper {
    static getColorVector(c) {
        return createVector(red(c), green(c), blue(c));
    }
    static rainbowColorBase() {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    }
    static getColorsArray(total, baseColorArray = null) {
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(x => this.getColorVector(x));
        ;
        let colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    }
    static getColorByPercentage(firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    }
}
var SimMode;
(function (SimMode) {
    SimMode["STOPPED"] = "Stopped";
    SimMode["PLAYING"] = "Playing";
    SimMode["PAUSED"] = "Paused";
})(SimMode || (SimMode = {}));
class Scene {
    constructor() {
        this.sceneElements = [];
        this.nodes = [];
        this.beams = [];
        this.stock = [];
        this.selectedElement = null;
        this.gravity = 0.02;
        this.sceneWidth = 800;
        this.sceneHeight = 600;
        this.simMode = SimMode.STOPPED;
        this.loadDefaultStock();
    }
    draw() {
        for (const se of this.beams) {
            se.draw(se.equals(this.selectedElement));
        }
        for (const se of this.nodes) {
            se.draw(se.equals(this.selectedElement));
        }
    }
    addElement(se) {
        this.sceneElements.push(se);
        if (se instanceof SENode) {
            this.nodes.push(se);
        }
        else if (se instanceof SEBeam) {
            this.beams.push(se);
        }
    }
    clear() {
        this.sceneElements = [];
        this.nodes = [];
        this.beams = [];
    }
    reset() {
        for (const se of this.sceneElements) {
            se.simInit();
        }
    }
    tick() {
        for (const node of this.nodes) {
            node.simAcceleration.y = this.gravity;
            node.simTick();
            if (node.position.y > height) {
                node.position.y = height;
            }
        }
        for (const beam of this.beams) {
            beam.simTick();
        }
    }
    switchSimMode(mode) {
        if (this.simMode == SimMode.STOPPED && mode == SimMode.PLAYING) {
            this.reset();
        }
        this.simMode = mode;
        simLabel.html(mode);
    }
    pickElement(vMouse) {
        let clickRadius = 20;
        let bestElement = null;
        let bestDist = 10000;
        for (const beam of this.beams) {
            const [beamPoint, d] = beam.getClosestPoint(vMouse);
            if (d < clickRadius) {
                if (bestElement == null || d < bestDist) {
                    bestElement = beam;
                    bestDist = d;
                }
            }
        }
        if (bestDist < clickRadius) {
            bestDist = clickRadius;
        }
        for (const node of this.nodes) {
            let d = vMouse.dist(node.simPosition);
            if (d < clickRadius) {
                if (bestElement == null || d < bestDist) {
                    bestElement = node;
                    bestDist = d;
                }
            }
        }
        return bestElement;
    }
    pickNode(vMouse) {
        let clickRadius = 20;
        let bestNode = null;
        let bestDist = 10000;
        for (const node of this.nodes) {
            let d = vMouse.dist(node.simPosition);
            if (d < clickRadius) {
                if (bestNode == null || d < bestDist) {
                    bestNode = node;
                    bestDist = d;
                }
            }
        }
        return bestNode;
    }
    getDesignParts() {
        let hashMap = new Map();
        for (const beam of this.beams) {
            let length = beam.restLength.toFixed(3).toString();
            if (hashMap.has(length)) {
                hashMap.set(length, hashMap.get(length) + 1);
            }
            else {
                hashMap.set(length, 1);
            }
        }
        return hashMap;
    }
    loadDefaultStock() {
        this.stock = [];
        this.stock.push(new StockPiece(500));
        this.stock.push(new StockPiece(500));
        this.stock.push(new StockPiece(400));
        this.stock.push(new StockPiece(400));
        this.stock.push(new StockPiece(300));
        this.stock.push(new StockPiece(300));
        this.stock.push(new StockPiece(200));
        this.stock.push(new StockPiece(200));
        this.stock.push(new StockPiece(100));
        this.stock.push(new StockPiece(100));
    }
}
class SceneElement {
    constructor() {
        this.visible = true;
        this.id = -1;
        this.id = SceneElement.counter;
        SceneElement.counter += 1;
    }
    equals(se) {
        if (se == null) {
            return false;
        }
        return this.id == se.id;
    }
}
SceneElement.counter = 0;
class SENode extends SceneElement {
    constructor(position, support) {
        super();
        this.position = position;
        this.simInit();
        this.support = support;
    }
    draw(isSelected) {
        if (!this.visible) {
            return;
        }
        if (isSelected) {
            stroke(255);
            strokeWeight(2);
        }
        else {
            stroke(0);
            strokeWeight(1);
        }
        if (this.support) {
            fill(64);
        }
        else {
            fill(20, 20, 255);
        }
        ellipse(this.simPosition.x, this.simPosition.y, SENode.nodeSize, SENode.nodeSize);
    }
    simInit() {
        this.simPosition = this.position.copy();
        this.simVelocity = createVector(0, 0);
        this.simAcceleration = createVector(0, 0);
    }
    simTick() {
        if (this.support) {
            return;
        }
        this.simVelocity.mult(SENode.simDrag);
        this.simVelocity.add(this.simAcceleration);
        if (this.simVelocity.mag() > SENode.simMaxSpeed) {
            this.simVelocity.setMag(SENode.simMaxSpeed);
        }
        this.simPosition.add(this.simVelocity);
        this.simAcceleration.set(0, 0);
    }
    simSetAcceleration(accel) {
        this.simAcceleration.set(accel);
    }
    getDisplayName() {
        return (this.support ? "Support" : "Node");
    }
}
SENode.simDrag = 0.99;
SENode.simMaxSpeed = 20;
SENode.nodeSize = 20;
class SEBeam extends SceneElement {
    constructor(childA, childB) {
        super();
        this.restLength = 100;
        this.strength = 0.1;
        this.childA = childA;
        this.childB = childB;
        if (childA && childB) {
            this.restLength = childA.position.dist(childB.position);
        }
    }
    draw(isSelected) {
        if (!this.visible) {
            return;
        }
        if (this.childA) {
            if (isSelected) {
                stroke(255);
            }
            else {
                stroke(0);
            }
            strokeWeight(3);
            if (this.childB) {
                line(this.childA.simPosition.x, this.childA.simPosition.y, this.childB.simPosition.x, this.childB.simPosition.y);
            }
            else {
                line(this.childA.position.x, this.childA.position.y, this.dummyB.x, this.dummyB.y);
            }
        }
    }
    simInit() {
    }
    simTick() {
        let childDelta = p5.Vector.sub(this.childB.simPosition, this.childA.simPosition);
        let deltaLength = this.restLength - childDelta.mag();
        if (Math.abs(deltaLength) > 1) {
            var push = this.strength * Math.sign(deltaLength);
            if (!this.childA.support && !this.childB.support) {
                var pushDelta = childDelta.copy().normalize().mult(-push / 2);
                this.childA.simVelocity.add(pushDelta);
                var pushDelta = childDelta.copy().normalize().mult(push / 2);
                this.childB.simVelocity.add(pushDelta);
            }
            if (!this.childA.support) {
                var pushDelta = childDelta.copy().normalize().mult(-push);
                this.childA.simVelocity.add(pushDelta);
            }
            if (!this.childB.support) {
                var pushDelta = childDelta.copy().normalize().mult(push);
                this.childB.simVelocity.add(pushDelta);
            }
        }
    }
    getDisplayName() {
        return ("Beam");
    }
    getClosestPoint(vec) {
        const a = this.childA.position;
        const b = this.childB.position;
        const l2 = this.distSquared(a, b);
        if (l2 == 0.0)
            return ([a, vec.dist(a)]);
        const t = Math.max(0, Math.min(1, p5.Vector.dot(p5.Vector.sub(vec, a), p5.Vector.sub(b, a)) / l2));
        const projection = p5.Vector.add(a, p5.Vector.sub(b, a).mult(t));
        return ([projection, projection.dist(vec)]);
    }
    distSquared(a, b) {
        return (Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
    }
}
class StockPiece {
    constructor(size) {
        this.size = size;
    }
}
let controlDiv = null;
let scene = null;
let toolLabel = null;
let simLabel = null;
let selectedNameLabel = null;
let designPartTypeDiv = null;
let stockPieceDiv = null;
var MouseMode;
(function (MouseMode) {
    MouseMode[MouseMode["EMPTY"] = 0] = "EMPTY";
    MouseMode[MouseMode["PLACE_SUPPORT"] = 1] = "PLACE_SUPPORT";
    MouseMode[MouseMode["PLACE_NODE"] = 2] = "PLACE_NODE";
    MouseMode[MouseMode["PLACE_BEAM_A"] = 3] = "PLACE_BEAM_A";
    MouseMode[MouseMode["PLACE_BEAM_B"] = 4] = "PLACE_BEAM_B";
})(MouseMode || (MouseMode = {}));
let currentMode = MouseMode.EMPTY;
let dummySupport;
let dummyNode;
let dummyBeam;
let mouseOverControl = false;
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
    simLabel = select("#simLabel");
    selectedNameLabel = select("#selectedNameLabel");
    designPartTypeDiv = select("#matchingList");
    stockPieceDiv = select("#stockList");
    dummySupport = new SENode(createVector(-100, -100), true);
    dummySupport.visible = false;
    dummyNode = new SENode(createVector(-100, -100), false);
    dummyNode.visible = false;
    dummyBeam = new SEBeam(null, null);
    uiUpdateStockPieces();
    setupControl();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(127);
    stroke(255);
    strokeWeight(0.5);
    for (var x = 0; x < width; x += 100) {
        line(x, 0, x, height);
    }
    for (var y = 0; y < height; y += 100) {
        line(0, y, width, y);
    }
    switch (currentMode) {
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
function setSelectedElement(se) {
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
            let restLength = int(se.restLength * 1000) / 1000.0;
            contentString += "Length : " + restLength;
        }
        selectedNameLabel.html(contentString);
    }
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
function keyPressed() {
    if (keyCode == ESCAPE) {
        switchMode(MouseMode.EMPTY);
    }
    switch (key) {
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
            switch (scene.simMode) {
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
function mousePressed() {
    if (mouseOverControl) {
        return;
    }
    switch (currentMode) {
        case MouseMode.EMPTY:
            var elementPick = scene.pickElement(createVector(mouseX, mouseY));
            setSelectedElement(elementPick);
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
                dummyBeam.restLength = dummyBeam.childA.position.dist(dummyBeam.childB.position);
                scene.addElement(dummyBeam);
                switchMode(MouseMode.PLACE_BEAM_A);
            }
            break;
    }
}
function uiUpdateDesignParts() {
    let hashMap = scene.getDesignParts();
    let contentString = "<table><tr><th>Length</th><th></th><th>Count</th></tr>";
    for (const [key, value] of hashMap) {
        contentString += "<tr><td>" + key + "</td><td>&nbsp:&nbsp</td><td>" + value + "</td></tr>";
    }
    contentString += "</table>";
    designPartTypeDiv.html(contentString);
}
function uiUpdateStockPieces() {
    let contentString = "<table><tr><th>Id</th><th></th><th>Length</th></tr>";
    let counter = 0;
    for (const sp of scene.stock) {
        contentString += "<tr><td>" + counter + "</td><td>&nbsp:&nbsp</td><td>" + sp.size + "</td></tr>";
        counter += 1;
    }
    contentString += "</table>";
    stockPieceDiv.html(contentString);
}
function setupControl() {
    let buttonSupport = select("#buttonCreateSupport");
    buttonSupport.mousePressed(function () {
        switchMode(MouseMode.PLACE_SUPPORT);
    });
    let buttonNode = select("#buttonCreateNode");
    buttonNode.mousePressed(function () {
        switchMode(MouseMode.PLACE_NODE);
    });
    let buttonBeam = select("#buttonCreateBeam");
    buttonBeam.mousePressed(function () {
        switchMode(MouseMode.PLACE_BEAM_A);
    });
    let buttonPlay = select("#buttonPlay");
    buttonPlay.mousePressed(function () {
        scene.switchSimMode(SimMode.PLAYING);
    });
    let buttonPause = select("#buttonPause");
    buttonPause.mousePressed(function () {
        scene.switchSimMode(SimMode.PAUSED);
    });
    let buttonReset = select("#buttonReset");
    buttonReset.mousePressed(function () {
        scene.switchSimMode(SimMode.STOPPED);
        scene.reset();
    });
    let buttonDemo = select("#buttonLoadDemo");
    buttonDemo.mousePressed(function () {
        scene.clear();
        scene.addElement(new SENode(createVector(600, 600), true));
        scene.addElement(new SENode(createVector(800, 600), true));
        scene.addElement(new SENode(createVector(600, 500), false));
        scene.addElement(new SENode(createVector(800, 500), false));
        scene.addElement(new SENode(createVector(600, 400), false));
        scene.addElement(new SENode(createVector(800, 400), false));
        scene.addElement(new SEBeam(scene.nodes[0], scene.nodes[2]));
        scene.addElement(new SEBeam(scene.nodes[1], scene.nodes[3]));
        scene.addElement(new SEBeam(scene.nodes[2], scene.nodes[3]));
        scene.addElement(new SEBeam(scene.nodes[4], scene.nodes[5]));
        scene.addElement(new SEBeam(scene.nodes[2], scene.nodes[4]));
        scene.addElement(new SEBeam(scene.nodes[3], scene.nodes[5]));
        scene.addElement(new SEBeam(scene.nodes[0], scene.nodes[3]));
        scene.addElement(new SEBeam(scene.nodes[1], scene.nodes[2]));
        scene.addElement(new SEBeam(scene.nodes[2], scene.nodes[5]));
        scene.addElement(new SEBeam(scene.nodes[3], scene.nodes[4]));
        uiUpdateDesignParts();
    });
}
//# sourceMappingURL=build.js.map