import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};

// Middleware to protect routes
export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret);
    // Allow demo/env super admin token without DB lookup
    if (decoded.userId === "demo-super-admin-id") {
      // Find the actual super admin user to get the real ObjectId
      const superAdmin = await User.findOne({
        role: "super_admin",
        username: process.env.SUPER_ADMIN_USERNAME || "super_admin",
      });

      if (superAdmin) {
        req.user = {
          _id: superAdmin._id,
          username: superAdmin.username,
          email: superAdmin.email,
          fullName: superAdmin.fullName,
          role: "super_admin",
          status: "approved",
        };
      } else {
        // Fallback to demo user if super admin not found
        req.user = {
          _id: "demo-super-admin-id",
          username: process.env.SUPER_ADMIN_USERNAME || "super_admin",
          email: process.env.SUPER_ADMIN_EMAIL || "admin@trainplanwise.com",
          fullName: "Super Administrator",
          role: "super_admin",
          status: "approved",
        };
      }
      return next();
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    if (user.status !== "approved" && user.role !== "super_admin") {
      return res.status(403).json({ message: "Account not approved." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    res.status(500).json({ message: "Server error during authentication." });
  }
};

// Middleware to check if user is admin or super admin
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error during authorization." });
  }
};

// Middleware to check if user is super admin
export const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Super admin access required." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error during authorization." });
  }
};
