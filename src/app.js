import express from "express";
import adminRoutes from "./admin/adminRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

export default app;