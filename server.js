const express = require("express");
const { connectDB } = require("./db");
const socketHandler = require("./socketHandler");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

connectDB().then(() => {
  server.listen(3000, () => {
    console.log("Server running on port 3000");
  });
  socketHandler(io);
});
