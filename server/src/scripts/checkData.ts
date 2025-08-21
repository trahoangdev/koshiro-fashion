import mongoose from 'mongoose';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Notification } from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

async function checkData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Check users
    const userCount = await User.countDocuments();
    const users = await User.find().limit(3);
    console.log(`\n📊 Users: ${userCount}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check products
    const productCount = await Product.countDocuments();
    const products = await Product.find().limit(3);
    console.log(`\n📦 Products: ${productCount}`);
    products.forEach(product => {
      console.log(`  - ${product.name} - Price: ${product.price}`);
    });

    // Check orders
    const orderCount = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    console.log(`\n📋 Orders: ${orderCount} (Pending: ${pendingOrders})`);

    // Check notifications
    const notificationCount = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ read: false });
    console.log(`\n🔔 Notifications: ${notificationCount} (Unread: ${unreadNotifications})`);

    console.log('\n✅ Data check completed!');
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
checkData(); 