import mongoose from "mongoose";


const connectDb = async () => {
    try{
        const dbUri = process.env.DEVELOPMENT_DB_URI.replace('<db_password>', process.env.MONGO_DB_PASSWORD);
        const connect = await mongoose.connect(dbUri)
        console.log(`MongoDB connected: ${connect.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MONGO_DB:', error.message);

        process.exit(1);
    }
}

export default connectDb;