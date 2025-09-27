import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Always use Atlas connection string - no fallback to localhost
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    // Override any environment variable to ensure Atlas connection
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");
    console.log("🔒 Forced Atlas connection - no localhost fallback");
    const conn = await mongoose.connect(atlasUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.log(
      "⚠️  Server will continue running without database (Demo Mode)"
    );
    // Don't exit - allow server to run for demo purposes
    // process.exit(1);
  }
};

export default connectDB;
