import { connectDB, disconnectDB } from '../config/database';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting to seed data...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@koshiro.com',
      password: 'admin123',
      name: 'Admin Koshiro',
      role: 'admin',
      status: 'active'
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Create categories
    const categories = [
      {
        name: 'Áo',
        nameEn: 'Tops',
        nameJa: 'トップス',
        description: 'Các loại áo thời trang Nhật Bản',
        descriptionEn: 'Japanese fashion tops',
        descriptionJa: '日本のファッショントップス',
        slug: 'tops',
        image: '/placeholder.svg',
        isActive: true
      },
      {
        name: 'Quần',
        nameEn: 'Bottoms',
        nameJa: 'ボトムス',
        description: 'Các loại quần thời trang Nhật Bản',
        descriptionEn: 'Japanese fashion bottoms',
        descriptionJa: '日本のファッションボトムス',
        slug: 'bottoms',
        image: '/placeholder.svg',
        isActive: true
      },
      {
        name: 'Phụ kiện',
        nameEn: 'Accessories',
        nameJa: 'アクセサリー',
        description: 'Phụ kiện thời trang Nhật Bản',
        descriptionEn: 'Japanese fashion accessories',
        descriptionJa: '日本のファッションアクセサリー',
        slug: 'accessories',
        image: '/placeholder.svg',
        isActive: true
      },
      {
        name: 'Kimono',
        nameEn: 'Kimono',
        nameJa: '着物',
        description: 'Kimono truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese kimono',
        descriptionJa: '伝統的な日本の着物',
        slug: 'kimono',
        image: '/placeholder.svg',
        isActive: true
      },
      {
        name: 'Yukata',
        nameEn: 'Yukata',
        nameJa: '浴衣',
        description: 'Yukata mùa hè Nhật Bản',
        descriptionEn: 'Japanese summer yukata',
        descriptionJa: '日本の夏の浴衣',
        slug: 'yukata',
        image: '/placeholder.svg',
        isActive: true
      },
      {
        name: 'Hakama',
        nameEn: 'Hakama',
        nameJa: '袴',
        description: 'Hakama truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese hakama',
        descriptionJa: '伝統的な日本の袴',
        slug: 'hakama',
        image: '/placeholder.svg',
        isActive: true
      }
    ];

    const savedCategories = await Category.insertMany(categories);
    console.log('📂 Created categories');

    // Create products
    const products = [
      {
        name: 'Kimono Truyền Thống',
        nameEn: 'Traditional Kimono',
        nameJa: '伝統的な着物',
        description: 'Kimono truyền thống Nhật Bản với họa tiết hoa anh đào',
        descriptionEn: 'Traditional Japanese kimono with cherry blossom pattern',
        descriptionJa: '桜の模様の伝統的な日本の着物',
        price: 1200000,
        originalPrice: 1500000,
        categoryId: savedCategories[3]._id, // Kimono
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đỏ', 'Xanh dương', 'Đen'],
        stock: 10,
        isActive: true,
        isFeatured: true,
        tags: ['kimono', 'truyền thống', 'hoa anh đào']
      },
      {
        name: 'Yukata Mùa Hè',
        nameEn: 'Summer Yukata',
        nameJa: '夏の浴衣',
        description: 'Yukata mùa hè với họa tiết hoa cúc',
        descriptionEn: 'Summer yukata with chrysanthemum pattern',
        descriptionJa: '菊の模様の夏の浴衣',
        price: 445000,
        originalPrice: 550000,
        categoryId: savedCategories[4]._id, // Yukata
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh lá', 'Hồng', 'Trắng'],
        stock: 15,
        isActive: true,
        isFeatured: true,
        tags: ['yukata', 'mùa hè', 'hoa cúc']
      },
      {
        name: 'Quần Hakama',
        nameEn: 'Hakama Pants',
        nameJa: '袴パンツ',
        description: 'Quần Hakama truyền thống cho nam',
        descriptionEn: 'Traditional hakama pants for men',
        descriptionJa: '男性用の伝統的な袴パンツ',
        price: 800000,
        originalPrice: 1000000,
        categoryId: savedCategories[5]._id, // Hakama
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen'],
        stock: 8,
        isActive: true,
        isFeatured: false,
        tags: ['hakama', 'nam', 'truyền thống']
      },
      {
        name: 'Áo Yukata Nam',
        nameEn: 'Men Yukata Top',
        nameJa: '男性用浴衣トップ',
        description: 'Áo Yukata dành cho nam giới',
        descriptionEn: 'Yukata top for men',
        descriptionJa: '男性用の浴衣トップ',
        price: 350000,
        originalPrice: 450000,
        categoryId: savedCategories[0]._id, // Tops
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh dương', 'Đen', 'Xám'],
        stock: 12,
        isActive: true,
        isFeatured: false,
        tags: ['yukata', 'nam', 'áo']
      },
      {
        name: 'Dép Geta',
        nameEn: 'Geta Sandals',
        nameJa: '下駄',
        description: 'Dép Geta truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese geta sandals',
        descriptionJa: '伝統的な日本の下駄',
        price: 50000,
        originalPrice: 75000,
        categoryId: savedCategories[2]._id, // Accessories
        images: ['/placeholder.svg'],
        sizes: ['36', '37', '38', '39', '40', '41', '42'],
        colors: ['Nâu', 'Đen'],
        stock: 25,
        isActive: true,
        isFeatured: false,
        tags: ['geta', 'dép', 'truyền thống']
      },
      {
        name: 'Thắt Lưng Obi',
        nameEn: 'Obi Belt',
        nameJa: '帯',
        description: 'Thắt lưng Obi cho kimono',
        descriptionEn: 'Obi belt for kimono',
        descriptionJa: '着物用の帯',
        price: 100000,
        originalPrice: 150000,
        categoryId: savedCategories[2]._id, // Accessories
        images: ['/placeholder.svg'],
        sizes: ['One Size'],
        colors: ['Đỏ', 'Vàng', 'Xanh dương'],
        stock: 20,
        isActive: true,
        isFeatured: false,
        tags: ['obi', 'thắt lưng', 'kimono']
      }
    ];

    await Product.insertMany(products);
    console.log('👕 Created products');

    // Update category product counts
    for (const category of savedCategories) {
      const count = await Product.countDocuments({ categoryId: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }
    console.log('📊 Updated category product counts');

    console.log('✅ Data seeding completed successfully!');
    console.log('🔑 Admin credentials: admin@koshiro.com / admin123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await disconnectDB();
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

export default seedData; 