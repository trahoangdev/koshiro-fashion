import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

async function createSampleOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Get a user and product for creating orders
    const user = await User.findOne();
    const product = await Product.findOne();

    if (!user || !product) {
      console.log('No user or product found. Please create users and products first.');
      return;
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Create sample orders
    const sampleOrders = [
      {
        orderNumber: 'ORD-001',
        userId: user._id,
        status: 'pending',
        items: [
          {
            productId: product._id,
            name: product.name,
            nameVi: product.name,
            quantity: 2,
            price: product.price,
            size: 'M',
            color: 'Blue'
          }
        ],
        totalAmount: product.price * 2,
        shippingAddress: {
          name: 'John Doe',
          phone: '0123456789',
          address: '123 Main St',
          city: 'Ho Chi Minh City',
          district: 'District 1'
        },
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        notes: 'Please deliver in the morning'
      },
      {
        orderNumber: 'ORD-002',
        userId: user._id,
        status: 'pending',
        items: [
          {
            productId: product._id,
            name: product.name,
            nameVi: product.name,
            quantity: 1,
            price: product.price,
            size: 'L',
            color: 'Red'
          }
        ],
        totalAmount: product.price,
        shippingAddress: {
          name: 'Jane Smith',
          phone: '0987654321',
          address: '456 Oak Ave',
          city: 'Hanoi',
          district: 'Ba Dinh'
        },
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'pending',
        notes: 'Gift wrapping please'
      },
      {
        orderNumber: 'ORD-003',
        userId: user._id,
        status: 'processing',
        items: [
          {
            productId: product._id,
            name: product.name,
            nameVi: product.name,
            quantity: 3,
            price: product.price,
            size: 'S',
            color: 'Green'
          }
        ],
        totalAmount: product.price * 3,
        shippingAddress: {
          name: 'Bob Johnson',
          phone: '0555666777',
          address: '789 Pine Rd',
          city: 'Da Nang',
          district: 'Hai Chau'
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        notes: 'Express delivery'
      }
    ];

    // Insert orders
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Created ${createdOrders.length} sample orders`);

    // Get counts by status
    const pendingCount = await Order.countDocuments({ status: 'pending' });
    const processingCount = await Order.countDocuments({ status: 'processing' });
    const totalCount = await Order.countDocuments();

    console.log(`Pending orders: ${pendingCount}`);
    console.log(`Processing orders: ${processingCount}`);
    console.log(`Total orders: ${totalCount}`);

    console.log('Sample orders created successfully!');
  } catch (error) {
    console.error('Error creating sample orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createSampleOrders();
