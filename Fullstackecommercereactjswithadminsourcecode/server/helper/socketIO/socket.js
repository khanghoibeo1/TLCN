// helper/socketIO/socket.js
const { Server } = require("socket.io");

const userSocketMap = {};
let io; 

// Hàm init được gọi 1 lần với HTTP server
function init(server) {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_BASE_URL,
        process.env.ADMIN_BASE_URL,
        'http://localhost:3008',
        'http://localhost:3002',
        'https://final-ecommerce-server.onrender.com'
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

// Lấy socketId đang lưu cho một user
function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Lấy instance io (sau khi init)
function getIo() {
  return io;
}

module.exports = { init, getReceiverSocketId, getIo };
