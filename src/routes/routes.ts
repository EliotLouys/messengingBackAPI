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

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.post(
  "/register",
  // #swagger.security = []
  register
);

router.post(
  "/login",
  // #swagger.security = []
  login
);
// ==========================================
// PROTECTED ROUTES MIDDLEWARE
// ==========================================
// This applies authMiddleware to any request starting with /protected
router.use("/protected", authMiddleware);

// ==========================================
// PROTECTED ROUTES (Explicit Paths)
// ==========================================

// Session
router.post("/protected/extends", extendSession);

// Channels
router.post("/protected/channel", createChannel);
router.get("/protected/user/channel", getChannels);
router.delete("/protected/channel/:channelId", deleteChannel);
router.put("/protected/channel/:channel_id/user/:user_id", joinChannel);
router.delete("/protected/channel/:channel_id/user/:user_id", leaveChannel);

// Messages
router.post("/protected/messages", sendMessage);
router.get("/protected/channel/:channelId/messages", getChannelMessages);

// User
// Note: Fixed the missing slash from your original code here as well
router.get("/protected/user/meta", getMetadata);
router.post("/protected/user/meta", postUserMetadata);

// Default
router.get("/protected/", defaultPage);

export default router;
