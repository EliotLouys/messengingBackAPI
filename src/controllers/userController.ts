import * as userRepo from "../repositories/userRepository";
import { Request, Response } from "express";

// --- GET Metadata ---
export const getMetadata = (req: Request, res: Response) => {
  /* #swagger.tags = ['User']
    #swagger.description = 'Retrieve the logged-in user\'s profile information'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'User metadata found',
      schema: {
        username: 'john_doe',
        display_name: 'John D.',
        img: 'https://example.com/avatar.png',
        status: 'Online'
      }
    }
    #swagger.responses[404] = { description: 'User not found' }
  */
  try {
    // Ensure userId is a number (JWT payload might provide it as string or number)
    // @ts-ignore
    const userId = Number(req.user.id);

    const metadata = userRepo.findUserMetaData(userId);

    if (!metadata) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(metadata);
  } catch (error) {
    console.error("Get Metadata Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const postUserMetadata = (req: Request, res: Response) => {
  /* #swagger.tags = ['User']
    #swagger.description = 'Update user profile details. Only sends fields you want to change.'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update',
        schema: {
            display_name: "CoolUser",
            img: "https://example.com/avatar.png",
            status: "Coding..."
        }
    }
    #swagger.responses[200] = { 
      description: 'Profile updated successfully',
      schema: {
        message: 'Profile updated successfully',
        data: {
          username: 'john_doe',
          display_name: 'CoolUser',
          img: 'https://example.com/avatar.png',
          status: 'Coding...'
        }
      }
    }
  */
  try {
    // @ts-ignore
    const userId = Number(req.user.id);
    const { display_name, img, status } = req.body;
    // Basic Validation
    if (img && typeof img !== "string") {
      return res.status(400).json({ message: "Image must be a string URL" });
    }

    // Update the DB
    userRepo.updateUserMetaData(userId, { display_name, img, status });

    // Fetch the updated data to return it (common REST practice)
    const updatedMetadata = userRepo.findUserMetaData(userId);

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedMetadata,
    });
  } catch (error) {
    console.error("Get Metadata Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
