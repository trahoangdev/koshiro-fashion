import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trahoangdev:7RMlso6ZQp6OcTtQ@cluster0.zgzpftw.mongodb.net/koshiro-fashion';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@koshiro.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      status: 'active'
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create sample users
    const sampleUsers = [
      {
        email: 'customer1@example.com',
        password: 'password123',
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        role: 'customer',
        status: 'active'
      },
      {
        email: 'customer2@example.com',
        password: 'password123',
        name: 'Trần Thị B',
        phone: '0987654321',
        role: 'customer',
        status: 'active'
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log('✅ Created sample users');

    // Create categories
    const categories = [
      {
        name: 'Áo Kimono',
        nameEn: 'Kimono',
        nameJa: '着物',
        description: 'Áo Kimono truyền thống Nhật Bản',
        slug: 'ao-kimono',
        isActive: true
      },
      {
        name: 'Áo Yukata',
        nameEn: 'Yukata',
        nameJa: '浴衣',
        description: 'Áo Yukata mùa hè',
        slug: 'ao-yukata',
        isActive: true
      },
      {
        name: 'Phụ kiện',
        nameEn: 'Accessories',
        nameJa: 'アクセサリー',
        description: 'Phụ kiện thời trang Nhật Bản',
        slug: 'phu-kien',
        isActive: true
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Created categories');

    // Create products
    const products = [
      {
        name: 'Áo Kimono Truyền Thống',
        nameEn: 'Traditional Kimono',
        nameJa: '伝統的な着物',
        description: 'Áo Kimono truyền thống với họa tiết hoa anh đào',
        price: 1500000,
        originalPrice: 1800000,
        categoryId: createdCategories[0]._id,
        images: ['/images/kimono-1.jpg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đỏ', 'Xanh', 'Tím'],
        stock: 10,
        isActive: true,
        isFeatured: true,
        tags: ['kimono', 'truyền thống', 'hoa anh đào']
      },
      {
        name: 'Áo Yukata Mùa Hè',
        nameEn: 'Summer Yukata',
        nameJa: '夏の浴衣',
        description: 'Áo Yukata mùa hè với họa tiết hoa cúc',
        price: 800000,
        originalPrice: 1000000,
        categoryId: createdCategories[1]._id,
        images: ['/images/yukata-1.jpg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh dương', 'Hồng', 'Trắng'],
        stock: 15,
        isActive: true,
        isFeatured: true,
        tags: ['yukata', 'mùa hè', 'hoa cúc']
      },
      {
        name: 'Quạt Giấy Nhật Bản',
        nameEn: 'Japanese Paper Fan',
        nameJa: '和紙の扇子',
        description: 'Quạt giấy truyền thống Nhật Bản',
        price: 150000,
        categoryId: createdCategories[2]._id,
        images: ['/images/fan-1.jpg'],
        sizes: ['One Size'],
        colors: ['Đỏ', 'Xanh', 'Vàng'],
        stock: 50,
        isActive: true,
        tags: ['quạt', 'giấy', 'truyền thống']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('✅ Created products');

    // Create sample orders
    const orders = [
      {
        orderNumber: 'ORD001',
        userId: createdUsers[0]._id,
        status: 'completed',
        items: [
          {
            productId: createdProducts[0]._id,
            name: createdProducts[0].name,
            nameVi: createdProducts[0].name,
            quantity: 1,
            price: createdProducts[0].price,
            size: 'M',
            color: 'Đỏ'
          }
        ],
        totalAmount: createdProducts[0].price,
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '123 Đường ABC',
          city: 'TP.HCM',
          district: 'Quận 1'
        },
        paymentMethod: 'COD',
        paymentStatus: 'paid'
      },
      {
        orderNumber: 'ORD002',
        userId: createdUsers[1]._id,
        status: 'processing',
        items: [
          {
            productId: createdProducts[1]._id,
            name: createdProducts[1].name,
            nameVi: createdProducts[1].name,
            quantity: 1,
            price: createdProducts[1].price,
            size: 'L',
            color: 'Xanh dương'
          }
        ],
        totalAmount: createdProducts[1].price,
        shippingAddress: {
          name: 'Trần Thị B',
          phone: '0987654321',
          address: '456 Đường XYZ',
          city: 'TP.HCM',
          district: 'Quận 2'
        },
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'pending'
      }
    ];

    await Order.insertMany(orders);
    console.log('✅ Created sample orders');

    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Categories: ${await Category.countDocuments()}`);
    console.log(`   - Products: ${await Product.countDocuments()}`);
    console.log(`   - Orders: ${await Order.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the seed function
seedData(); 