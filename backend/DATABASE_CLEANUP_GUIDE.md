# Database Cleanup Guide

## Overview

This guide explains how to clear operational data from the MongoDB database while preserving user accounts and authentication data.

## ✅ What Was Cleared

The following data has been successfully cleared from the database:

- **Trainsets**: 20 records cleared
- **Job Cards**: 33 records cleared
- **Incidents**: 3 records cleared
- **Metrics**: 1 record cleared
- **All other operational collections**: Cleared (were empty)

## 👥 What Was Preserved

The following user data has been preserved:

- **8 User Accounts** maintained
- **Authentication data** (passwords, tokens)
- **User roles and permissions**
- **User status and approval states**

### Preserved Users:

- `super_admin` (Super Administrator) - super_admin role
- `shivmore8215` (More Shivraj Vijay) - user role
- `testuser123` (Test User 123) - user role
- `atharv` (Mohite Atharv) - user role
- `kuldipgodase_07` (Kuldip Mahesh Godase) - user role
- `abc` (abc) - user role
- `xyz` (Sample User) - user role
- `onkar` (Onkar) - user role

## 🛠️ Available Scripts

### 1. Clear Data (Preserve Users)

```bash
cd backend
node scripts/clearDataDirect.js
```

### 2. Check Database Status

```bash
cd backend
node scripts/checkDatabase.js
```

### 3. PowerShell Script (Windows)

```powershell
cd backend
.\clear-data.ps1
```

## 📊 Current Database State

- **Users**: 8 accounts preserved
- **Operational Data**: All cleared
- **Collections**: 11 collections (10 empty, 1 with users)
- **Schedules**: 100 documents (separate collection)

## 🔄 Next Steps

### Option 1: Reseed with Fresh Data

```bash
# Seed trainsets
node scripts/insertTrainsets.js

# Seed additional data
node scripts/seedStaticData.js
```

### Option 2: Start with Clean Database

```bash
# Start the backend server
npm run dev
```

### Option 3: Create New Users

```bash
# Create super admin (if needed)
node scripts/createSuperUser.js
```

## 🎯 Benefits of This Cleanup

1. **Fresh Start**: Clean operational data for testing
2. **User Preservation**: No need to recreate user accounts
3. **Authentication Intact**: Login system remains functional
4. **Performance**: Faster database operations
5. **Testing**: Clean slate for new scenarios

## ⚠️ Important Notes

- **User passwords**: Preserved and functional
- **User roles**: Maintained (super_admin, user)
- **User status**: Preserved (approved, pending)
- **Authentication tokens**: May need refresh after restart

## 🔧 Troubleshooting

### If Users Can't Login

1. Check if backend server is running
2. Verify MongoDB connection
3. Check user status in database
4. Restart backend server

### If Data Doesn't Load

1. Run seed scripts to populate data
2. Check frontend-backend connection
3. Verify API endpoints

## 📈 Database Statistics

- **Total Collections**: 11
- **Collections with Data**: 2 (users, schedules)
- **Empty Collections**: 9
- **Total Documents Cleared**: 57
- **Users Preserved**: 8

## 🎉 Success Confirmation

The database cleanup was successful with:

- ✅ All operational data cleared
- ✅ User accounts preserved
- ✅ Authentication system intact
- ✅ Database performance improved
- ✅ Ready for fresh data seeding

---

**Last Updated**: Database cleanup completed successfully
**Status**: ✅ Complete - Users preserved, operational data cleared
