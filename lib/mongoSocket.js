"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoSocket = void 0;
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoClient_js_1 = __importDefault(require("./mongoClient.js"));
const app = (0, express_1.default)();
class MongoSocket {
    constructor(config, options) {
        this.listening = false;
        this.connectedSocks = {};
        this.functions = {};
        this.config = config;
        this.options = options || { host: "localhost", port: 3000 };
        this.options.host = this.options.host || "localhost";
        this.options.port = this.options.port || 3000;
        this.options.cors = this.options.cors || cors_1.default;
        this.options.socketOptions =
            this.options.socketOptions ||
                {
                    cors: {
                        origin: "*",
                    },
                };
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mongoClient = new mongoClient_js_1.default(this.config);
            app.use(this.options.cors());
            yield new Promise((resolve) => {
                this.server = app.listen(this.options.port, this.options.host, () => {
                    this.listening = true;
                    resolve(true);
                });
            });
            this.io = new socket_io_1.Server(this.server, this.options.socketOptions);
            yield this.listen();
            return;
        });
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.functions = yield this.getFunctions();
            this.io.on("connection", (socket) => {
                this.connectedSocks[socket.id] = socket;
                socket.on("disconnect", () => {
                    delete this.connectedSocks[socket.id];
                });
                socket.on("function", (functionName, data = {}, callback = () => { }, options = {}) => __awaiter(this, void 0, void 0, function* () {
                    console.log(functionName, data, options);
                    if (this.functions[functionName]) {
                        try {
                            let result;
                            switch (functionName) {
                                case "getData":
                                    result = yield this.mongoClient.getData(data);
                                    break;
                                case "updateData":
                                    result = yield this.mongoClient.updateData(data);
                                    break;
                                case "updateBatchData":
                                    result = yield this.mongoClient.updateBatchData(data);
                                    break;
                                case "insertData":
                                    result = yield this.mongoClient.insertData(data);
                                    break;
                                case "deleteData":
                                    result = yield this.mongoClient.deleteData(data);
                                    break;
                            }
                            callback(result);
                        }
                        catch (e) {
                            console.log(e);
                            callback(e);
                        }
                    }
                    else {
                        callback(new Error(`Function ${functionName} not found.`));
                    }
                }));
            });
        });
    }
    getFunctions() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                getData: this.mongoClient.getData,
                updateData: this.mongoClient.updateData,
                updateBatchData: this.mongoClient.updateBatchData,
                insertData: this.mongoClient.insertData,
                deleteData: this.mongoClient.deleteData,
            };
        });
    }
}
exports.MongoSocket = MongoSocket;
//# sourceMappingURL=mongoSocket.js.map