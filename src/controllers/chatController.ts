import { Request, Response } from "express";
import * as ChannelRepo from "../repositories/channelRepository";
import * as MessageRepo from "../repositories/messageRepository";
import * as MemberRepo from "../repositories/memberRepository";
import { ChannelUpdateMetadata, validateTheme } from "../models/model";

// --- Channels ---
export const createChannel = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = "Creates new channel"
    #swagger.requestBody = {
    description: "Create a new channel",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        example: "Channel_name_here"
                    },
                    description: {
                        type: "string",
                        example: "Channel_description_here"
                    },
                    img: {
                        type: "string",
                        exemple: "https://exemple.com"
                    },
                    theme: {
                        type: "object",
                        properties: {
                            primary_color: { type: "string", example: "#E91E63" },
                            primary_color_dark: { type: "string", example: "#C2185B" },
                            accent_color: { type: "string", example: "#00BCD4" },
                            text_color: { type: "string", example: "#212121" },
                            accent_text_color: { type: "string", example: "#FFFFFF" }
                        }
                    }
                    
                },
                required: ["name"]
            }
        }
    }
}
*/

  const { name, description, img, theme } = req.body;
  const username = (req as any).user.username; // Get the creator's username

  if (!validateTheme(theme)) {
    return res.status(400).json({
      error: "Invalid Theme Format",
      message:
        "Theme must contain primary_color, primary_color_dark, accent_color, text_color, and accent_text_color (all strings).",
    });
  }

  try {
    // 1. Create the channel
    const creatorId = (req as any).user.id;
    // console.log(name, description, img, theme, creatorId);
    const channel = ChannelRepo.createChannel(
      name,
      description || "",
      img,
      theme,
      creatorId
    );

    // 2. Automatically add the creator as a member
    console.log(username, channel.id, creatorId);
    MemberRepo.addMember(username, channel.id, creatorId);
    console.log("Came through");
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
    console.log(channelId, userId, success);
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

export const updateChannelMetadata = (req: Request, res: Response) => {
  /* #swagger.tags = ['Channel']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Update channel metadata"
     #swagger.parameters['channelId'] = {
        in: 'path',
        description: 'The unique ID of the channel', 
        required: true,
        type: 'string'
      }
     #swagger.requestBody = {
    description: "Channel metadata to update",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    name: { type: "string", example: "New Channel Name" },
                    description: { type: "string", example: "Updated description" },
                    img: { type: "string", example: "https://example.com/new-image.png" },
                    theme: {
                        type: "object",
                        properties: {
                            primary_color: { type: "string", example: "#E91E63" },
                            primary_color_dark: { type: "string", example: "#C2185B" },
                            accent_color: { type: "string", example: "#00BCD4" },
                            text_color: { type: "string", example: "#212121" },
                            accent_text_color: { type: "string", example: "#FFFFFF" }
                        }
                    }
                }
            }
        }
    }
}
  */

  const channelId = parseInt(req.params.channelId);
  const userId = (req as any).user.id;
  const { name, description, img, theme } = req.body;

  // --- VALIDATION ---
  if (theme && !validateTheme(theme)) {
    return res.status(400).json({
      error: "Invalid Theme Format",
      message:
        "Theme object is missing required color fields or contains invalid values.",
    });
  }

  try {
    const updateData: ChannelUpdateMetadata = {
      name,
      description,
      img,
      theme,
    };

    ChannelRepo.updateChannel(channelId, userId, updateData);

    res.status(200).json({
      message: "Channel updated successfully",
      updatedFields: updateData,
    });
  } catch (err: any) {
    if (err.message === "CHANNEL_NOT_FOUND") {
      return res.status(404).json({ error: "Channel not found" });
    }
    if (err.message === "UNAUTHORIZED") {
      return res
        .status(403)
        .json({ error: "Only the channel creator can update settings" });
    }
    if (err.message === "CHANNEL_NAME_TAKEN") {
      return res.status(409).json({ error: "Channel name is already taken" });
    }

    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = (req: Request, res: Response) => {
  /* #swagger.tags = ['Message']
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.description = "Send a message to the specified channel"
     #swagger.parameters['channelId'] = {
        in: 'path',
        description: 'The unique ID of the channel to get the messages from', 
        required: true,
        type: 'string'
      }
     #swagger.requestBody = {
    description: "Sends a new message",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    content: {
                        type: "string",
                        example: "Message content"
                    },
                    type: {
                        type: "string",
                        example: "Message type"
                    }
                }
            }
        }
    }
}
  */
  const { content, type } = req.body;
  const channelId = parseInt(req.params.channelId);
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
     #swagger.parameters['channelId'] = {
        in: 'path',
        description: 'The unique ID of the channel to get the messages from', 
        required: true,
        type: 'string'
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
     #swagger.parameters['username'] = {
        in: 'path',
        description: 'The username of the user we want to add',
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
     #swagger.parameters['username'] = {
        in: 'path',
        description: 'The username of the user we want to add',
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
