import { io, Socket } from "socket.io-client";
import { scene, solveResponseLabel, solveStatusLabel, solveMethod } from "./sketch";
import { SEBeam } from "./SceneElement";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> = null;

let solveWaiting: boolean = false;

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    solve_response: (json: JSON) => void;
    solve_infeasible: (json: JSON) => void;
}


interface ClientToServerEvents {
    solve_request: (json: string) => void;
    client_id: (json: string) => void;
}


export function connectToDispatcher(): void {
    //TODO: Make this a toggle between local or webserver
    //socket = io("http://127.0.0.1:5000");
    socket = io("http://134.209.198.60:52323");

    socket.on("solve_response", (json: JSON) => {
        solveResponse(json);
    });

    socket.on("solve_infeasible", (json: JSON) => {
        solveInfeasible();
    });

    socket.emit("client_id", JSON.stringify({ type: "user" }));
}


export function requestSolve(method: string): void {
    if (scene.designPartsArray.length == 0) {
        solveStatusLabel.html("");
        solveResponseLabel.html("No Design in Scene");
        return;
    }

    if (scene.getStockLengths().length == 0) {
        solveStatusLabel.html("");
        solveResponseLabel.html("No Stock in Scene");
        return;
    }

    if (solveWaiting) {
        solveStatusLabel.html("Solving Please Wait");
        solveResponseLabel.html("");
        return;
    }


    const jsonMap: Record<string, any> = {};
    jsonMap.method = method;
    jsonMap.stock_lengths = scene.getStockLengths();
    jsonMap.model_args = {"max_seconds":10,
                        "preprocess":0};

    if (solveMethod == "order") {
        jsonMap.part_lengths = scene.beams.map( beam => beam.restLength);
        jsonMap.part_requests = Array(scene.beams.length).fill(1);
    }
    else {
        jsonMap.part_lengths = scene.designPartsArray.map(dp => dp.length);
        jsonMap.part_requests = scene.designPartsArray.map(dp => dp.count);
    }

    solveWaiting = true;

    solveStatusLabel.html("Solving");
    solveResponseLabel.html("");

    socket.emit("solve_request", JSON.stringify(jsonMap));
}

function solveResponse(json: JSON) {
    //TODO: Weird hacky workaround
    let response: SolveResponseData = JSON.parse(JSON.stringify(json))

    let stockCount: number = scene.stock.length;

    let beamsCopy: SEBeam[] = [...scene.beams];

    // First clear the existing matchings
    for (const stock of scene.stock) {
        stock.matchedBeams = [];
    }

    if (solveMethod === "order") {
        var currentStock = -1;
        for (let partId = 0; partId < scene.beams.length; partId ++) {
            for (let stockId = 0; stockId < scene.stock.length; stockId ++) {
                const id = partId * scene.stock.length + stockId;
                //const id = stockId * scene.beams.length + partId;

                if (response.usage[id] == 1) {
                    currentStock = stockId;
                    break;
                }
            }
            scene.stock[currentStock].matchedBeams.push(beamsCopy[partId]);
        }
    }
    else {
        // Interpret the usage array 
        for (let i = 0; i < response.usage.length; i++) {
            const usage = response.usage[i];
            if (usage == 0) {
                continue;
            }
            const designPartId = Math.floor(i / stockCount);
            const stockId = i % stockCount;

            for (let j = 0; j < usage; j++) {
                for (let k = 0; k < beamsCopy.length; k++) {
                    if (beamsCopy[k].designPartId == designPartId) {
                        scene.stock[stockId].matchedBeams.push(beamsCopy[k]);
                        beamsCopy.splice(k, 1);
                        break;
                    }
                }
            }
        }
    }

    //console.log(response);
    const logParts = response.log_string.split(",");
    var goalValue:number = Number(logParts[2]);
    var wasteValue:string = Number(logParts[3]).toFixed(1);

    var responseString = "";

    if (solveMethod === "default") {
        responseString += "Cutoff Waste : " + wasteValue + "cm <br>Using " + Math.floor(goalValue) + " stock pieces";
    }
    else if (solveMethod === "waste") {
        responseString += "Cutoff Waste : " + wasteValue + "cm";
    }
    else if (solveMethod === "max") {
        responseString += "Cutoff Waste : " + wasteValue + "cm <br>Contiguous Score : " + goalValue.toFixed(3);
    }
    else if (solveMethod === "order") {
        responseString += "Cutoff Waste : " + wasteValue + "cm <br>When produced in order";
    }
    else if (solveMethod === "homogenous") {
        responseString += "Cutoff Waste : " + wasteValue + "cm <br>Using " + Math.floor(goalValue) + " tool setup changes";
    }

    solveStatusLabel.html("Success");
    solveResponseLabel.html(responseString);

    solveWaiting = false;
}


function solveInfeasible() {
    for (const stock of scene.stock) {
        stock.matchedBeams = [];
    }
    solveStatusLabel.html("Infeasible");
    solveResponseLabel.html("");

    solveWaiting = false;
}

interface SolveResponseData {
    requester_sid: string;
    usage: number[];
    log_string: string;
}



