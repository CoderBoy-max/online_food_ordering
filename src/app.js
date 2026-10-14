import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from './routes/authroutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import cartRoutes from './routes/cartRoute.js';

const app = express();

// parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/cart', cartRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

export default app;