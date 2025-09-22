import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple authentication route for testing
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  // Demo super admin authentication
  if (username === 'super_admin' && password === 'super_admin') {
    const demoUser = {
      id: 'demo-super-admin-id',
      username: 'super_admin',
      email: 'admin@trainplanwise.com',
      fullName: 'Super Administrator',
      role: 'super_admin',
      status: 'approved',
      lastLogin: new Date()
    };
    
    const token = 'demo-jwt-token-' + Date.now();
    
    console.log('✅ Super admin login successful');
    
    return res.json({
      message: 'Login successful (Demo Mode)',
      token,
      user: demoUser
    });
  }
  
  console.log('❌ Invalid credentials');
  res.status(401).json({
    message: 'Invalid credentials'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Train Plan Wise Backend API - Demo Mode' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Demo Server is running on port', PORT);
  console.log('🌍 Environment: development (Demo Mode)');
  console.log('📡 Frontend URL: http://localhost:8080');
  console.log('🔐 Demo Credentials: super_admin / super_admin');
});