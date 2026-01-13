import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret";

// Middleware function
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Get the token from the header (Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1]; // Get the part after "Bearer"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    // 2. Verify the token using our secret
    const decoded = jwt.verify(token, SECRET_KEY);

    // 3. Attach user info to the request (so controller can read it)
    // We cast to 'any' here for simplicity in this minimal setup
    (req as any).user = decoded;

    // 4. Move to the next step (the actual controller)
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};
