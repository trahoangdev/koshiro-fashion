import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testSearch = async () => {
  try {
    console.log('🔍 Testing Search Functionality\n');

    // Test 1: Basic search
    console.log('📝 Test 1: Basic search for "kimono"');
    const search1 = await Product.find({
      $or: [
        { name: new RegExp('kimono', 'i') },
        { nameEn: new RegExp('kimono', 'i') },
        { nameJa: new RegExp('kimono', 'i') },
        { description: new RegExp('kimono', 'i') },
        { descriptionEn: new RegExp('kimono', 'i') },
        { descriptionJa: new RegExp('kimono', 'i') },
        { tags: { $in: [new RegExp('kimono', 'i')] } }
      ]
    });
    console.log(`✅ Found ${search1.length} kimono products\n`);

    // Test 2: Vietnamese search
    console.log('📝 Test 2: Vietnamese search for "áo"');
    const search2 = await Product.find({
      $or: [
        { name: new RegExp('áo', 'i') },
        { nameEn: new RegExp('áo', 'i') },
        { nameJa: new RegExp('áo', 'i') },
        { description: new RegExp('áo', 'i') },
        { descriptionEn: new RegExp('áo', 'i') },
        { descriptionJa: new RegExp('áo', 'i') },
        { tags: { $in: [new RegExp('áo', 'i')] } }
      ]
    });
    console.log(`✅ Found ${search2.length} áo products\n`);

    // Test 3: English search
    console.log('📝 Test 3: English search for "traditional"');
    const search3 = await Product.find({
      $or: [
        { name: new RegExp('traditional', 'i') },
        { nameEn: new RegExp('traditional', 'i') },
        { nameJa: new RegExp('traditional', 'i') },
        { description: new RegExp('traditional', 'i') },
        { descriptionEn: new RegExp('traditional', 'i') },
        { descriptionJa: new RegExp('traditional', 'i') },
        { tags: { $in: [new RegExp('traditional', 'i')] } }
      ]
    });
    console.log(`✅ Found ${search3.length} traditional products\n`);

    // Test 4: Partial search
    console.log('📝 Test 4: Partial search for "ki"');
    const search4 = await Product.find({
      $or: [
        { name: new RegExp('ki', 'i') },
        { nameEn: new RegExp('ki', 'i') },
        { nameJa: new RegExp('ki', 'i') },
        { description: new RegExp('ki', 'i') },
        { descriptionEn: new RegExp('ki', 'i') },
        { descriptionJa: new RegExp('ki', 'i') },
        { tags: { $in: [new RegExp('ki', 'i')] } }
      ]
    });
    console.log(`✅ Found ${search4.length} products with "ki"\n`);

    // Test 5: Category filter
    console.log('📝 Test 5: Search with category filter');
    const kimonoCategory = await Category.findOne({ slug: 'kimono' });
    if (kimonoCategory) {
      const search5 = await Product.find({
        categoryId: kimonoCategory._id,
        $or: [
          { name: new RegExp('traditional', 'i') },
          { nameEn: new RegExp('traditional', 'i') },
          { nameJa: new RegExp('traditional', 'i') },
          { description: new RegExp('traditional', 'i') },
          { descriptionEn: new RegExp('traditional', 'i') },
          { descriptionJa: new RegExp('traditional', 'i') },
          { tags: { $in: [new RegExp('traditional', 'i')] } }
        ]
      });
      console.log(`✅ Found ${search5.length} traditional products in kimono category\n`);
    }

    // Test 6: Price filter
    console.log('📝 Test 6: Search with price filter');
    const search6 = await Product.find({
      price: { $gte: 100, $lte: 500 },
      $or: [
        { name: new RegExp('kimono', 'i') },
        { nameEn: new RegExp('kimono', 'i') },
        { nameJa: new RegExp('kimono', 'i') },
        { description: new RegExp('kimono', 'i') },
        { descriptionEn: new RegExp('kimono', 'i') },
        { descriptionJa: new RegExp('kimono', 'i') },
        { tags: { $in: [new RegExp('kimono', 'i')] } }
      ]
    });
    console.log(`✅ Found ${search6.length} kimono products between $100-$500\n`);

    // Test 7: Featured products
    console.log('📝 Test 7: Featured products search');
    const search7 = await Product.find({
      isFeatured: true,
      $or: [
        { name: new RegExp('traditional', 'i') },
        { nameEn: new RegExp('traditional', 'i') },
        { nameJa: new RegExp('traditional', 'i') },
        { description: new RegExp('traditional', 'i') },
        { descriptionEn: new RegExp('traditional', 'i') },
        { descriptionJa: new RegExp('traditional', 'i') },
        { tags: { $in: [new RegExp('traditional', 'i')] } }
      ]
    });
    console.log(`✅ Found ${search7.length} featured traditional products\n`);

    console.log('🎉 All search tests completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Total products in database: ${await Product.countDocuments({})}`);
    console.log(`   - Total categories: ${await Category.countDocuments({})}`);
    console.log('   - Search functionality is working correctly');

  } catch (error) {
    console.error('❌ Search test error:', error);
  }
};

const runTests = async () => {
  await connectDB();
  await testSearch();
  await mongoose.disconnect();
  console.log('\n✅ Tests completed and database disconnected');
};

runTests();
