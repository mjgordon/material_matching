import { io, Socket } from "socket.io-client";

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
    map.stock_lengths = [10, 5, 4];
    map.part_lengths = [3,2];
    map.part_requests = [3,3];
    
    socket.emit("solve_request",JSON.stringify(map));
}


