import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@koshiro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
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
        password: await bcrypt.hash('password123', 10),
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        role: 'customer',
        status: 'active'
      },
      {
        email: 'customer2@example.com',
        password: await bcrypt.hash('password123', 10),
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
        name: 'Tops',
        nameEn: 'Tops',
        nameJa: 'トップス',
        description: 'Áo và áo khoác thời trang',
        slug: 'tops',
        isActive: true
      },
      {
        name: 'Bottoms',
        nameEn: 'Bottoms',
        nameJa: 'ボトムス',
        description: 'Quần và váy thời trang',
        slug: 'bottoms',
        isActive: true
      },
      {
        name: 'Hakama',
        nameEn: 'Hakama',
        nameJa: '袴',
        description: 'Quần Hakama truyền thống Nhật Bản',
        slug: 'hakama',
        isActive: true
      },
      {
        name: 'Haori',
        nameEn: 'Haori',
        nameJa: '羽織',
        description: 'Áo khoác Haori truyền thống Nhật Bản',
        slug: 'haori',
        isActive: true
      },
      {
        name: 'Obi & Đai',
        nameEn: 'Obi & Belts',
        nameJa: '帯とベルト',
        description: 'Obi và đai thắt lưng truyền thống Nhật Bản',
        slug: 'obi-dai',
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
        descriptionEn: 'Traditional Kimono with cherry blossom pattern',
        descriptionJa: '桜の模様の伝統的な着物',
        price: 1500000,
        originalPrice: 1800000,
        categoryId: createdCategories[0]._id,
        images: ['/images/kimono-1.jpg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đỏ', 'Xanh', 'Tím'],
        stock: 10,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['kimono', 'truyền thống', 'hoa anh đào']
      },
      {
        name: 'Áo Yukata Mùa Hè',
        nameEn: 'Summer Yukata',
        nameJa: '夏の浴衣',
        description: 'Áo Yukata mùa hè với họa tiết hoa cúc',
        descriptionEn: 'Summer Yukata with chrysanthemum pattern',
        descriptionJa: '菊の模様の夏の浴衣',
        price: 800000,
        originalPrice: 1000000,
        categoryId: createdCategories[1]._id,
        images: ['/images/yukata-1.jpg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh dương', 'Hồng', 'Trắng'],
        stock: 15,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['yukata', 'mùa hè', 'hoa cúc']
      },
      {
        name: 'Quạt Giấy Nhật Bản',
        nameEn: 'Japanese Paper Fan',
        nameJa: '和紙の扇子',
        description: 'Quạt giấy truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese paper fan',
        descriptionJa: '伝統的な和紙の扇子',
        price: 150000,
        originalPrice: 200000,
        categoryId: createdCategories[7]._id, // Phụ kiện
        images: ['/images/fan-1.jpg'],
        sizes: ['One Size'],
        colors: ['Đỏ', 'Xanh', 'Vàng'],
        stock: 50,
        isActive: true,
        isFeatured: false,
        onSale: true,
        tags: ['quạt', 'giấy', 'truyền thống']
      },
      {
        name: 'Áo Top Nhật Bản',
        nameEn: 'Japanese Top',
        nameJa: '日本のトップス',
        description: 'Áo top thời trang Nhật Bản hiện đại',
        descriptionEn: 'Modern Japanese fashion top',
        descriptionJa: 'モダンな日本のファッショントップ',
        price: 500000,
        originalPrice: 600000,
        categoryId: createdCategories[2]._id, // Tops
        images: ['/images/top-1.jpg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Trắng', 'Đen', 'Xanh'],
        stock: 20,
        isActive: true,
        isFeatured: false,
        onSale: false,
        tags: ['top', 'hiện đại', 'thời trang']
      },
      {
        name: 'Quần Bottoms Nhật Bản',
        nameEn: 'Japanese Bottoms',
        nameJa: '日本のボトムス',
        description: 'Quần bottoms thời trang Nhật Bản',
        descriptionEn: 'Japanese fashion bottoms',
        descriptionJa: '日本のファッションボトムス',
        price: 700000,
        originalPrice: 800000,
        categoryId: createdCategories[3]._id, // Bottoms
        images: ['/images/bottoms-1.jpg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh', 'Nâu'],
        stock: 12,
        isActive: true,
        isFeatured: true,
        onSale: false,
        tags: ['bottoms', 'quần', 'thời trang']
      },
      {
        name: 'Quần Hakama Truyền Thống',
        nameEn: 'Traditional Hakama',
        nameJa: '伝統的な袴',
        description: 'Quần Hakama truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese Hakama pants',
        descriptionJa: '伝統的な日本の袴',
        price: 1200000,
        originalPrice: 1500000,
        categoryId: createdCategories[4]._id, // Hakama
        images: ['/images/hakama-1.jpg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đậm'],
        stock: 8,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['hakama', 'truyền thống', 'lễ phục']
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