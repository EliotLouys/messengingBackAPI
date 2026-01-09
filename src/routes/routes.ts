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
protectedRouter.post("/channels", createChannel); // Create a room
protectedRouter.get("/channels", getChannels); // List rooms
protectedRouter.post("/channels/:channelId/join", joinChannel);

// Messages Routes
protectedRouter.post("/messages", sendMessage); // Post a message
protectedRouter.get("/channels/:channelId/messages", getChannelMessages); // Read chat history

// User Routes
protectedRouter.get("user/meta", getMetadata);
protectedRouter.post("user/meta", postUserMetadata);

// 3. We define the routes inside
protectedRouter.get("/", defaultPage);

// 4. We mount the sub-router under '/protected'
router.use("/protected", protectedRouter);
export default router;
