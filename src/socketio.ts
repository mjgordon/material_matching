import { io, Socket } from "socket.io-client";

// please note that the types are reversed
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    solve_response: (json:JSON) => void;
}
  
interface ClientToServerEvents {
    hello: () => void;
    solve_request: (json:string) => void;
}

export function requestSolve() {
    /*
    sio.emit("solve_request", {'method': 'waste',
                               'stock_lengths': [10, 5, 4],
                               'part_lengths': [3, 2],
                               'part_requests': [3, 3]});
                               */

    const map:Record<string, any> = {};
    map.method = "waste";
    map.stock_lengths = [10, 5, 4];
    map.part_lengths = [3,2];
    map.part_requests = [3,3];
    
    socket.emit("solve_request",JSON.stringify(map));
}

socket.on("solve_response", (json:JSON) => {
    console.log(json);
});