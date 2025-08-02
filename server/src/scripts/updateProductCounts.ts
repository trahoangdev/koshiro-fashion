import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Helper function to update product count for a category
const updateCategoryProductCount = async (categoryId: string) => {
  try {
    const productCount = await Product.countDocuments({ 
      categoryId: categoryId,
      isActive: true 
    });
    
    await Category.findByIdAndUpdate(categoryId, { productCount });
    return productCount;
  } catch (error) {
    console.error(`Error updating product count for category ${categoryId}:`, error);
    return 0;
  }
};

// Update product counts for all categories
async function updateAllProductCounts() {
  try {
    console.log('🔄 Starting product count update for all categories...\n');
    
    // Get all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories to update\n`);
    
    let totalProducts = 0;
    
    // Update each category
    for (const category of categories) {
      const productCount = await updateCategoryProductCount((category._id as mongoose.Types.ObjectId).toString());
      totalProducts += productCount;
      
      console.log(`✅ ${category.name}: ${productCount} products`);
    }
    
    console.log(`\n🎉 Product count update completed!`);
    console.log(`📊 Total categories updated: ${categories.length}`);
    console.log(`📦 Total active products: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Error updating product counts:', error);
    process.exit(1);
  }
}

// Connect to MongoDB and run update
async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/koshiro-fashion';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Update product counts
    await updateAllProductCounts();
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the update
main(); 