const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

require("dotenv").config();
console.log(process.env.q);

const usersRouter = require("./users/users.routers");

const controllers = require("./users/users.controllers.js");

class Server {
  constructor() {
    this.server = null;
  }

  async startServer() {
    this.initServer();
    this.initMiddleware();
    this.initRoutrs();
    this.listenServer();
    await this.initDatabase();
  }

  initServer() {
    this.server = express();
  }

  initMiddleware() {
    this.server.use(express.json());
    this.server.use(morgan("combined"));
    this.server.use(express.static("public"));
  }

  initRoutrs() {
    this.server.use("/users", usersRouter);
  }

  async initDatabase() {
    const option = { useUnifiedTopology: true, useNewUrlParser: true };
    try {
      await mongoose.connect(process.env.MONGODB_URL, option);
      console.log("Database connection successful");
    } catch (err) {
      console.log(`Server was closed with connect to db`);
      process.exit(1);
    }
  }

  listenServer() {
    this.server.listen(3000, () => console.log("Started Port", 3000));
  }
}

module.exports = new Server().startServer();
