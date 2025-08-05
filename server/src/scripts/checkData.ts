import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { Order } from '../models/Order';

async function checkData() {
  try {
    console.log('🔍 Checking database data...\n');
    
    // Check categories
    const categories = await Category.find({});
    console.log(`📁 Categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) - Products: ${cat.productCount}`);
    });
    
    // Check products
    const products = await Product.find({});
    console.log(`\n📦 Products: ${products.length}`);
    products.forEach(prod => {
      console.log(`  - ${prod.name} - Category: ${prod.categoryId} - Active: ${prod.isActive}`);
    });
    
    // Check users
    const users = await User.find({});
    console.log(`\n👥 Users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check orders
    const orders = await Order.find({});
    console.log(`\n📋 Orders: ${orders.length}`);
    orders.forEach(order => {
      console.log(`  - ${order.orderNumber} - Status: ${order.status} - Amount: ${order.totalAmount}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

// Connect to MongoDB and run check
async function main() {
  try {
    // Connect to MongoDB using the same connection string as seedData
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');
    
    // Check data
    await checkData();
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the check
main(); 