# 🔒 Security Setup Guide

## 🚨 Critical Security Issues Found

Our security scan has identified several critical issues that need immediate attention:

### 🔴 **CRITICAL: Hardcoded Credentials**

1. **MongoDB Connection String** exposed in multiple files:
   ```
   mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion
   ```

2. **JWT Secret** hardcoded in multiple files:
   ```
   koshiro-fashion-secret-key-2024
   ```

3. **Email Credentials** hardcoded:
   ```
   your-email@gmail.com
   your-app-password
   ```

4. **Admin Login Credentials** in test files:
   ```
   admin@koshiro.com
   admin123
   ```

## 🛠️ Immediate Actions Required

### Step 1: Create Environment Files

#### Frontend (.env)
```bash
# Create in project root
touch .env
```

```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Koshiro Fashion
```

#### Backend (.env)
```bash
# Create in server directory
cd server
touch .env
```

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Email Configuration
EMAIL_USER=your-real-email@gmail.com
EMAIL_PASS=your-real-app-password

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Step 2: Remove Sensitive Files

Run the cleanup script:
```bash
npm run security:cleanup
```

This will remove:
- `test-api.js`
- `test-order-api.js`
- `test-order-creation.js`
- `Koshiro-Fashion-API.postman_collection.json`
- `Koshiro-Fashion-Environment.postman_environment.json`

### Step 3: Fix Code Issues

#### 1. Fix Database Configuration

**File:** `server/src/config/database.ts`
```typescript
// ❌ Current (INSECURE):
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion';

// ✅ Should be:
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}
```

#### 2. Fix JWT Configuration

**Files:** 
- `server/src/controllers/authController.ts`
- `server/src/middleware/auth.ts`

```typescript
// ❌ Current (INSECURE):
const JWT_SECRET = process.env.JWT_SECRET || 'koshiro-fashion-secret-key-2024';

// ✅ Should be:
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

#### 3. Fix Email Configuration

**File:** `server/src/controllers/authController.ts`
```typescript
// ❌ Current (INSECURE):
user: process.env.EMAIL_USER || 'your-email@gmail.com',
pass: process.env.EMAIL_PASS || 'your-app-password'

// ✅ Should be:
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
```

### Step 4: Update Scripts

**Files:** All files in `server/src/scripts/`
- Remove hardcoded MongoDB URIs
- Use environment variables only

## 🔧 Security Scripts

### Check for Security Issues
```bash
npm run security:check
```

### Clean Up Sensitive Files
```bash
npm run security:cleanup
```

### Full Security Scan
```bash
npm run security:scan
```

## 📋 Pre-Commit Checklist

Before committing code, always run:

```bash
# 1. Security check
npm run security:check

# 2. Lint check
npm run lint

# 3. Build test
npm run build

# 4. Check git status
git status

# 5. Check for sensitive data in staged files
git diff --cached | grep -i "password\|secret\|key\|token"
```

## 🚫 Never Commit These Files

- `.env` files
- `*.postman_collection.json` (real files)
- `*.postman_environment.json` (real files)
- `test-api.js` (with real credentials)
- Any file with hardcoded credentials

## ✅ Safe to Commit

- `env.example` files
- `*.postman_collection.example.json`
- `*.postman_environment.example.json`
- `test-api.example.js`
- `security-check.cjs`
- `cleanup-sensitive-files.cjs`
- `SECURITY.md`
- `SETUP-SECURITY.md`

## 🔐 Production Security

### Environment Variables
```env
# Production Database
MONGODB_URI=mongodb+srv://prod-user:prod-password@prod-cluster.mongodb.net/prod-database

# Production JWT (use strong random key)
JWT_SECRET=your-production-jwt-secret-here-make-it-very-long-and-random

# Production Email
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password

# Production Settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Additional Security Measures
1. **HTTPS Only**: Use HTTPS in production
2. **Rate Limiting**: Implement API rate limiting
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize user inputs
6. **CSRF Protection**: Implement CSRF tokens
7. **Security Headers**: Set proper security headers
8. **Regular Updates**: Keep dependencies updated

## 🆘 Emergency Response

If credentials are accidentally committed:

1. **IMMEDIATELY** change all exposed credentials
2. Remove from Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push to remote:
   ```bash
   git push origin --force --all
   ```
4. Notify team members
5. Document the incident

## 📞 Support

For security questions or issues:
1. Review `SECURITY.md` for detailed guidelines
2. Run `npm run security:check` to identify issues
3. Follow the setup steps in this guide
4. Contact the development team

---

**Remember: Security is everyone's responsibility!** 🔒
