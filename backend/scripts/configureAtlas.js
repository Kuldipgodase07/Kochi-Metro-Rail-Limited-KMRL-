import fs from "fs";
import path from "path";

const configureAtlas = () => {
  try {
    console.log("🔧 Configuring MongoDB Atlas...");
    console.log("===============================");

    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    // Create .env file with Atlas configuration
    const envContent = `# MongoDB Atlas Connection
MONGODB_URI=${atlasUri}

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024

# Super Admin Configuration
SUPER_ADMIN_USERNAME=super_admin
SUPER_ADMIN_PASSWORD=super_admin
SUPER_ADMIN_EMAIL=admin@trainplanwise.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
`;

    const envPath = path.join(process.cwd(), ".env");

    // Check if .env already exists
    if (fs.existsSync(envPath)) {
      console.log("⚠️  .env file already exists");
      console.log("💡 Please manually update MONGODB_URI in your .env file");
      console.log(`   MONGODB_URI=${atlasUri}`);
    } else {
      fs.writeFileSync(envPath, envContent);
      console.log("✅ Created .env file with Atlas configuration");
    }

    // Update database.js to use Atlas by default
    const databasePath = path.join(process.cwd(), "config", "database.js");
    const databaseContent = `import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Use Atlas connection string
    const atlasUri = "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const mongoUri = process.env.MONGODB_URI || atlasUri;
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
    console.log(\`Database: \${conn.connection.name}\`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('⚠️  Server will continue running without database (Demo Mode)');
    // Don't exit - allow server to run for demo purposes
    // process.exit(1);
  }
};

export default connectDB;
`;

    fs.writeFileSync(databasePath, databaseContent);
    console.log("✅ Updated database.js to use Atlas by default");

    console.log("\n🎉 Atlas configuration completed!");
    console.log("\n📋 What was configured:");
    console.log("   • .env file with Atlas connection string");
    console.log("   • database.js updated to use Atlas");
    console.log("   • Fallback to Atlas if MONGODB_URI not set");

    console.log("\n💡 Next steps:");
    console.log("   1. Test connection: node scripts/testAtlasConnection.js");
    console.log("   2. Seed database: node scripts/seedAtlasDatabase.js");
    console.log("   3. Start application: npm run dev");
  } catch (error) {
    console.error("❌ Error configuring Atlas:", error.message);
    process.exit(1);
  }
};

// Run the configuration
configureAtlas();
