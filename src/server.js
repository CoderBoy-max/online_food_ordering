import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./config/dbConfig.js";

dotenv.config();

const PORT = process.env.PORT;

const startServer = async () => {
    try{
        await connectDb();

    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
    } catch (error) {
        console.error('Error starting the server:', error.message);
        process.exit(1);
    }

}

startServer();