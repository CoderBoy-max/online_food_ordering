import express from "express";

const app = express();



app.use(express.json());

app.use((req, res, next) => {
    next(new Error("404 Not found"));
});

export default app;