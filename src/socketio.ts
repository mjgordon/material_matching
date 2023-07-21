import { io, Socket } from "socket.io-client";
import { scene, solveResponseLabel } from "./sketch";
import { SEBeam } from "./SceneElement";
import { solveMethod } from "./sketch"

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
        solveResponseLabel.html("No Design in Scene");
        return;
    }

    if (scene.getStockLengths().length == 0) {
        solveResponseLabel.html("No Stock in Scene");
        return;
    }

    if (solveWaiting) {
        solveResponseLabel.html("Solving Please Wait");
        return;
    }


    const jsonMap: Record<string, any> = {};
    jsonMap.method = method;
    jsonMap.stock_lengths = scene.getStockLengths();

    if (solveMethod == "order") {
        jsonMap.part_lengths = scene.beams.map( beam => beam.restLength);
        jsonMap.part_requests = Array(scene.beams.length).fill(1);
    }
    else {
        jsonMap.part_lengths = scene.designPartsArray.map(dp => dp.length);
        jsonMap.part_requests = scene.designPartsArray.map(dp => dp.count);
    }

    solveWaiting = true;

    solveResponseLabel.html("Solving");

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


    solveResponseLabel.html("Solve Successful");

    solveWaiting = false;
}


function solveInfeasible() {
    for (const stock of scene.stock) {
        stock.matchedBeams = [];
    }
    solveResponseLabel.html("Solve Infeasible");

    solveWaiting = false;
}

interface SolveResponseData {
    requester_sid: string;
    usage: number[];
}



