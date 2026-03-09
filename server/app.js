const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS for API routes
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// MongoDB Setup
const reportSchema = new mongoose.Schema({
  reporterId: String,
  reportedId: String,
  reason: String,
  timestamp: { type: Date, default: Date.now }
});
const Report = mongoose.model("Report", reportSchema);

const analyticsSchema = new mongoose.Schema({
  event: String,
  data: Object,
  timestamp: { type: Date, default: Date.now }
});
const Analytics = mongoose.model("Analytics", analyticsSchema);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/strangersync")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());

// API Routes
app.post("/api/report", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).send({ message: "Report submitted" });
  } catch (error) {
    res.status(500).send({ error: "Failed to submit report" });
  }
});

// Matching System
let waitingUsers = []; // Array of objects: { socketId, interests: [] }

function findMatch(socket, userInterests) {
  // Try to match based on interests
  if (userInterests && userInterests.length > 0) {
    const matchIndex = waitingUsers.findIndex(u =>
      u.socketId !== socket.id &&
      u.interests.some(interest => userInterests.includes(interest))
    );

    if (matchIndex !== -1) {
      return waitingUsers.splice(matchIndex, 1)[0];
    }
  }

  // fallback to random match
  const fallbackIndex = waitingUsers.findIndex(u => u.socketId !== socket.id);
  if (fallbackIndex !== -1) {
    return waitingUsers.splice(fallbackIndex, 1)[0];
  }

  return null;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-queue", ({ interests }) => {
    console.log(`Socket ${socket.id} joining queue with interests:`, interests);
    waitingUsers = waitingUsers.filter(u => u.socketId !== socket.id);
    const partner = findMatch(socket, interests);
    const partnerId = partner?.socketId;

    if (partnerId) {
      const roomName = `room-${socket.id}-${partnerId}`;
      const partnerSocket = io.sockets.sockets.get(partnerId);

      if (partnerSocket) {
        console.log(`Matching ${socket.id} with ${partnerId} in room ${roomName}`);
        socket.join(roomName);
        partnerSocket.join(roomName);

        io.to(roomName).emit("match-found", {
          roomName,
          users: [socket.id, partnerId]
        });

        io.to(roomName).emit("receive-message", {
          message: "You are now connected with a stranger!",
          senderId: "system",
          timestamp: new Date()
        });
      } else {
        console.log(`Partner ${partnerId} unreachable, putting ${socket.id} back in queue.`);
        waitingUsers.push({ socketId: socket.id, interests });
        socket.emit("waiting");
      }
    } else {
      console.log(`No match for ${socket.id}, waiting...`);
      waitingUsers.push({ socketId: socket.id, interests });
      socket.emit("waiting");
    }
  });

  socket.on("send-message", ({ roomName, message, senderId }) => {
    console.log(`Msg in ${roomName} from ${senderId}`);
    socket.to(roomName).emit("receive-message", { message, senderId, timestamp: new Date() });
  });

  socket.on("typing", ({ roomName, isTyping }) => {
    socket.to(roomName).emit("partner-typing", { isTyping });
  });

  socket.on("webrtc-offer", ({ roomName, offer }) => {
    console.log(`Forwarding offer in ${roomName}`);
    socket.to(roomName).emit("webrtc-offer", { offer });
  });

  socket.on("webrtc-answer", ({ roomName, answer }) => {
    console.log(`Forwarding answer in ${roomName}`);
    socket.to(roomName).emit("webrtc-answer", { answer });
  });

  socket.on("webrtc-ice-candidate", ({ roomName, candidate }) => {
    socket.to(roomName).emit("webrtc-ice-candidate", { candidate });
  });

  socket.on("leave-room", (roomName) => {
    console.log(`Socket ${socket.id} leaving ${roomName}`);
    socket.to(roomName).emit("partner-disconnected");
    socket.to(roomName).emit("receive-message", {
      message: "Stranger has left the conversation.",
      senderId: "system",
      timestamp: new Date()
    });
    socket.leave(roomName);
  });

  socket.on("disconnecting", () => {
    console.log(`Socket ${socket.id} disconnecting...`);
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit("partner-disconnected");
        socket.to(room).emit("receive-message", {
          message: "Stranger disconnected.",
          senderId: "system",
          timestamp: new Date()
        });
      }
    });
  });

  socket.on("disconnect", () => {
    waitingUsers = waitingUsers.filter(u => u.socketId !== socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
