#!/usr/bin/env node

import dotenv from 'dotenv';
import enhancedSeedData from '../utils/enhancedSeedData';

// Load environment variables
dotenv.config();

// Get language preference from command line arguments
const languageArg = process.argv[2];
const validLanguages = ['vi', 'en', 'ja'];
const language = validLanguages.includes(languageArg) ? languageArg as 'vi' | 'en' | 'ja' : undefined;

console.log('🚀 Starting Enhanced Seed Data Process...');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌍 Language:', language || 'auto (all languages)');
console.log('=' .repeat(50));

enhancedSeedData(language)
  .then(() => {
    console.log('=' .repeat(50));
    console.log('🎉 Enhanced seed data process completed successfully!');
    console.log('📊 Database has been populated with:');
    console.log('   - 1 Admin user + 5 Test customers');
    console.log('   - 8 Enhanced categories with SEO metadata');
    console.log('   - 80+ Premium products (10 per category) with multilingual support & sale price');
    console.log('   - Product variations and rich descriptions');
    console.log('');
    console.log('💡 Usage:');
    console.log('   npx tsx src/scripts/runEnhancedSeed.ts          # All languages');
    console.log('   npx tsx src/scripts/runEnhancedSeed.ts vi        # Vietnamese only');
    console.log('   npx tsx src/scripts/runEnhancedSeed.ts en        # English only');
    console.log('   npx tsx src/scripts/runEnhancedSeed.ts ja        # Japanese only');
    console.log('=' .repeat(50));
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Enhanced seed data process failed:');
    console.error(error);
    process.exit(1);
  });
