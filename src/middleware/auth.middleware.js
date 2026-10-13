import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import { getJwtSecret } from "../../utils/generateToken.js";

export const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: "Failed to validate admin token", error: error.message });
  }

  try {
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found or token invalid" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ message: "Failed to authenticate admin", error: error.message });
  }
};

export const authorizeFounder = (req, res, next) => {
  if (!req.admin || req.admin.role !== "founder") {
    return res.status(403).json({ message: "Founder access required" });
  }

  next();
};
