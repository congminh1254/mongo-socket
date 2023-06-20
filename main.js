const { MongoConfig } = require("./lib/mongoClient");
const { MongoSocket } = require("./lib/mongoSocket");

const mongoSocket = new MongoSocket(
    MongoConfig.fromJson({
    host: "mongo.iot.chinhphucvn.com",
    port: 27017,
    user: "iot_socket",
    password: "ZRJkKZC9DFycue39",
    database: "demo_db",
  }),
  {
    host: "0.0.0.0",
    port: 3000,
  }
);

mongoSocket
  .start()
  .then(() => {
    console.log("MongoSocket started");
  })
  .catch((err) => {
    console.error("Error starting MongoSocket", err);
  });
