const { Server } = require("socket.io");

let io = null;
const userSockets = new Map(); // Maps userId -> set of socketIds

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Register user session
    socket.on("register", (userId) => {
      if (userId) {
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        socket.userId = userId;
        console.log(`Socket Registered user: ${userId} with socket: ${socket.id}`);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`Socket Disconnected: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });

  return io;
};

// Send notification to a specific user
exports.sendNotification = (userId, type, payload) => {
  if (io && userSockets.has(userId)) {
    const sockets = userSockets.get(userId);
    sockets.forEach((socketId) => {
      io.to(socketId).emit("notification", { type, payload, timestamp: new Date() });
    });
    return true;
  }
  return false;
};

// Broadcast to all connected clients
exports.broadcast = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};
