import { Request, Response } from "express";
import * as ChannelRepo from "../repositories/channelRepository";
import * as MessageRepo from "../repositories/messageRepository";
import * as MemberRepo from "../repositories/memberRepository";

// --- Channels ---
export const createChannel = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Creates new channel"
     #swagger.parameters["body"]={
      in:"body",
      description:"Channel metadata",
      schema:{
        name:"Channel_name_here",
        description:"Channel_description_here"
      }
     }
  */

  const { name, description } = req.body;
  const username = (req as any).user.username; // Get the creator's username

  try {
    // 1. Create the channel
    const creatorId = (req as any).user.id;
    const channel = ChannelRepo.createChannel(
      name,
      description || "",
      creatorId
    );

    // 2. Automatically add the creator as a member
    MemberRepo.addMember(username, channel.id);

    res.status(201).json(channel);
  } catch (err: any) {
    if (err.message === "CHANNEL_EXISTS")
      return res.status(409).json({ error: "Channel name taken" });
    res
      .status(500)
      .json({ error: "Internal error", errorMessage: err.message });
  }
};

export const deleteChannel = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
     #swagger.security = [{ "bearerAuth": [] }] 
     #swagger.description = "Delete a channel by ID"
  */
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = (req as any).user.id;
    const success = ChannelRepo.deleteChannel(channelId, userId);
    if (success) {
      res.json({ message: "Channel deleted successfully" });
    } else {
      res
        .status(401)
        .json({ error: "Channel not found or unauthorized to perform" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Internal error", errorMessage: err.message });
  }
};

export const getChannels = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Get channels accessible to user"

  */
  const userId = (req as any).user.id; // Get ID from token
  const myChannels = ChannelRepo.getChannelsByUser(userId);
  res.json(myChannels);
};

export const sendMessage = (req: Request, res: Response) => {
  /* #swagger.tags = ['Message']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Send a message to the specified channel"
     #swagger.parameters["body"]={
      in:"body",
      description:"Message metadata",
      schema:{
        content:"Message_content",
        channelId:"Channel_ID_Where_to_send"
      }
    }
  */
  const { content, channelId } = req.body;
  const userId = (req as any).user.id;

  // --- SECURITY CHECK ---
  const isAllowed = MemberRepo.isMember(userId, channelId);
  if (!isAllowed) {
    return res
      .status(403)
      .json({ error: "You are not a member of this channel" });
  }
  // ----------------------

  const msg = MessageRepo.createMessage(userId, channelId, content);
  res.status(201).json(msg);
};

export const getChannelMessages = (req: Request, res: Response) => {
  /* #swagger.tags = ['Message']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Get messages for specified channel"
     #swagger.parameters["body"]={
      in:"body",
      description:"Channel ID",
      schema:{
        channelId:"Channel_ID_Where_to_send",
      }
    }
  */
  const channelId = parseInt(req.params.channelId);
  const userId = (req as any).user.id;

  // --- SECURITY CHECK ---
  const isAllowed = MemberRepo.isMember(userId, channelId);
  if (!isAllowed) {
    return res.status(403).json({ error: "Access Denied" });
  }
  // ----------------------

  const messages = MessageRepo.getMessagesByChannel(channelId);
  res.json(messages);
};

export const joinChannel = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Join the specified channel"
     #swagger.parameters['user_id'] = {
        in: 'path',
        description: 'The unique ID of the user',
        required: true,
        type: 'string'
     }
     #swagger.parameters['channel_id'] = {
        in: 'path',
        description: 'The unique ID of the channel to join', 
        required: true,
        type: 'string'
      }
  */
  const channelId = parseInt(req.params.channel_id);

  const username = req.params.user_id;
  const requestSenderId = (req as any).user.id;

  const success = MemberRepo.addMember(username, channelId, requestSenderId);
  if (success) {
    res.json({ message: "Joined channel successfully" });
  } else {
    res.status(400).json({ message: "Already a member or invalid channel" });
  }
};

export const leaveChannel = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Leave the specified channel"
     #swagger.parameters['user_id'] = {
        in: 'path',
        description: 'The unique ID of the user',
        required: true,
        type: 'string'
     }
     #swagger.parameters['channel_id'] = {
        in: 'path',
        description: 'The unique ID of the channel to join', 
        required: true,
        type: 'string'
      }
  */
  const channelId = parseInt(req.params.channel_id);
  const targetUsername = req.params.user_id;
  const userId = (req as any).user.id;
  const success = MemberRepo.removeMember(targetUsername, channelId, userId);
  if (success) {
    res.json({ message: "Left channel successfully" });
  } else {
    res.status(400).json({ message: "Not a member or invalid channel" });
  }
};
