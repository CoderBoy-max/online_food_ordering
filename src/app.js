import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from './routes/authroutes.js';
import addressRoutes from './address/addressRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import cartRoutes from './routes/cartRoute.js';
import restaurantRoutes from './restaurant/restaurantRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import ownerOrderRoutes from './routes/ownerOrderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

// parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/cart', cartRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/owner/orders', ownerOrderRoutes);

app.use('/api', reviewRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;