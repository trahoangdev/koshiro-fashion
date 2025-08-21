const fs = require('fs');
const path = require('path');

// Files with sensitive data that should be removed
const SENSITIVE_FILES = [
  'test-api.js',
  'Koshiro-Fashion-API.postman_collection.json',
  'Koshiro-Fashion-Environment.postman_environment.json'
];

function cleanupSensitiveFiles() {
  console.log('🧹 Cleaning up sensitive files...\n');
  
  let removedCount = 0;
  
  for (const file of SENSITIVE_FILES) {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
        removedCount++;
      } catch (error) {
        console.error(`❌ Error removing ${file}:`, error.message);
      }
    } else {
      console.log(`ℹ️  Not found: ${file}`);
    }
  }
  
  console.log(`\n📊 Summary: ${removedCount} sensitive files removed`);
  console.log('\n🔒 Security reminder:');
  console.log('1. Use .env files for environment variables');
  console.log('2. Never commit credentials to Git');
  console.log('3. Use example files for documentation');
  console.log('4. Run security-check.cjs regularly');
}

if (require.main === module) {
  cleanupSensitiveFiles();
}

module.exports = { cleanupSensitiveFiles, SENSITIVE_FILES };
