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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConfig = void 0;
const mongodb_1 = require("mongodb");
class MongoConfig {
    constructor(connectionStr, db) {
        this.connectionStr = connectionStr;
        this.db = db;
    }
    static fromJson({ host, port, user, password, database, }) {
        return new MongoConfig(`mongodb://${user}:${password}@${host}:${port}?authMechanism=DEFAULT&directConnection=true`, database);
    }
}
exports.MongoConfig = MongoConfig;
class MongoClient {
    constructor(config, options) {
        this.config = config;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new mongodb_1.MongoClient(this.config.connectionStr, this.options);
            yield this.client.connect();
            return;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
            return;
        });
    }
    getDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db(this.config.db);
        });
    }
    updateBatchData({ collection, data, drop, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            const db = yield this.getDatabase();
            const collection_ = db.collection(collection);
            if (drop) {
                try {
                    yield collection_.drop();
                }
                catch (e) {
                    console.log(e);
                }
                try {
                    yield db.createCollection(collection);
                }
                catch (e) {
                    console.log(e);
                }
            }
            yield Promise.all(Object.keys(data).map((key) => __awaiter(this, void 0, void 0, function* () {
                return collection_.updateOne({ _id: new mongodb_1.ObjectId(key) }, { $set: data[key] }, { upsert: true });
            })));
            yield this.close();
            return;
        });
    }
    getData({ collection, key, filter, sort, limit, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            yield this.connect();
            const db = yield this.getDatabase();
            const collection_ = db.collection(collection);
            if (key) {
                result = yield collection_.findOne({ _id: new mongodb_1.ObjectId(key) });
            }
            else {
                let find = filter ? collection_.find(filter) : collection_.find();
                if (sort) {
                    find = find.sort(sort);
                }
                if (limit) {
                    find = find.limit(limit);
                }
                let list_data = yield find.toArray();
                result = {};
                list_data.forEach((data) => {
                    result[data._id.toString()] = data;
                });
            }
            yield this.close();
            return result;
        });
    }
    updateData({ collection, key, data, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            const db = yield this.getDatabase();
            const collection_ = db.collection(collection);
            yield collection_.updateOne({ _id: new mongodb_1.ObjectId(key) }, { $set: data }, { upsert: true });
            yield this.close();
            return;
        });
    }
    insertData({ collection, data, }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.connect);
            yield this.connect();
            const db = yield this.getDatabase();
            const collection_ = db.collection(collection);
            yield collection_.insertOne(data);
            yield this.close();
            return;
        });
    }
    deleteData({ collection, key, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            const db = yield this.getDatabase();
            const collection_ = db.collection(collection);
            yield collection_.deleteOne({ _id: new mongodb_1.ObjectId(key) });
            yield this.close();
            return;
        });
    }
}
exports.default = MongoClient;
//# sourceMappingURL=mongoClient.js.map