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

// Enhanced color translations with proper color codes
const colorTranslations = {
  'Đen': { en: 'Black', ja: '黒', hex: '#000000' },
  'Trắng': { en: 'White', ja: '白', hex: '#FFFFFF' },
  'Đỏ': { en: 'Red', ja: '赤', hex: '#FF0000' },
  'Xanh dương': { en: 'Blue', ja: '青', hex: '#0000FF' },
  'Xanh lá': { en: 'Green', ja: '緑', hex: '#00FF00' },
  'Hồng': { en: 'Pink', ja: 'ピンク', hex: '#FFC0CB' },
  'Tím': { en: 'Purple', ja: '紫', hex: '#800080' },
  'Vàng': { en: 'Yellow', ja: '黄色', hex: '#FFFF00' },
  'Nâu': { en: 'Brown', ja: '茶色', hex: '#A52A2A' },
  'Xám': { en: 'Gray', ja: 'グレー', hex: '#808080' },
  'Xanh đen': { en: 'Navy', ja: 'ネイビー', hex: '#000080' },
  'Tím đen': { en: 'Dark Purple', ja: 'ダークパープル', hex: '#4B0082' },
  'Cam': { en: 'Orange', ja: 'オレンジ', hex: '#FFA500' },
  'Kem': { en: 'Cream', ja: 'クリーム', hex: '#FFFDD0' },
  'Bạc': { en: 'Silver', ja: 'シルバー', hex: '#C0C0C0' },
  'Vàng kim': { en: 'Gold', ja: 'ゴールド', hex: '#FFD700' }
};

// Enhanced size translations
const sizeTranslations = {
  'XS': { en: 'XS', ja: 'XS' },
  'S': { en: 'S', ja: 'S' },
  'M': { en: 'M', ja: 'M' },
  'L': { en: 'L', ja: 'L' },
  'XL': { en: 'XL', ja: 'XL' },
  'XXL': { en: 'XXL', ja: 'XXL' },
  'One Size': { en: 'One Size', ja: 'フリーサイズ' }
};

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
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword, // Don't hash here, User model will hash it
      name: 'Admin Koshiro',
      role: 'admin',
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      addresses: [
        {
          type: 'shipping',
          fullName: 'Admin Koshiro',
          phone: '+81-3-1234-5678',
          address: '123 Shibuya Street',
          city: 'Tokyo',
          state: 'Tokyo',
          zipCode: '150-0002',
          country: 'Japan',
          isDefault: true
        }
      ],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        language: 'ja',
        currency: 'JPY'
      }
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create sample users
    const sampleUsers = [
      {
        email: 'customer1@example.com',
        password: 'password123', // Don't hash here, User model will hash it
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        role: 'customer',
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [
          {
            type: 'shipping',
            fullName: 'Nguyễn Văn A',
            phone: '0123456789',
            address: '456 Le Loi Street',
            city: 'Ho Chi Minh City',
            state: 'Ho Chi Minh City',
            zipCode: '700000',
            country: 'Vietnam',
            isDefault: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: true,
          language: 'vi',
          currency: 'VND'
        }
      },
      {
        email: 'customer2@example.com',
        password: 'password123', // Don't hash here, User model will hash it
        name: 'John Smith',
        phone: '+1-555-0123',
        role: 'customer',
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [
          {
            type: 'shipping',
            fullName: 'John Smith',
            phone: '+1-555-0123',
            address: '789 Broadway',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            isDefault: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          language: 'en',
          currency: 'USD'
        }
      },
      {
        email: 'customer3@example.com',
        password: 'password123', // Don't hash here, User model will hash it
        name: 'Tanaka Hiroshi',
        phone: '+81-3-9876-5432',
        role: 'customer',
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [
          {
            type: 'shipping',
            fullName: 'Tanaka Hiroshi',
            phone: '+81-3-9876-5432',
            address: '321 Sakura Street',
            city: 'Osaka',
            state: 'Osaka',
            zipCode: '540-0001',
            country: 'Japan',
            isDefault: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false,
          language: 'ja',
          currency: 'JPY'
        }
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log('✅ Created sample users');

    // Create enhanced categories with full multilingual support
    const categories = [
      {
        name: 'Kimono',
        nameEn: 'Kimono',
        nameJa: '着物',
        description: 'Kimono truyền thống Nhật Bản với nghệ thuật thêu tay và họa tiết độc quyền',
        descriptionEn: 'Traditional Japanese kimono with hand-embroidered artistry and exclusive patterns',
        descriptionJa: '手刺繍の芸術性と独占的なパターンを持つ本格的な伝統的日本の着物',
        slug: 'kimono',
        image: '/images/categories/kimono.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Yukata',
        nameEn: 'Yukata',
        nameJa: '浴衣',
        description: 'Yukata mùa hè nhẹ nhàng với họa tiết hoa anh đào và thiết kế thoải mái cho mọi dịp',
        descriptionEn: 'Light summer yukata with cherry blossom patterns and comfortable designs for all occasions',
        descriptionJa: 'あらゆる機会に適した桜の模様と快適なデザインの軽い夏の浴衣',
        slug: 'yukata',
        image: '/images/categories/yukata.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Áo',
        nameEn: 'Tops',
        nameJa: 'トップス',
        description: 'Bộ sưu tập các loại áo thời trang Nhật Bản cao cấp với chất liệu tự nhiên và thiết kế tinh tế',
        descriptionEn: 'Premium Japanese fashion tops collection with natural materials and refined designs',
        descriptionJa: '自然素材と洗練されたデザインによる日本のプレミアムファッショントップスコレクション',
        slug: 'tops',
        image: '/images/categories/tops.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Quần',
        nameEn: 'Bottoms',
        nameJa: 'ボトムス',
        description: 'Bộ sưu tập quần và váy thời trang Nhật Bản với phom dáng hoàn hảo và comfort tối ưu',
        descriptionEn: 'Japanese fashion bottoms collection with perfect fit and optimal comfort',
        descriptionJa: '完璧なフィットと最適な快適さを備えた日本のファッションボトムスコレクション',
        slug: 'bottoms',
        image: '/images/categories/bottoms.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Hakama',
        nameEn: 'Hakama',
        nameJa: '袴',
        description: 'Hakama truyền thống cho các dịp trang trọng với chất liệu silk cao cấp và may thủ công',
        descriptionEn: 'Traditional hakama for formal occasions with premium silk materials and handcrafted construction',
        descriptionJa: 'プレミアムシルク素材と手作りの構造による正式な機会のための伝統的な袴',
        slug: 'hakama',
        image: '/images/categories/hakama.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Haori',
        nameEn: 'Haori',
        nameJa: '羽織',
        description: 'Áo khoác Haori elegant với lớp lót silk và chi tiết thêu tinh xảo',
        descriptionEn: 'Elegant haori jackets with silk lining and exquisite embroidered details',
        descriptionJa: 'シルクの裏地と精巧な刺繍の詳細を備えたエレガントな羽織ジャケット',
        slug: 'haori',
        image: '/images/categories/haori.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Obi & Đai',
        nameEn: 'Obi & Belts',
        nameJa: '帯・ベルト',
        description: 'Bộ sưu tập obi và đai thắt lưng truyền thống với nghệ thuật dệt thổ cẩm',
        descriptionEn: 'Traditional obi and belt collection with brocade weaving artistry',
        descriptionJa: '錦織りの芸術性を備えた伝統的な帯とベルトのコレクション',
        slug: 'obi-belts',
        image: '/images/categories/obi.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Phụ kiện',
        nameEn: 'Accessories',
        nameJa: 'アクセサリー',
        description: 'Phụ kiện thời trang Nhật Bản tinh tế - từ túi xách, giày dép đến trang sức truyền thống',
        descriptionEn: 'Exquisite Japanese fashion accessories - from bags, footwear to traditional jewelry',
        descriptionJa: 'バッグ、履物から伝統的なジュエリーまで、精巧な日本のファッションアクセサリー',
        slug: 'accessories',
        image: '/images/categories/accessories.jpg',
        isActive: true,
        productCount: 0
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Created categories');

    // Create enhanced products with full multilingual support and accurate colors
    const products = [
      // ===== KIMONO =====
      {
        name: 'Kimono Truyền Thống',
        nameEn: 'Traditional Kimono',
        nameJa: '伝統的な着物',
        description: 'Kimono truyền thống Nhật Bản với họa tiết hoa anh đào và nghệ thuật thêu tay tinh xảo',
        descriptionEn: 'Traditional Japanese kimono with cherry blossom patterns and exquisite hand embroidery',
        descriptionJa: '桜の模様と精巧な手刺繍を持つ伝統的な日本の着物',
        price: 1200000,
        salePrice: 1000000,
        originalPrice: 1500000,
        categoryId: createdCategories[0]._id, // Kimono
        images: [
          '/images/products/kimono-traditional-1.jpg',
          '/images/products/kimono-traditional-2.jpg',
          '/images/products/kimono-traditional-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đỏ', 'Xanh dương', 'Đen'],
        stock: 10,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['kimono', 'truyền thống', 'hoa anh đào', 'thêu tay']
      },
      {
        name: 'Kimono Furisode',
        nameEn: 'Furisode Kimono',
        nameJa: '振袖着物',
        description: 'Kimono Furisode dành cho nữ trẻ với họa tiết hoa cúc và thiết kế thanh lịch',
        descriptionEn: 'Furisode kimono for young women with chrysanthemum patterns and elegant design',
        descriptionJa: '菊の模様とエレガントなデザインの若い女性用の振袖着物',
        price: 1800000,
        salePrice: 1500000,
        originalPrice: 2200000,
        categoryId: createdCategories[0]._id, // Kimono
        images: [
          '/images/products/kimono-furisode-1.jpg',
          '/images/products/kimono-furisode-2.jpg'
        ],
        sizes: ['S', 'M', 'L'],
        colors: ['Hồng', 'Tím', 'Vàng'],
        stock: 5,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['furisode', 'kimono', 'nữ trẻ', 'hoa cúc']
      },
      
      // ===== YUKATA =====
      {
        name: 'Yukata Mùa Hè',
        nameEn: 'Summer Yukata',
        nameJa: '夏の浴衣',
        description: 'Yukata mùa hè với họa tiết hoa cúc và chất liệu cotton thoáng mát',
        descriptionEn: 'Summer yukata with chrysanthemum patterns and breathable cotton material',
        descriptionJa: '菊の模様と通気性の良いコットン素材の夏の浴衣',
        price: 445000,
        salePrice: 350000,
        originalPrice: 550000,
        categoryId: createdCategories[1]._id, // Yukata
        images: [
          '/images/products/yukata-summer-1.jpg',
          '/images/products/yukata-summer-2.jpg'
        ],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh lá', 'Hồng', 'Trắng'],
        stock: 15,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['yukata', 'mùa hè', 'hoa cúc', 'cotton']
      },
      {
        name: 'Yukata Nam',
        nameEn: 'Men Yukata',
        nameJa: '男性用浴衣',
        description: 'Yukata dành cho nam giới với họa tiết rồng truyền thống và thiết kế đơn giản',
        descriptionEn: 'Yukata for men with traditional dragon patterns and simple design',
        descriptionJa: '伝統的な龍の模様とシンプルなデザインの男性用浴衣',
        price: 380000,
        salePrice: 300000,
        originalPrice: 480000,
        categoryId: createdCategories[1]._id, // Yukata
        images: [
          '/images/products/yukata-men-1.jpg',
          '/images/products/yukata-men-2.jpg'
        ],
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh dương', 'Đen', 'Xám'],
        stock: 18,
        isActive: true,
        isFeatured: false,
        onSale: true,
        tags: ['yukata', 'nam', 'rồng', 'truyền thống']
      },
      
      // ===== TOPS =====
      {
        name: 'Áo Haori',
        nameEn: 'Haori Jacket',
        nameJa: '羽織',
        description: 'Áo khoác Haori truyền thống Nhật Bản với lớp lót silk và chi tiết thêu tinh xảo',
        descriptionEn: 'Traditional Japanese haori jacket with silk lining and exquisite embroidered details',
        descriptionJa: 'シルクの裏地と精巧な刺繍の詳細を備えた伝統的な日本の羽織',
        price: 280000,
        salePrice: 220000,
        originalPrice: 350000,
        categoryId: createdCategories[2]._id, // Tops
        images: [
          '/images/products/haori-1.jpg',
          '/images/products/haori-2.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen', 'Nâu'],
        stock: 10,
        isActive: true,
        isFeatured: false,
        onSale: true,
        tags: ['haori', 'áo khoác', 'truyền thống', 'silk']
      },
      
      // ===== BOTTOMS =====
      {
        name: 'Quần Hakama',
        nameEn: 'Hakama Pants',
        nameJa: '袴パンツ',
        description: 'Quần Hakama truyền thống cho nam với chất liệu silk cao cấp và may thủ công',
        descriptionEn: 'Traditional hakama pants for men with premium silk materials and handcrafted construction',
        descriptionJa: 'プレミアムシルク素材と手作りの構造による男性用の伝統的な袴パンツ',
        price: 800000,
        salePrice: 650000,
        originalPrice: 1000000,
        categoryId: createdCategories[3]._id, // Bottoms
        images: [
          '/images/products/hakama-1.jpg',
          '/images/products/hakama-2.jpg'
        ],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen'],
        stock: 8,
        isActive: true,
        isFeatured: true,
        onSale: true,
        tags: ['hakama', 'nam', 'truyền thống', 'silk']
      },
      
      // ===== ACCESSORIES =====
      {
        name: 'Dép Geta',
        nameEn: 'Geta Sandals',
        nameJa: '下駄',
        description: 'Dép Geta truyền thống Nhật Bản với chất liệu gỗ tự nhiên và thiết kế cổ điển',
        descriptionEn: 'Traditional Japanese geta sandals with natural wood material and classic design',
        descriptionJa: '自然な木の素材とクラシックなデザインの伝統的な日本の下駄',
        price: 50000,
        salePrice: 40000,
        originalPrice: 75000,
        categoryId: createdCategories[7]._id, // Accessories
        images: [
          '/images/products/geta-1.jpg',
          '/images/products/geta-2.jpg'
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42'],
        colors: ['Nâu', 'Đen'],
        stock: 25,
        isActive: true,
        isFeatured: false,
        onSale: true,
        tags: ['geta', 'dép', 'truyền thống', 'gỗ']
      },
      {
        name: 'Thắt Lưng Obi',
        nameEn: 'Obi Belt',
        nameJa: '帯',
        description: 'Thắt lưng Obi cho kimono với nghệ thuật dệt thổ cẩm và chất liệu silk cao cấp',
        descriptionEn: 'Obi belt for kimono with brocade weaving artistry and premium silk material',
        descriptionJa: '錦織りの芸術性とプレミアムシルク素材の着物用の帯',
        price: 100000,
        salePrice: 80000,
        originalPrice: 150000,
        categoryId: createdCategories[7]._id, // Accessories
        images: [
          '/images/products/obi-1.jpg',
          '/images/products/obi-2.jpg'
        ],
        sizes: ['One Size'],
        colors: ['Đỏ', 'Vàng', 'Xanh dương'],
        stock: 20,
        isActive: true,
        isFeatured: false,
        onSale: true,
        tags: ['obi', 'thắt lưng', 'kimono', 'thổ cẩm']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('✅ Created products');

    // Create sample orders
    const orders = [
      {
        orderNumber: 'ORD-2024-001',
        userId: createdUsers[0]._id,
        status: 'completed',
        items: [
          {
            productId: createdProducts[0]._id,
            name: createdProducts[0].name,
            nameVi: createdProducts[0].name,
            quantity: 1,
            price: createdProducts[0].salePrice || createdProducts[0].price,
            size: 'M',
            color: 'Đỏ'
          }
        ],
        totalAmount: createdProducts[0].salePrice || createdProducts[0].price,
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '456 Le Loi Street',
          city: 'Ho Chi Minh City',
          district: 'District 1',
          zipCode: '700000',
          country: 'Vietnam'
        },
        paymentMethod: 'COD',
        paymentStatus: 'paid',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        orderNumber: 'ORD-2024-002',
        userId: createdUsers[1]._id,
        status: 'processing',
        items: [
          {
            productId: createdProducts[1]._id,
            name: createdProducts[1].name,
            nameVi: createdProducts[1].name,
            quantity: 1,
            price: createdProducts[1].salePrice || createdProducts[1].price,
            size: 'L',
            color: 'Xanh lá'
          }
        ],
        totalAmount: createdProducts[1].salePrice || createdProducts[1].price,
        shippingAddress: {
          name: 'John Smith',
          phone: '+1-555-0123',
          address: '789 Broadway',
          city: 'New York',
          district: 'Manhattan',
          zipCode: '10001',
          country: 'USA'
        },
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        orderNumber: 'ORD-2024-003',
        userId: createdUsers[2]._id,
        status: 'pending',
        items: [
          {
            productId: createdProducts[2]._id,
            name: createdProducts[2].name,
            nameVi: createdProducts[2].name,
            quantity: 1,
            price: createdProducts[2].salePrice || createdProducts[2].price,
            size: 'M',
            color: 'Đen'
          }
        ],
        totalAmount: createdProducts[2].salePrice || createdProducts[2].price,
        shippingAddress: {
          name: 'Tanaka Hiroshi',
          phone: '+81-3-9876-5432',
          address: '321 Sakura Street',
          city: 'Osaka',
          district: 'Chuo Ward',
          zipCode: '540-0001',
          country: 'Japan'
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    await Order.insertMany(orders);
    console.log('✅ Created sample orders');

    // Update category product counts
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ categoryId: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }
    console.log('📊 Updated category product counts');

    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Categories: ${await Category.countDocuments()}`);
    console.log(`   - Products: ${await Product.countDocuments()}`);
    console.log(`   - Orders: ${await Order.countDocuments()}`);
    console.log('🔑 Admin credentials: admin@koshiro.com / admin123');
    console.log('👥 Customer credentials: customer1@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the seed function
seedData(); 