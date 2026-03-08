import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { userId } = jwt.verify(token, config.jwtSecret);
    req.userId = userId?.toString?.() ?? userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
