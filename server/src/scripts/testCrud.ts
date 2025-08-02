import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Test data
const testCategory = {
  name: 'Test Category',
  nameEn: 'Test Category',
  nameJa: 'テストカテゴリ',
  description: 'Test category description',
  slug: 'test-category',
  isActive: true
};

const testProduct = {
  name: 'Test Product',
  nameEn: 'Test Product',
  nameJa: 'テスト商品',
  description: 'Test product description',
  descriptionEn: 'Test product description in English',
  descriptionJa: 'テスト商品の説明',
  price: 100000,
  originalPrice: 120000,
  categoryId: '', // Will be set after creating category
  images: ['https://example.com/test-image.jpg'],
  sizes: ['S', 'M', 'L'],
  colors: ['Red', 'Blue'],
  stock: 10,
  tags: ['test', 'sample'],
  isActive: true,
  isFeatured: false,
  onSale: true
};

// Helper function to update product count for categories
const updateCategoryProductCount = async (categoryId: string) => {
  try {
    const productCount = await Product.countDocuments({ 
      categoryId: categoryId,
      isActive: true 
    });
    
    await Category.findByIdAndUpdate(categoryId, { productCount });
    console.log(`Updated product count for category ${categoryId}: ${productCount}`);
  } catch (error) {
    console.error('Error updating category product count:', error);
  }
};

// Test CRUD operations
async function testCRUD() {
  console.log('🚀 Starting CRUD test...\n');

  try {
    // 1. Test Category CRUD
    console.log('📁 Testing Category CRUD...');
    
    // Create category
    console.log('Creating category...');
    const category = new Category(testCategory);
    await category.save();
    console.log('✅ Category created:', category.name);
    
    const categoryId = (category._id as mongoose.Types.ObjectId).toString();
    
    // Read category
    console.log('Reading category...');
    const foundCategory = await Category.findById(categoryId);
    console.log('✅ Category found:', foundCategory?.name);
    
    // Update category
    console.log('Updating category...');
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...testCategory,
        name: 'Updated Test Category',
        description: 'Updated description'
      },
      { new: true }
    );
    console.log('✅ Category updated:', updatedCategory?.name);
    
    // 2. Test Product CRUD
    console.log('\n📦 Testing Product CRUD...');
    
    // Set category ID for product
    testProduct.categoryId = categoryId;
    
    // Create product
    console.log('Creating product...');
    const product = new Product(testProduct);
    await product.save();
    
    // Update category product count
    await updateCategoryProductCount(categoryId);
    
    console.log('✅ Product created:', product.name);
    
    const productId = (product._id as mongoose.Types.ObjectId).toString();
    
    // Read products
    console.log('Reading products...');
    const foundProduct = await Product.findById(productId).populate('categoryId');
    console.log('✅ Product found:', foundProduct?.name);
    
    // Update product
    console.log('Updating product...');
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...testProduct,
        name: 'Updated Test Product',
        price: 90000
      },
      { new: true }
    ).populate('categoryId');
    
    // Update category product count
    await updateCategoryProductCount(categoryId);
    
    console.log('✅ Product updated:', updatedProduct?.name);
    
    // 3. Test Delete operations
    console.log('\n🗑️ Testing Delete operations...');
    
    // Delete product
    console.log('Deleting product...');
    await Product.findByIdAndDelete(productId);
    
    // Update category product count
    await updateCategoryProductCount(categoryId);
    
    console.log('✅ Product deleted');
    
    // Delete category
    console.log('Deleting category...');
    await Category.findByIdAndDelete(categoryId);
    console.log('✅ Category deleted');
    
    console.log('\n🎉 All CRUD tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ CRUD test failed:', error);
    process.exit(1);
  }
}

// Connect to MongoDB and run test
async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/koshiro-fashion';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Run CRUD test
    await testCRUD();
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the test
main(); 