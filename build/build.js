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
//# sourceMappingURL=build.js.map