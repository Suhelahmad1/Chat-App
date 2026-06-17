import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import { Server } from "socket.io";

// authRouter to accurately reflect signup/login routes
import authRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

// Store online user
export const userSocketMap = {};

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected :", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setups (10mb limits for base64 images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Connect to MongoDB (Top-level await keeps connection alive)
await connectDB();

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// FIXED: Hamesha listen karo, chahe local ho ya production/Vercel
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log("Server is running on the PORT: " + PORT),
);

// Export app/server for Vercel Serverless Architecture
export default app;
