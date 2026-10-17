
import express from "express";
import adminRoutes from "./admin/adminRoutes.js";
import addressRoutes from "./address/addressRoutes.js";
import restaurantRoutes from "./restaurant/restaurantRoutes.js";
import authRoutes from "./routes/auth.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/restaurants", restaurantRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
