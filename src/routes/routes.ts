import { Router } from "express";
import {
  defaultPage,
  login,
  register,
  extendSession,
} from "../controllers/controller";
import { authMiddleware } from "../auth";
import {
  createChannel,
  getChannelMessages,
  getChannels,
  sendMessage,
  joinChannel,
  deleteChannel,
  leaveChannel,
} from "../controllers/chatController";
import { getMetadata, postUserMetadata } from "../controllers/userController";
const router = Router();

// Public Route (Anyone can log in)
router.post("/register", register);
router.post("/login", login);

// Protected Routes Group
// 1. We create a sub-router
const protectedRouter = Router();

// 2. We apply the middleware to this sub-router
protectedRouter.use(authMiddleware);

protectedRouter.post("/extends", extendSession);

// Channels Routes
protectedRouter.post("/channel", createChannel); // Create a channel
protectedRouter.get("/user/channel", getChannels); // List channels
protectedRouter.delete("/channel/:channelId", deleteChannel); //Deletes a channel
protectedRouter.put("/channel/:channel_id/user/:user_id", joinChannel); // Invites to  a room
protectedRouter.delete("/channel/:channel_id/user/:user_id", leaveChannel); // Leave a room

// Messages Routes
protectedRouter.post("/messages", sendMessage); // Post a message
protectedRouter.get("/channel/:channelId/messages", getChannelMessages); // Read chat history

// User Routes
protectedRouter.get("user/meta", getMetadata);
protectedRouter.post("user/meta", postUserMetadata);

// 3. We define the routes inside
protectedRouter.get("/", defaultPage);

// 4. We mount the sub-router under '/protected'
router.use("/protected", protectedRouter);
export default router;
