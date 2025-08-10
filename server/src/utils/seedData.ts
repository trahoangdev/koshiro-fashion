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

    // Create products for each category
    const products = [
      // ===== TOPS (Áo) =====
      {
        name: 'Áo Yukata Nam',
        nameEn: 'Men Yukata Top',
        nameJa: '男性用浴衣トップ',
        description: 'Áo Yukata dành cho nam giới với họa tiết truyền thống',
        descriptionEn: 'Yukata top for men with traditional patterns',
        descriptionJa: '伝統的な模様の男性用浴衣トップ',
        price: 350000,
        originalPrice: 450000,
        categoryId: savedCategories[0]._id, // Tops
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh dương', 'Đen', 'Xám'],
        stock: 12,
        isActive: true,
        isFeatured: false,
        tags: ['yukata', 'nam', 'áo', 'truyền thống']
      },
      {
        name: 'Áo Kimono Nữ',
        nameEn: 'Women Kimono Top',
        nameJa: '女性用着物トップ',
        description: 'Áo Kimono dành cho nữ với họa tiết hoa anh đào',
        descriptionEn: 'Kimono top for women with cherry blossom pattern',
        descriptionJa: '桜の模様の女性用着物トップ',
        price: 550000,
        originalPrice: 700000,
        categoryId: savedCategories[0]._id, // Tops
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Hồng', 'Trắng', 'Xanh lá'],
        stock: 15,
        isActive: true,
        isFeatured: true,
        tags: ['kimono', 'nữ', 'áo', 'hoa anh đào']
      },
      {
        name: 'Áo Haori',
        nameEn: 'Haori Jacket',
        nameJa: '羽織',
        description: 'Áo khoác Haori truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese haori jacket',
        descriptionJa: '伝統的な日本の羽織',
        price: 280000,
        originalPrice: 350000,
        categoryId: savedCategories[0]._id, // Tops
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen', 'Nâu'],
        stock: 10,
        isActive: true,
        isFeatured: false,
        tags: ['haori', 'áo khoác', 'truyền thống']
      },
      {
        name: 'Áo Happi',
        nameEn: 'Happi Coat',
        nameJa: '法被',
        description: 'Áo Happi truyền thống cho lễ hội',
        descriptionEn: 'Traditional happi coat for festivals',
        descriptionJa: '祭りのための伝統的な法被',
        price: 180000,
        originalPrice: 220000,
        categoryId: savedCategories[0]._id, // Tops
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đỏ', 'Xanh dương', 'Trắng'],
        stock: 20,
        isActive: true,
        isFeatured: false,
        tags: ['happi', 'lễ hội', 'áo']
      },
      {
        name: 'Áo Jinbei',
        nameEn: 'Jinbei Top',
        nameJa: '甚平トップ',
        description: 'Áo Jinbei mùa hè thoải mái',
        descriptionEn: 'Comfortable summer jinbei top',
        descriptionJa: '快適な夏の甚平トップ',
        price: 120000,
        originalPrice: 150000,
        categoryId: savedCategories[0]._id, // Tops
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Xanh lá', 'Xanh dương', 'Trắng'],
        stock: 25,
        isActive: true,
        isFeatured: false,
        tags: ['jinbei', 'mùa hè', 'áo']

      },

      // ===== BOTTOMS (Quần) =====
      {
        name: 'Quần Hakama',
        nameEn: 'Hakama Pants',
        nameJa: '袴パンツ',
        description: 'Quần Hakama truyền thống cho nam',
        descriptionEn: 'Traditional hakama pants for men',
        descriptionJa: '男性用の伝統的な袴パンツ',
        price: 800000,
        originalPrice: 1000000,
        categoryId: savedCategories[1]._id, // Bottoms
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen'],
        stock: 8,
        isActive: true,
        isFeatured: true,
        tags: ['hakama', 'nam', 'truyền thống']
      },
      {
        name: 'Quần Yukata Nữ',
        nameEn: 'Women Yukata Pants',
        nameJa: '女性用浴衣パンツ',
        description: 'Quần Yukata dành cho nữ với họa tiết hoa cúc',
        descriptionEn: 'Yukata pants for women with chrysanthemum pattern',
        descriptionJa: '菊の模様の女性用浴衣パンツ',
        price: 320000,
        originalPrice: 400000,
        categoryId: savedCategories[1]._id, // Bottoms
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh lá', 'Hồng', 'Trắng'],
        stock: 18,
        isActive: true,
        isFeatured: false,
        tags: ['yukata', 'nữ', 'quần', 'hoa cúc']
      },
      {
        name: 'Quần Jinbei',
        nameEn: 'Jinbei Pants',
        nameJa: '甚平パンツ',
        description: 'Quần Jinbei mùa hè thoải mái',
        descriptionEn: 'Comfortable summer jinbei pants',
        descriptionJa: '快適な夏の甚平パンツ',
        price: 100000,
        originalPrice: 120000,
        categoryId: savedCategories[1]._id, // Bottoms
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Xanh lá', 'Xanh dương', 'Trắng'],
        stock: 30,
        isActive: true,
        isFeatured: false,
        tags: ['jinbei', 'mùa hè', 'quần']
      },
      {
        name: 'Quần Fundoshi',
        nameEn: 'Fundoshi',
        nameJa: '褌',
        description: 'Quần Fundoshi truyền thống',
        descriptionEn: 'Traditional fundoshi',
        descriptionJa: '伝統的な褌',
        price: 80000,
        originalPrice: 100000,
        categoryId: savedCategories[1]._id, // Bottoms
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Trắng', 'Xanh dương'],
        stock: 15,
        isActive: true,
        isFeatured: false,
        tags: ['fundoshi', 'truyền thống', 'quần']
      },
      {
        name: 'Quần Momohiki',
        nameEn: 'Momohiki Pants',
        nameJa: '股引パンツ',
        description: 'Quần Momohiki ấm áp mùa đông',
        descriptionEn: 'Warm winter momohiki pants',
        descriptionJa: '暖かい冬の股引パンツ',
        price: 150000,
        originalPrice: 180000,
        categoryId: savedCategories[1]._id, // Bottoms
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xám', 'Nâu'],
        stock: 12,
        isActive: true,
        isFeatured: false,
        tags: ['momohiki', 'mùa đông', 'quần']

      },

      // ===== ACCESSORIES (Phụ kiện) =====
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
      },
      {
        name: 'Túi Kinchaku',
        nameEn: 'Kinchaku Bag',
        nameJa: '巾着',
        description: 'Túi Kinchaku truyền thống',
        descriptionEn: 'Traditional kinchaku bag',
        descriptionJa: '伝統的な巾着',
        price: 80000,
        originalPrice: 100000,
        categoryId: savedCategories[2]._id, // Accessories
        images: ['/placeholder.svg'],
        sizes: ['One Size'],
        colors: ['Đỏ', 'Xanh dương', 'Hồng'],
        stock: 15,
        isActive: true,
        isFeatured: false,
        tags: ['kinchaku', 'túi', 'truyền thống']
      },
      {
        name: 'Quạt Sensu',
        nameEn: 'Sensu Fan',
        nameJa: '扇子',
        description: 'Quạt Sensu truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese sensu fan',
        descriptionJa: '伝統的な日本の扇子',
        price: 30000,
        originalPrice: 45000,
        categoryId: savedCategories[2]._id, // Accessories
        images: ['/placeholder.svg'],
        sizes: ['One Size'],
        colors: ['Trắng', 'Đen', 'Hồng'],
        stock: 40,
        isActive: true,
        isFeatured: false,
        tags: ['sensu', 'quạt', 'truyền thống']
      },
      {
        name: 'Vớ Tabi',
        nameEn: 'Tabi Socks',
        nameJa: '足袋',
        description: 'Vớ Tabi truyền thống Nhật Bản',
        descriptionEn: 'Traditional Japanese tabi socks',
        descriptionJa: '伝統的な日本の足袋',
        price: 25000,
        originalPrice: 35000,
        categoryId: savedCategories[2]._id, // Accessories
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Trắng', 'Đen', 'Xanh dương'],
        stock: 35,
        isActive: true,
        isFeatured: false,
        tags: ['tabi', 'vớ', 'truyền thống']

      },

      // ===== KIMONO =====
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
        name: 'Kimono Furisode',
        nameEn: 'Furisode Kimono',
        nameJa: '振袖着物',
        description: 'Kimono Furisode dành cho nữ trẻ',
        descriptionEn: 'Furisode kimono for young women',
        descriptionJa: '若い女性用の振袖着物',
        price: 1800000,
        originalPrice: 2200000,
        categoryId: savedCategories[3]._id, // Kimono
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Hồng', 'Tím', 'Vàng'],
        stock: 5,
        isActive: true,
        isFeatured: true,
        tags: ['furisode', 'kimono', 'nữ trẻ']
      },
      {
        name: 'Kimono Tomesode',
        nameEn: 'Tomesode Kimono',
        nameJa: '留袖着物',
        description: 'Kimono Tomesode dành cho phụ nữ đã kết hôn',
        descriptionEn: 'Tomesode kimono for married women',
        descriptionJa: '既婚女性用の留袖着物',
        price: 1500000,
        originalPrice: 1800000,
        categoryId: savedCategories[3]._id, // Kimono
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Đen', 'Xanh đen', 'Tím đen'],
        stock: 8,
        isActive: true,
        isFeatured: false,
        tags: ['tomesode', 'kimono', 'đã kết hôn']
      },
      {
        name: 'Kimono Houmongi',
        nameEn: 'Houmongi Kimono',
        nameJa: '訪問着着物',
        description: 'Kimono Houmongi dành cho các dịp trang trọng',
        descriptionEn: 'Houmongi kimono for formal occasions',
        descriptionJa: '正式な場所用の訪問着着物',
        price: 1400000,
        originalPrice: 1700000,
        categoryId: savedCategories[3]._id, // Kimono
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh dương', 'Xanh lá', 'Tím'],
        stock: 6,
        isActive: true,
        isFeatured: false,
        tags: ['houmongi', 'kimono', 'trang trọng']
      },
      {
        name: 'Kimono Komon',
        nameEn: 'Komon Kimono',
        nameJa: '小紋着物',
        description: 'Kimono Komon với họa tiết nhỏ cho mặc hàng ngày',
        descriptionEn: 'Komon kimono with small patterns for daily wear',
        descriptionJa: '日常着用の小模様の小紋着物',
        price: 800000,
        originalPrice: 1000000,
        categoryId: savedCategories[3]._id, // Kimono
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Xanh lá', 'Hồng', 'Vàng'],
        stock: 12,
        isActive: true,
        isFeatured: false,
        tags: ['komon', 'kimono', 'hàng ngày']

      },

      // ===== YUKATA =====
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
        name: 'Yukata Nam',
        nameEn: 'Men Yukata',
        nameJa: '男性用浴衣',
        description: 'Yukata dành cho nam giới với họa tiết đơn giản',
        descriptionEn: 'Yukata for men with simple patterns',
        descriptionJa: 'シンプルな模様の男性用浴衣',
        price: 380000,
        originalPrice: 480000,
        categoryId: savedCategories[4]._id, // Yukata
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh dương', 'Đen', 'Xám'],
        stock: 18,
        isActive: true,
        isFeatured: false,
        tags: ['yukata', 'nam', 'đơn giản']
      },
      {
        name: 'Yukata Nữ',
        nameEn: 'Women Yukata',
        nameJa: '女性用浴衣',
        description: 'Yukata dành cho nữ với họa tiết hoa anh đào',
        descriptionEn: 'Yukata for women with cherry blossom pattern',
        descriptionJa: '桜の模様の女性用浴衣',
        price: 420000,
        originalPrice: 520000,
        categoryId: savedCategories[4]._id, // Yukata
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Hồng', 'Tím', 'Trắng'],
        stock: 20,
        isActive: true,
        isFeatured: false,
        tags: ['yukata', 'nữ', 'hoa anh đào']
      },
      {
        name: 'Yukata Trẻ Em',
        nameEn: 'Children Yukata',
        nameJa: '子供用浴衣',
        description: 'Yukata dành cho trẻ em với họa tiết dễ thương',
        descriptionEn: 'Yukata for children with cute patterns',
        descriptionJa: 'かわいい模様の子供用浴衣',
        price: 280000,
        originalPrice: 350000,
        categoryId: savedCategories[4]._id, // Yukata
        images: ['/placeholder.svg'],
        sizes: ['XS', 'S', 'M'],
        colors: ['Xanh lá', 'Hồng', 'Vàng'],
        stock: 25,
        isActive: true,
        isFeatured: false,
        tags: ['yukata', 'trẻ em', 'dễ thương']
      },
      {
        name: 'Yukata Lễ Hội',
        nameEn: 'Festival Yukata',
        nameJa: '祭り浴衣',
        description: 'Yukata đặc biệt cho các lễ hội mùa hè',
        descriptionEn: 'Special yukata for summer festivals',
        descriptionJa: '夏祭り用の特別な浴衣',
        price: 500000,
        originalPrice: 620000,
        categoryId: savedCategories[4]._id, // Yukata
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Đỏ', 'Xanh dương', 'Vàng'],
        stock: 10,
        isActive: true,
        isFeatured: true,
        tags: ['yukata', 'lễ hội', 'mùa hè']

      },

      // ===== HAKAMA =====
      {
        name: 'Hakama Nam',
        nameEn: 'Men Hakama',
        nameJa: '男性用袴',
        description: 'Hakama truyền thống dành cho nam giới',
        descriptionEn: 'Traditional hakama for men',
        descriptionJa: '男性用の伝統的な袴',
        price: 800000,
        originalPrice: 1000000,
        categoryId: savedCategories[5]._id, // Hakama
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen'],
        stock: 8,
        isActive: true,
        isFeatured: true,
        tags: ['hakama', 'nam', 'truyền thống']
      },
      {
        name: 'Hakama Nữ',
        nameEn: 'Women Hakama',
        nameJa: '女性用袴',
        description: 'Hakama dành cho nữ với thiết kế thanh lịch',
        descriptionEn: 'Hakama for women with elegant design',
        descriptionJa: 'エレガントなデザインの女性用袴',
        price: 750000,
        originalPrice: 950000,
        categoryId: savedCategories[5]._id, // Hakama
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Đen', 'Xanh đen', 'Tím đen'],
        stock: 10,
        isActive: true,
        isFeatured: false,
        tags: ['hakama', 'nữ', 'thanh lịch']
      },
      {
        name: 'Hakama Học Sinh',
        nameEn: 'Student Hakama',
        nameJa: '学生用袴',
        description: 'Hakama dành cho học sinh với thiết kế đơn giản',
        descriptionEn: 'Hakama for students with simple design',
        descriptionJa: 'シンプルなデザインの学生用袴',
        price: 600000,
        originalPrice: 750000,
        categoryId: savedCategories[5]._id, // Hakama
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L'],
        colors: ['Đen', 'Xanh đen'],
        stock: 15,
        isActive: true,
        isFeatured: false,
        tags: ['hakama', 'học sinh', 'đơn giản']
      },
      {
        name: 'Hakama Võ Sĩ',
        nameEn: 'Martial Artist Hakama',
        nameJa: '武道家用袴',
        description: 'Hakama dành cho võ sĩ với chất liệu bền bỉ',
        descriptionEn: 'Hakama for martial artists with durable material',
        descriptionJa: '耐久性のある素材の武道家用袴',
        price: 900000,
        originalPrice: 1100000,
        categoryId: savedCategories[5]._id, // Hakama
        images: ['/placeholder.svg'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen'],
        stock: 6,
        isActive: true,
        isFeatured: false,
        tags: ['hakama', 'võ sĩ', 'bền bỉ']
      },
      {
        name: 'Hakama Lễ Hội',
        nameEn: 'Festival Hakama',
        nameJa: '祭り袴',
        description: 'Hakama đặc biệt cho các lễ hội truyền thống',
        descriptionEn: 'Special hakama for traditional festivals',
        descriptionJa: '伝統的な祭り用の特別な袴',
        price: 850000,
        originalPrice: 1050000,
        categoryId: savedCategories[5]._id, // Hakama
        images: ['/placeholder.svg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen', 'Tím đen'],
        stock: 8,
        isActive: true,
        isFeatured: false,
        tags: ['hakama', 'lễ hội', 'truyền thống']
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
    console.log('📦 Total products created: ' + products.length);

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