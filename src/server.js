import dns from "node:dns";
// Force reliable public DNS to prevent MongoDB Atlas SRV lookup errors
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Load environment variables FIRST before any other imports that need them
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

import app from "./app.js";
import connectDb from "./config/dbConfig.js";
import "./config/cloudinaryConfig.js";

const PORT = Number(process.env.PORT || 3000);

const startServer = async () => {
    try {
        if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
            throw new Error("PORT must be an integer between 1 and 65535.");
        }

        // Connect to MongoDB first
        await connectDb();

        // Start the server only after a successful database connection
        const server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Error starting the HTTP server:", error.message);
            process.exitCode = 1;
        });
    } catch (error) {
        console.error("Error starting the application:", error.message);
        process.exitCode = 1;
    }
};

startServer();