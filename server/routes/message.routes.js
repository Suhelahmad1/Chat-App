import express from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import {
  getMessage,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

// Get users and messages
messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessage);

// Mark as seen endpoint (Standard Name)
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

// Send message
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
