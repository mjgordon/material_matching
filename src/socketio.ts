import { io, Socket } from "socket.io-client";
import { scene } from "./sketch";

let socket:Socket<ServerToClientEvents, ClientToServerEvents> = null;

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    solve_response: (json:JSON) => void;
}


interface ClientToServerEvents {
    solve_request: (json:string) => void;
    client_id: (json:string) => void;
}


export function connectToDispatcher():void {
    //TODO: Make this a toggle between local or webserver
    socket = io("http://127.0.0.1:5000");

    socket.on("solve_response", (json:JSON) => {
        console.log(json);
    });

    socket.emit("client_id",JSON.stringify({type: "user"}));
}


export function requestSolve():void {
    const map:Record<string, any> = {};
    map.method = "waste";
    map.stock_lengths = scene.getStockLengths();

    const designMap:Map<string,number> = scene.getDesignParts();


    map.part_lengths = Array.from(designMap.keys()).map(k => parseFloat(k));
    map.part_requests = Array.from(designMap.values());
    
    socket.emit("solve_request",JSON.stringify(map));
}


