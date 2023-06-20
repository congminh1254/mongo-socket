import { Db, Document, Filter, MongoClientOptions, Sort } from "mongodb";
export declare class MongoConfig {
    connectionStr: string;
    db: string | undefined;
    constructor(connectionStr: string, db: string);
    static fromJson({ host, port, user, password, database, }: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    }): MongoConfig;
}
export default class MongoClient {
    private config;
    private client;
    private options;
    constructor(config: MongoConfig, options?: MongoClientOptions);
    connect(): Promise<void>;
    close(): Promise<void>;
    getDatabase(): Promise<Db>;
    updateBatchData({ collection, data, drop, }: {
        collection: string;
        data: any;
        drop?: boolean;
    }): Promise<void>;
    getData({ collection, key, filter, sort, limit, }: {
        collection: string;
        key?: string;
        filter?: Filter<Document>;
        sort?: Sort;
        limit?: number;
    }): Promise<any>;
    updateData({ collection, key, data, }: {
        collection: string;
        key: string;
        data: any;
    }): Promise<void>;
    insertData({ collection, data, }: {
        collection: string;
        data: any;
    }): Promise<void>;
    deleteData({ collection, key, }: {
        collection: string;
        key: string;
    }): Promise<void>;
}
