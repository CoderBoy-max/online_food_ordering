import express from "express";
import adminRoutes from "./admin/adminRoutes.js";
import publicRestaurantRoutes from "./restaurant/publicRestaurantRoutes.js";
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/restaurants", publicRestaurantRoutes);
// app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;