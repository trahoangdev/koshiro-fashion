#!/usr/bin/env node

import enhancedSeedData from '../utils/enhancedSeedData';

console.log('🚀 Starting Enhanced Seed Data Process...');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('=' .repeat(50));

enhancedSeedData()
  .then(() => {
    console.log('=' .repeat(50));
    console.log('🎉 Enhanced seed data process completed successfully!');
    console.log('📊 Database has been populated with:');
    console.log('   - 1 Admin user + 3 Test customers');
    console.log('   - 8 Enhanced categories with SEO metadata');
    console.log('   - 30+ Premium products with multilingual support');
    console.log('   - Product variations, reviews, and rich descriptions');
    console.log('=' .repeat(50));
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Enhanced seed data process failed:');
    console.error(error);
    process.exit(1);
  });
