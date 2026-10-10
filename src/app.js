import express from "express";

const app = express();

app.use(express.json());

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

export default app;