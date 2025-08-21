# 🔒 Security Guidelines

## ⚠️ Important Security Notes

### 1. Environment Variables
**NEVER commit sensitive data to Git!** Always use environment variables for:

- Database connection strings
- JWT secrets
- API keys
- Email credentials
- Payment gateway keys

### 2. Files That Should NOT Be Committed

#### ❌ Never Commit These Files:
```
.env
.env.local
.env.production
.env.development
.env.test
*.postman_collection.json
*.postman_environment.json
test-api.js
test-order-api.js
test-order-creation.js
server/dist/
dist/
```

#### ✅ Safe to Commit:
```
env.example
*.postman_collection.json.example
*.postman_environment.json.example
```

### 3. Current Security Issues Found

#### 🔴 Critical Issues:
1. **Hardcoded MongoDB URI** in multiple files:
   - `server/src/config/database.ts`
   - `server/src/scripts/*.ts`
   - Contains real credentials: `mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion`

2. **Hardcoded JWT Secret** in multiple files:
   - `server/src/controllers/authController.ts`
   - `server/src/middleware/auth.ts`
   - Contains: `koshiro-fashion-secret-key-2024`

3. **Hardcoded Email Credentials** in:
   - `server/src/controllers/authController.ts`
   - Contains: `your-email@gmail.com` and `your-app-password`

4. **Test Files with Credentials**:
   - `test-api.js` contains admin login credentials
   - `Koshiro-Fashion-API.postman_collection.json` contains tokens

### 4. Immediate Actions Required

#### 🔧 Fix Database Configuration:
```typescript
// ❌ Current (INSECURE):
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion';

// ✅ Should be:
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}
```

#### 🔧 Fix JWT Configuration:
```typescript
// ❌ Current (INSECURE):
const JWT_SECRET = process.env.JWT_SECRET || 'koshiro-fashion-secret-key-2024';

// ✅ Should be:
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

#### 🔧 Fix Email Configuration:
```typescript
// ❌ Current (INSECURE):
user: process.env.EMAIL_USER || 'your-email@gmail.com',
pass: process.env.EMAIL_PASS || 'your-app-password'

// ✅ Should be:
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
```

### 5. Environment Setup

#### 📝 Create `.env` file in `server/` directory:
```bash
# Copy the example file
cp server/env.example server/.env

# Edit with your real values
nano server/.env
```

#### 📝 Required Environment Variables:
```env
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 6. Production Security Checklist

- [ ] Remove all hardcoded credentials
- [ ] Use strong, unique JWT secrets
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS configuration
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Set up proper logging (without sensitive data)
- [ ] Use environment-specific configurations
- [ ] Regular security audits
- [ ] Keep dependencies updated

### 7. Git Security Best Practices

#### 🔒 Before Committing:
```bash
# Check what files will be committed
git status

# Check for sensitive data in staged files
git diff --cached | grep -i "password\|secret\|key\|token"

# Use git-secrets or similar tools
git secrets --scan
```

#### 🔒 If You Accidentally Committed Secrets:
```bash
# Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote
git push origin --force --all
```

### 8. Additional Security Measures

#### 🔐 API Security:
- Implement proper authentication middleware
- Add request validation
- Use HTTPS in production
- Implement rate limiting
- Add CORS protection

#### 🔐 Database Security:
- Use connection pooling
- Implement proper indexing
- Regular backups
- Monitor for suspicious activities
- Use read-only users where possible

#### 🔐 Frontend Security:
- Sanitize user inputs
- Implement proper error handling
- Use HTTPS for API calls
- Store tokens securely
- Implement proper logout

### 9. Monitoring and Logging

#### 📊 Security Monitoring:
- Monitor failed login attempts
- Track API usage patterns
- Log security events
- Set up alerts for suspicious activities

#### 📝 Secure Logging:
```typescript
// ❌ Don't log sensitive data:
console.log('User data:', user);

// ✅ Log safely:
console.log('User login:', { userId: user._id, email: user.email });
```

### 10. Emergency Contacts

If you discover a security vulnerability:
1. **IMMEDIATELY** change all exposed credentials
2. Remove sensitive data from Git history
3. Notify team members
4. Document the incident
5. Implement preventive measures

---

**Remember: Security is everyone's responsibility!** 🔒
