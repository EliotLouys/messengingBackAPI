import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as UserRepo from "../repositories/userRepository"; // Import the repo
const SECRET_KEY = process.env.JWT_SECRET || "secret";

export const register = async (req: Request, res: Response) => {
  /* #swagger.tags = ['Auth']
    #swagger.description = 'Register a new user'
     #swagger.requestBody = {
    description: "New user metadata",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    username: {
                        type: "string",
                        example: "username"
                    },
                    password: {
                        type: "string",
                        example: "password type"
                    }
                }
            }
        }
    }
}
  */
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    // Call the Repository
    const newUser = await UserRepo.createUser(username, password);
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.message === "USERNAME_TAKEN") {
      return res.status(409).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Internal Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  /* #swagger.tags = ['Auth']
    #swagger.description = 'Login a user and return jwt token'
    #swagger.requestBody = {
    description: "User metadata",
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    username: {
                        type: "string",
                        example: "username"
                    },
                    password: {
                        type: "string",
                        example: "password type"
                    }
                }
            }
        }
    }
}
    #swagger.responses[200]={
      description: 'Login successful',
      schema: {
        token: 'jwt_token_here'
      }
    }
  */
  console.log("/POST login");
  const { username, password } = req.body;

  // Call the Repository
  // (We cast to 'any' here because better-sqlite3 types can be generic)
  const user = UserRepo.findUserByUsername(username) as any;

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({ token });
};

export const defaultPage = (req: Request, res: Response) => {
  res.json("Welcome to API, test to see something ");
};

export const extendSession = (req: Request, res: Response) => {
  /* #swagger.tags = ['Auth']
  // 1. Force the padlock (Security Scheme) to appear
     #swagger.security = [{ "bearerAuth": [] }]

     // 2. Hide the auto-generated "authorization" parameter
    #swagger.autoHeaders = false
    #swagger.description = 'Extend the validity of the current session (Sliding Window)'
    
    #swagger.responses[200] = {
      description: 'Session extended successfully',
      schema: {
        message: 'Session extended',
        token: 'new_jwt_token_here'
      }
    }
  */
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Get the part after "Bearer"
  const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret";

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
    const { exp, iat, ...userData } = decoded;
    const newToken = jwt.sign(userData, SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Session extended",
      token: newToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};
