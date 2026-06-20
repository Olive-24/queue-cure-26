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
    // Edge case: empty ya sirf-space wala naam reject kar do
    if (!data || !data.name || !data.name.trim()) {
      socket.emit("error-message", "Patient ka naam khali nahi ho sakta");
      return;
    }

    tokenCounter++;
    const newPatient = {
      id: tokenCounter,
      name: data.name.trim(),
      tokenNumber: tokenCounter,
      status: "waiting"
    };
    queue.push(newPatient);

    io.emit("queue-updated", getQueueState());
  });

  // ===== EVENT: Next token call karna =====
  let isProcessingCallNext = false; // race condition guard

  socket.on("call-next", () => {
    // Edge case 1: Agar ek call-next already process ho raha hai, naya ignore kar do
    if (isProcessingCallNext) return;

    // Edge case 2: Queue khali hai
    if (queue.length === 0) {
      socket.emit("error-message", "Queue khali hai, koi patient nahi hai");
      return;
    }

    isProcessingCallNext = true;

    currentToken = queue.shift();
    currentToken.status = "current";

    io.emit("queue-updated", getQueueState());

    // Thodi der ke liye lock rakhte hain taaki double-click se 2 patients na nikal jaye
    setTimeout(() => {
      isProcessingCallNext = false;
    }, 300);
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