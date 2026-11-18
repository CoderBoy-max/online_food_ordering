import jwt from "jsonwebtoken";

export const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET must be configured.");
  }

  return secret;
};

const generateToken = (payload, expiresIn = process.env.ADMIN_JWT_TTL || "7d") =>
  jwt.sign(payload, getJwtSecret(), { expiresIn });

export default generateToken;
