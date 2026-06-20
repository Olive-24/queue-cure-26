const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let queue = [];
let currentToken = null;
let avgConsultTime = 5;
let tokenCounter = 0;

app.get("/", (req, res) => {
  res.send("Queue Cure backend running");
});

server.on('error', (err) => {
  console.error("Server error:", err);
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});