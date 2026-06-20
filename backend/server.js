const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // hackathon ke liye sab allow rakha hai
});

// ===== QUEUE STATE (in-memory) =====
let queue = [];          // waiting patients: {id, name, tokenNumber, status}
let currentToken = null; // jo abhi consult ho raha hai
let avgConsultTime = 5;  // minutes
let tokenCounter = 0;    // har naye patient ko increasing number

// ===== HELPER FUNCTION: queue ki latest state banata hai =====
function getQueueState() {
  return {
    queue: queue,
    currentToken: currentToken,
    avgConsultTime: avgConsultTime
  };
}

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Queue Cure backend running");
});

// ===== SOCKET CONNECTION HANDLING =====
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Jab naya client connect ho, usse turant current state bhej do
  socket.emit("queue-updated", getQueueState());

  // ===== EVENT: Naya patient add karna =====
  socket.on("add-patient", (data) => {
    tokenCounter++;
    const newPatient = {
      id: tokenCounter,
      name: data.name,
      tokenNumber: tokenCounter,
      status: "waiting" // waiting | current | done
    };
    queue.push(newPatient);

    io.emit("queue-updated", getQueueState());
  });

  // ===== EVENT: Next token call karna =====
  socket.on("call-next", () => {
    if (queue.length === 0) {
      socket.emit("error-message", "Queue khali hai, koi patient nahi hai");
      return;
    }

    currentToken = queue.shift();
    currentToken.status = "current";

    io.emit("queue-updated", getQueueState());
  });

  // ===== EVENT: Average consultation time set karna =====
  socket.on("set-avg-time", (minutes) => {
    avgConsultTime = minutes;
    io.emit("queue-updated", getQueueState());
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ===== ERROR HANDLING =====
server.on("error", (err) => {
  console.error("Server error:", err);
});

// ===== START SERVER =====
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});