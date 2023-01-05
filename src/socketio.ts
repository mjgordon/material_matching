import {p} from "./sketch";
import { io, Socket } from "socket.io-client";
import { scene } from "./sketch";

let socket:Socket<ServerToClientEvents, ClientToServerEvents> = null;

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    solve_response: (json:object) => void;
}


interface ClientToServerEvents {
    solve_request: (json:string) => void;
    client_id: (json:string) => void;
}


export function connectToDispatcher():void {
    //TODO: Make this a toggle between local or webserver
    socket = io("http://127.0.0.1:5000");

    socket.on("solve_response", (json:JSON) => {
        solveResponse(json);
    });

    socket.emit("client_id",JSON.stringify({type: "user"}));
}


export function requestSolve():void {
    const jsonMap:Record<string, any> = {};
    jsonMap.method = "waste";
    jsonMap.stock_lengths = scene.getStockLengths();

    jsonMap.part_lengths = scene.designPartsArray.map(dp => dp.length);
    jsonMap.part_requests = scene.designPartsArray.map(dp => dp.count);

    socket.emit("solve_request",JSON.stringify(jsonMap));
}

function solveResponse(json:JSON) {
    //TODO: Weird hacky workaround
    let obj:SolveResponseData = JSON.parse(JSON.stringify(json))
    p.print(obj.requester_sid);
    p.print(obj.usage)
}

interface SolveResponseData {
    requester_sid:string;
    usage:number[];
}



