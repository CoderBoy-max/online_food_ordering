import express from "express";
import adminRoutes from "./admin/adminRoutes.js";

const app = express();
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMaxRequests = 100;
const requestCounts = new Map();

const rateLimiter = (req, res, next) => {
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const normalizedIp = Array.isArray(clientIp) ? clientIp[0] : String(clientIp).split(",")[0].trim();
    const now = Date.now();
    const existing = requestCounts.get(normalizedIp) || { count: 0, resetAt: now + rateLimitWindowMs };

    if (now > existing.resetAt) {
        existing.count = 0;
        existing.resetAt = now + rateLimitWindowMs;
    }

    if (existing.count >= rateLimitMaxRequests) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    existing.count += 1;
    requestCounts.set(normalizedIp, existing);
    next();
};

app.disable("x-powered-by");
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});
app.use(rateLimiter);
app.use(express.json({ limit: "1mb" }));
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("Unhandled application error:", error);

    if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
    }

    if (error.statusCode === 401 || error.name === "UnauthorizedError") {
        return res.status(401).json({ message: error.message || "Unauthorized" });
    }

    if (error.statusCode === 403) {
        return res.status(403).json({ message: error.message || "Forbidden" });
    }

    res.status(500).json({ message: "Internal server error" });
});

export default app;