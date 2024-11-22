// lib/auth.js
import { getAuth } from "@clerk/nextjs/server";

export const requireAuth = (handler) => async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // You can attach the userId to the request object if needed
  req.userId = userId;
  return handler(req, res);
};
