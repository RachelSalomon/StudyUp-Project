const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIO = require("socket.io");

// Import authentication routes
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyup";

// Express middleware setup
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/search", searchRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("StudyUp server is running");
});

// Socket.io event handling
const rooms = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    // Leave previous rooms to ensure the client stays in one room at a time
    const currentRooms = Array.from(socket.rooms);
    currentRooms.forEach((r) => {
      if (r !== socket.id) socket.leave(r);
    });

    socket.join(data.room);

    if (!rooms[data.room]) rooms[data.room] = [];

    // Prevent duplicate entries of the same user inside the server memory array
    rooms[data.room] = rooms[data.room].filter((u) => u.userId !== data.userId);
    rooms[data.room].push({ userId: data.userId, username: data.username });

    io.to(data.room).emit("room_users", rooms[data.room]);
  });

  socket.on("send_message", (data) => {
    // Included 'room' property in the payload so the frontend can filter channels correctly
    io.to(data.room).emit("receive_message", {
      room: data.room,
      userId: data.userId,
      username: data.username,
      message: data.message,
      timestamp: new Date(),
    });
  });

  socket.on("leave_room", (data) => {
    socket.leave(data.room);
    if (rooms[data.room]) {
      rooms[data.room] = rooms[data.room].filter(
        (u) => u.userId !== data.userId,
      );
      io.to(data.room).emit("room_users", rooms[data.room]);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Database connection and server startup
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});
