import {
  Server as SocketIO,
  Socket,
  ServerOptions as SocketServerOptions,
} from "socket.io";
import express, { Express } from "express";
import cors from "cors";
import MongoClient, { MongoConfig } from "./mongoClient.js";

const app: Express = express();

interface ServerOptions {
  host: string;
  port: number;
  cors?: any;
  socketOptions?: SocketServerOptions;
}

export class MongoSocket {
  private server: any;
  private io: SocketIO | undefined;
  private config: MongoConfig;
  private options: ServerOptions | undefined;
  private listening: boolean = false;

  private connectedSocks: { [key: string]: Socket } = {};
  private mongoClient: MongoClient | undefined;
  private functions: { [key: string]: Function } = {};

  constructor(config: MongoConfig, options?: ServerOptions) {
    this.config = config;
    this.options = options || { host: "localhost", port: 3000 };

    this.options.host = this.options.host || "localhost";
    this.options.port = this.options.port || 3000;
    this.options.cors = this.options.cors || cors;
    this.options.socketOptions =
      this.options.socketOptions ||
      ({
        cors: {
          origin: "*",
        },
      } as SocketServerOptions);
  }

  async start(): Promise<void> {
    this.mongoClient = new MongoClient(this.config);
    app.use(this.options!.cors!());
    await new Promise((resolve) => {
      this.server = app.listen(this.options!.port, this.options!.host, () => {
        this.listening = true;
        resolve(true);
      });
    });

    this.io = new SocketIO(this.server, this.options!.socketOptions);

    await this.listen();
    return;
  }

  private async listen(): Promise<void> {
    this.functions = await this.getFunctions();

    this.io!.on("connection", (socket: Socket) => {
      this.connectedSocks[socket.id] = socket;
      socket.on("disconnect", () => {
        delete this.connectedSocks[socket.id];
      });
      socket.on(
        "function",
        async (
          functionName: string,
          data = {},
          callback = () => {},
          options = {}
        ) => {
          console.log(functionName, data, options);
          if (this.functions[functionName]) {
            try {
              let result;
              switch (functionName) {
                case "getData":
                  result = await this.mongoClient!.getData(data);
                  break;
                case "updateData":
                  result = await this.mongoClient!.updateData(data);
                  break;
                case "updateBatchData":
                  result = await this.mongoClient!.updateBatchData(data);
                  break;
                case "insertData":
                  result = await this.mongoClient!.insertData(data);
                  break;
                case "deleteData":
                  result = await this.mongoClient!.deleteData(data);
                  break;
              }
              callback(result);
            } catch (e) {
              console.log(e);
              callback(e);
            }
          } else {
            callback(new Error(`Function ${functionName} not found.`));
          }
        }
      );
    });
  }

  private async getFunctions(): Promise<{ [key: string]: Function }> {
    return {
      getData: this.mongoClient!.getData,
      updateData: this.mongoClient!.updateData,
      updateBatchData: this.mongoClient!.updateBatchData,
      insertData: this.mongoClient!.insertData,
      deleteData: this.mongoClient!.deleteData,
    };
  }
}
