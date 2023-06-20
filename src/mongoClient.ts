import {
  Db,
  Document,
  Filter,
  MongoClientOptions,
  MongoClient as MongoDbClient,
  ObjectId,
  Sort,
} from "mongodb";

export class MongoConfig {
  connectionStr: string;
  db: string | undefined;

  constructor(connectionStr: string, db: string) {
    this.connectionStr = connectionStr;
    this.db = db;
  }

  static fromJson({
    host,
    port,
    user,
    password,
    database,
  }: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }) {
    return new MongoConfig(
      `mongodb://${user}:${password}@${host}:${port}?authMechanism=DEFAULT&directConnection=true`,
        database
    );
  }
}

export default class MongoClient {
  private config: MongoConfig;
  private client: MongoDbClient | undefined;
  private options: MongoClientOptions | undefined;

  constructor(config: MongoConfig, options?: MongoClientOptions) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.client = new MongoDbClient(this.config.connectionStr, this.options);
    await this.client.connect();
    return;
  }

  async close(): Promise<void> {
    await this.client!.close();
    return;
  }

  async getDatabase(): Promise<Db> {
    return this.client!.db(this.config.db);
  }

  async updateBatchData(
    {
      collection,
      data,
      drop,
    }: {
      collection: string;
      data: any;
      drop?: boolean;
    }
  ): Promise<void> {
    await this.connect();
    const db = await this.getDatabase();
    const collection_ = db.collection(collection);
    if (drop) {
      try {
        await collection_.drop();
      } catch (e) {
        console.log(e);
      }
      try {
        await db.createCollection(collection);
      } catch (e) {
        console.log(e);
      }
    }
    await Promise.all(
      Object.keys(data).map(async (key) => {
        return collection_.updateOne(
          { _id: new ObjectId(key) },
          { $set: data[key] },
          { upsert: true }
        );
      })
    );
    await this.close();
    return;
  }

  async getData({
    collection,
    key,
    filter,
    sort,
    limit,
  }: {
    collection: string;
    key?: string;
    filter?: Filter<Document>;
    sort?: Sort;
    limit?: number;
  }): Promise<any> {
    let result: any;
    await this.connect();
    const db = await this.getDatabase();
    const collection_ = db.collection(collection);

    if (key) {
      result = await collection_.findOne({ _id: new ObjectId(key) });
    } else {
      let find = filter ? collection_.find(filter) : collection_.find();
      if (sort) {
        find = find.sort(sort);
      }
      if (limit) {
        find = find.limit(limit);
      }
      let list_data = await find.toArray();
      result = {};
      list_data.forEach((data) => {
        result[data._id.toString()] = data;
      });
    }
    await this.close();
    return result;
  }

  async updateData({
    collection,
    key,
    data,
  }: {
    collection: string;
    key: string;
    data: any;
  }): Promise<void> {
    await this.connect();
    const db = await this.getDatabase();
    const collection_ = db.collection(collection);
    await collection_.updateOne(
      { _id: new ObjectId(key) },
      { $set: data },
      { upsert: true }
    );
    await this.close();
    return;
  }

  async insertData({
    collection,
    data,
  }: {
    collection: string;
    data: any;
  }): Promise<void> {
    console.log(this.connect)
    await this.connect();
    const db = await this.getDatabase();
    const collection_ = db.collection(collection);
    await collection_.insertOne(data);
    await this.close();
    return;
  }

  async deleteData({
    collection,
    key,
  }: {
    collection: string;
    key: string;
  }): Promise<void> {
    await this.connect();
    const db = await this.getDatabase();
    const collection_ = db.collection(collection);
    await collection_.deleteOne({ _id: new ObjectId(key) });
    await this.close();
    return;
  }
}
