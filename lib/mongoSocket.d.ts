import { ServerOptions as SocketServerOptions } from "socket.io";
import { MongoConfig } from "./mongoClient.js";
interface ServerOptions {
    host: string;
    port: number;
    cors?: any;
    socketOptions?: SocketServerOptions;
}
export declare class MongoSocket {
    private server;
    private io;
    private config;
    private options;
    private listening;
    private connectedSocks;
    private mongoClient;
    private functions;
    constructor(config: MongoConfig, options?: ServerOptions);
    start(): Promise<void>;
    private listen;
    private getFunctions;
}
export {};
