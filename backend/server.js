import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import reportsRoutes from "./routes/reports.js";
import alertsRoutes from "./routes/alerts.js";
import brandingRoutes from "./routes/branding.js";
import cleaningRoutes from "./routes/cleaning.js";
import stablingRoutes from "./routes/stabling.js";
import optimizerRoutes from "./routes/optimizer.js";
import feedbackRoutes from "./routes/feedback.js";
import schedulingRoutes from "./routes/scheduling.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB().catch((error) => {
  console.log(
    "⚠️  Atlas connection failed, continuing in demo mode:",
    error.message
  );
});

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});

// CORS configuration
const isDev = (process.env.NODE_ENV || "development") !== "production";
const corsOptions = {
  origin: isDev
    ? true // reflect request origin in dev for convenience (localhost or LAN IP)
    : function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
          process.env.FRONTEND_URL || "http://localhost:5173",
          "http://localhost:8080",
          "http://localhost:8081",
          "http://localhost:8082",
          "http://localhost:5173",
          "http://127.0.0.1:8080",
          "http://127.0.0.1:5173",
        ];
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Enable CORS and handle preflight early
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// JSON parsing
app.use(express.json({ limit: "10mb" }));

// Ingestion endpoints for induction planning variables
app.use("/api/branding", brandingRoutes);
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/stabling", stablingRoutes);

// Induction optimizer endpoint
app.use("/api/optimizer", optimizerRoutes);

// Induction feedback endpoints
app.use("/api/feedback", feedbackRoutes);
app.use("/api/scheduling", schedulingRoutes);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply rate limiting to all requests (after CORS so preflight gets headers)
app.use("/api/", limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth routes
  message: {
    message: "Too many authentication attempts, please try again later.",
  },
});

// Middleware (other middleware already applied above)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Train Plan Wise Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug endpoint to help troubleshoot frontend issues
app.get("/debug", (req, res) => {
  res.status(200).json({
    message: "Debug endpoint working",
    timestamp: new Date().toISOString(),
    userAgent: req.get("User-Agent"),
    origin: req.get("Origin"),
    referer: req.get("Referer"),
    headers: req.headers,
    url: req.url,
    method: req.method,
  });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/alerts", alertsRoutes);

// Google OR-Tools Proxy - Forward optimization requests to Python service
app.use("/api/train-scheduling", (req, res, next) => {
  console.log(`🔄 Proxying OR-Tools request: ${req.method} ${req.url}`);

  const ortoolsProxy = createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
      console.error("OR-Tools service proxy error:", err.message);
      if (!res.headersSent) {
        res.status(503).json({
          error: "OR-Tools optimization service unavailable",
          message:
            "Please ensure the Python OR-Tools service is running on port 8001",
          service_url: "http://localhost:8001",
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        `✅ OR-Tools response: ${proxyRes.statusCode} for ${req.url}`
      );
    },
  });

  ortoolsProxy(req, res, next);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Train Plan Wise Backend API",
    version: "1.0.0",
    status: "Active",
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      data: "/api/data/*",
      reports: "/api/reports/*",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate entry",
      error: "This record already exists",
    });
  }

  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📡 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(
    `💾 MongoDB URI: ${
      process.env.MONGODB_URI ? "Connected" : "Not configured"
    }`
  );
});
