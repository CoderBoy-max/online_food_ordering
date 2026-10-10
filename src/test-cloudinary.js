import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import cloudinary from "./config/cloudinaryConfig.js";

// Load environment variables correctly
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const testCloudinary = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log("Cloudinary connected successfully:", result);
    } catch (error) {
        console.error("Cloudinary connection failed:", error.message);
    }
};

testCloudinary();