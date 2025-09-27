# MongoDB Atlas Setup Guide

## 🎯 Overview

This guide explains how to configure your KMRL application to use MongoDB Atlas cloud database instead of local MongoDB.

## 🔗 Atlas Connection String

```
mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## ✅ Connection Test Results

- **Status**: ✅ Connected Successfully
- **Host**: ac-6pqfo7x-shard-00-00.byx6m0c.mongodb.net
- **Database**: train_plan_wise
- **Connection State**: Active (1)

## 🛠️ Setup Steps

### 1. Update Environment Variables

Create or update your `.env` file in the backend directory:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

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
```

### 2. Test Atlas Connection

```bash
cd backend
node scripts/testAtlasConnection.js
```

### 3. Seed Atlas Database

```bash
cd backend
node scripts/seedAtlasDatabase.js
```

### 4. Start Application with Atlas

```bash
cd backend
npm run dev
```

## 📊 Available Scripts

### Connection Testing

- **`node scripts/testAtlasConnection.js`** - Test Atlas connectivity
- **`node scripts/migrateToAtlas.js`** - Check Atlas database status
- **`node scripts/seedAtlasDatabase.js`** - Populate Atlas with sample data

### Database Management

- **`node scripts/clearDataDirect.js`** - Clear data (preserve users)
- **`node scripts/checkDatabase.js`** - Check database status
- **`node scripts/seedDatabase.js`** - Seed with user accounts

## 🔧 Configuration Options

### Option 1: Environment Variable

Set the connection string as an environment variable:

```bash
export MONGODB_URI="mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
```

### Option 2: Direct Code Update

Update `backend/config/database.js` to use Atlas by default:

```javascript
const conn = await mongoose.connect(
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
```

### Option 3: Runtime Override

Override the connection in your scripts:

```javascript
process.env.MONGODB_URI =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
```

## 🌐 Atlas Database Details

### Connection Information

- **Cluster**: cluster0.byx6m0c.mongodb.net
- **User**: shivrajmore8215898
- **Database**: train_plan_wise
- **Connection Type**: MongoDB Atlas (Cloud)

### Security Features

- **SSL/TLS**: Enabled by default
- **Authentication**: Username/password
- **Network Access**: IP whitelist (if configured)
- **Encryption**: In transit and at rest

## 📈 Benefits of Using Atlas

### 1. **Cloud Scalability**

- Automatic scaling
- Global distribution
- High availability

### 2. **Managed Service**

- No server maintenance
- Automatic backups
- Security updates

### 3. **Development Benefits**

- Easy team collaboration
- Consistent environment
- Production-ready setup

### 4. **Monitoring & Analytics**

- Built-in monitoring
- Performance insights
- Query optimization

## 🔍 Troubleshooting

### Connection Issues

1. **IP Whitelist**: Ensure your IP is whitelisted in Atlas
2. **Network**: Check internet connectivity
3. **Credentials**: Verify username/password
4. **Cluster Status**: Check if cluster is running

### Common Errors

- **Authentication Failed**: Check credentials
- **Network Timeout**: Check IP whitelist
- **SSL Issues**: Verify connection string
- **Database Not Found**: Check database name

### Debug Commands

```bash
# Test connection
node scripts/testAtlasConnection.js

# Check database status
node scripts/migrateToAtlas.js

# Verify data
node scripts/checkDatabase.js
```

## 🎉 Success Indicators

### ✅ Connection Successful

- "MongoDB Atlas Connected Successfully!"
- Host and database information displayed
- Test operations completed

### ✅ Database Ready

- Collections created successfully
- Sample data populated
- User accounts functional

### ✅ Application Working

- Backend server starts without errors
- Frontend can connect to backend
- Authentication system functional

## 📝 Next Steps

1. **Update your application** to use Atlas connection
2. **Test all functionality** with Atlas database
3. **Configure monitoring** in Atlas dashboard
4. **Set up backups** and security policies
5. **Deploy to production** with Atlas

## 🔐 Security Recommendations

1. **Change default passwords** in production
2. **Use environment variables** for connection strings
3. **Enable IP whitelisting** in Atlas
4. **Regular security updates**
5. **Monitor access logs**

---

**Status**: ✅ Atlas connection tested and working
**Database**: train_plan_wise ready for use
**Next**: Configure your application to use Atlas
