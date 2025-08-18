import mongoose from 'mongoose';
import { Notification } from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion';

async function createSampleNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Create sample notifications
    const sampleNotifications = [
      {
        title: 'New order received',
        message: 'Order #12345 has been placed by customer',
        type: 'info' as const,
        category: 'order' as const,
        read: false,
        actionUrl: '/admin/orders'
      },
      {
        title: 'Low stock alert',
        message: 'Product "Kimono Traditional" is running low on stock',
        type: 'warning' as const,
        category: 'product' as const,
        read: false,
        actionUrl: '/admin/products'
      },
      {
        title: 'New customer registered',
        message: 'A new customer has registered on the platform',
        type: 'success' as const,
        category: 'user' as const,
        read: false,
        actionUrl: '/admin/users'
      },
      {
        title: 'System maintenance',
        message: 'Scheduled maintenance will occur tonight at 2 AM',
        type: 'info' as const,
        category: 'system' as const,
        read: true,
        actionUrl: '/admin/settings'
      },
      {
        title: 'Payment failed',
        message: 'Payment for order #12340 has failed',
        type: 'error' as const,
        category: 'order' as const,
        read: false,
        actionUrl: '/admin/orders'
      }
    ];

    // Insert notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${createdNotifications.length} sample notifications`);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ read: false });
    console.log(`Unread notifications: ${unreadCount}`);

    console.log('Sample notifications created successfully!');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createSampleNotifications();
