const express = require("express");
const app = express();
const path = require("path");

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);

let waitingusers = [];
let rooms = {};

io.on("connection", function (socket) {
  socket.on("joinroom", function () {
    if (waitingusers.length > 0) {
      let partner = waitingusers.shift();
      let roomname = `${socket.id}-${partner.id}`;

      socket.join(roomname);
      partner.join(roomname);

      io.to(roomname).emit("joined", roomname);
    } else {
      waitingusers.push(socket);
    }
  });

  socket.on("message", function (data) {
    socket.broadcast.to(data.room).emit("message", data.message);
  });

  socket.on("signalingMessage", function (data) {
    socket.broadcast.to(data.room).emit("signalingMessage", data.message);
  });

  socket.on("startVideoCall", function ({ room }) {
    socket.broadcast.to(room).emit("incomingCall");
  });
  socket.on("acceptCall", function ({ room }) {
    socket.broadcast.to(room).emit("callAccepted");
  });
  socket.on("rejectCall", function ({ room }) {
    socket.broadcast.to(room).emit("callRejected");
  });

  socket.on("startVoiceCall", function ({ room }) {
    socket.broadcast.to(room).emit("incomingVoiceCall");
  });
  socket.on("acceptVoiceCall", function ({ room }) {
    socket.broadcast.to(room).emit("voiceCallAccepted");
  });
  socket.on("rejectVoiceCall", function ({ room }) {
    socket.broadcast.to(room).emit("voiceCallRejected");
  });
  socket.on("cancelVoiceCall", function ({ room }) {
    socket.broadcast.to(room).emit("voiceCallRejected");
  });
  socket.on("voiceSignalingMessage", function (data) {
    socket.broadcast.to(data.room).emit("voiceSignalingMessage", data.message);
  });

  // --- NEXT and disconnect/leave logic ---
  function getRoomOfSocket(socket) {
    const roomsOfSocket = Array.from(socket.rooms);
    // The first room is always the socket id, so look for another
    return roomsOfSocket.find((r) => r !== socket.id);
  }

  function notifyAndLeave(socket) {
    const room = getRoomOfSocket(socket);
    if (room) {
      // Notify all in the room (except the leaver)
      socket.broadcast.to(room).emit("partnerDisconnected");
      // Remove all users from the room
      const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
      clients.forEach((clientId) => {
        const clientSocket = io.sockets.sockets.get(clientId);
        if (clientSocket) {
          clientSocket.leave(room);
          // Remove from waitingusers if present
          let idx = waitingusers.indexOf(clientSocket);
          if (idx !== -1) waitingusers.splice(idx, 1);
          // Reset their room on client
          clientSocket.emit("joined", null);
        }
      });
      // Also remove the leaver from waitingusers if present
      let idx = waitingusers.indexOf(socket);
      if (idx !== -1) waitingusers.splice(idx, 1);
      socket.leave(room);
      socket.emit("joined", null);
    }
  }

  socket.on("next", function () {
    notifyAndLeave(socket);
    // Requeue for new match
    if (!waitingusers.includes(socket)) waitingusers.push(socket);
    // Try to match again
    if (waitingusers.length > 1) {
      let partner = waitingusers.shift();
      if (partner === socket) partner = waitingusers.shift();
      if (!partner) return;
      let roomname = `${socket.id}-${partner.id}`;
      socket.join(roomname);
      partner.join(roomname);
      io.to(roomname).emit("joined", roomname);
    }
  });

  socket.on("disconnect", function () {
    notifyAndLeave(socket);
    // Remove from waitingusers if present
    let idx = waitingusers.indexOf(socket);
    if (idx !== -1) waitingusers.splice(idx, 1);
  });
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes");

app.use("/", indexRouter);

server.listen(3000);
