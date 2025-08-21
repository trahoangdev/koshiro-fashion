const fs = require('fs');
const path = require('path');

// Security patterns to check for
const SECURITY_PATTERNS = {
  'Hardcoded MongoDB URI': /mongodb\+srv:\/\/[^@]+@[^/]+\/[^'"]+/g,
  'Hardcoded JWT Secret': /JWT_SECRET.*['"`][^'"]+['"`]/g,
  'Hardcoded Email Credentials': /EMAIL_USER.*['"`][^'"]+['"`]|EMAIL_PASS.*['"`][^'"]+['"`]/g,
  'Hardcoded Passwords': /password.*['"`][^'"]+['"`]/gi,
  'Hardcoded API Keys': /api[_-]?key.*['"`][^'"]+['"`]/gi,
  'Hardcoded Tokens': /token.*['"`][^'"]+['"`]/gi,
  'Console Log with Sensitive Data': /console\.log.*password|console\.log.*secret|console\.log.*token/gi,
  'Exposed Database Credentials': /username.*['"`][^'"]+['"`]|password.*['"`][^'"]+['"`]/gi
};

// File extensions to check
const CHECK_EXTENSIONS = ['.js', '.ts', '.json', '.env', '.config.js', '.config.ts'];

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt'];

// Files to skip
const SKIP_FILES = [
  '.gitignore',
  'package-lock.json',
  'yarn.lock',
  'bun.lockb',
  '*.example.js',
  '*.example.json',
  'env.example',
  'SECURITY.md'
];

function shouldSkipFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Skip if file extension not in check list
  if (!CHECK_EXTENSIONS.includes(ext)) return true;
  
  // Skip if file name matches skip patterns
  return SKIP_FILES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(fileName);
    }
    return fileName === pattern;
  });
}

function shouldSkipDir(dirName) {
  return SKIP_DIRS.includes(dirName);
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const [patternName, pattern] of Object.entries(SECURITY_PATTERNS)) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          pattern: patternName,
          matches: matches.map(match => match.substring(0, 100) + (match.length > 100 ? '...' : ''))
        });
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath, relativePath = '') {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldSkipDir(item)) {
          results.push(...scanDirectory(fullPath, relativeItemPath));
        }
      } else if (stat.isFile()) {
        if (!shouldSkipFile(item)) {
          const issues = scanFile(fullPath);
          if (issues.length > 0) {
            results.push({
              file: relativeItemPath,
              issues
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function main() {
  console.log('🔒 Security Check for Koshiro Fashion Project\n');
  
  const startTime = Date.now();
  const results = scanDirectory('.');
  const endTime = Date.now();
  
  console.log(`⏱️  Scan completed in ${endTime - startTime}ms\n`);
  
  if (results.length === 0) {
    console.log('✅ No security issues found!');
    return;
  }
  
  console.log(`⚠️  Found ${results.length} file(s) with potential security issues:\n`);
  
  let totalIssues = 0;
  
  for (const result of results) {
    console.log(`📁 ${result.file}:`);
    
    for (const issue of result.issues) {
      console.log(`  🔴 ${issue.pattern}:`);
      for (const match of issue.matches) {
        console.log(`    - ${match}`);
      }
      totalIssues += issue.matches.length;
    }
    console.log('');
  }
  
  console.log(`📊 Summary: ${totalIssues} total security issues found`);
  console.log('\n🔧 Recommendations:');
  console.log('1. Move all hardcoded credentials to environment variables');
  console.log('2. Use .env files for configuration');
  console.log('3. Never commit .env files to Git');
  console.log('4. Use strong, unique secrets for production');
  console.log('5. Review SECURITY.md for detailed guidelines');
  
  if (totalIssues > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile, SECURITY_PATTERNS };
