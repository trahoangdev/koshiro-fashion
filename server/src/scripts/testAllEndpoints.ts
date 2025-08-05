import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'customer1@example.com',
  password: 'password123'
};

const testAdmin = {
  email: 'admin@koshiro.com',
  password: 'password123'
};

let userToken = '';
let adminToken = '';

async function testEndpoint(method: string, endpoint: string, data?: any, token?: string) {
  try {
    const config: any = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log(`❌ ${method} ${endpoint} - Status: ${error.response.status} - ${error.response.data.message || 'Error'}`);
    } else {
      console.log(`❌ ${method} ${endpoint} - Network Error`);
    }
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive API endpoint tests...\n');

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check');
  await testEndpoint('GET', '/health');
  console.log('');

  // Test 2: Public Endpoints
  console.log('📋 Test 2: Public Endpoints');
  await testEndpoint('GET', '/products');
  await testEndpoint('GET', '/products/featured');
  await testEndpoint('GET', '/products/search?q=kimono');
  await testEndpoint('GET', '/categories');
  await testEndpoint('GET', '/reviews');
  await testEndpoint('GET', '/reviews/stats');
  console.log('');

  // Test 3: Authentication
  console.log('📋 Test 3: Authentication');
  const userLoginResponse = await testEndpoint('POST', '/auth/login', testUser);
  if (userLoginResponse) {
    userToken = userLoginResponse.token;
    console.log('✅ User login successful');
  }

  const adminLoginResponse = await testEndpoint('POST', '/auth/admin-login', testAdmin);
  if (adminLoginResponse) {
    adminToken = adminLoginResponse.token;
    console.log('✅ Admin login successful');
  }
  console.log('');

  // Test 4: User Protected Endpoints
  console.log('📋 Test 4: User Protected Endpoints');
  await testEndpoint('GET', '/auth/profile', null, userToken);
  await testEndpoint('GET', '/orders/my-orders', null, userToken);
  await testEndpoint('GET', '/wishlist', null, userToken);
  await testEndpoint('GET', '/cart', null, userToken);
  await testEndpoint('GET', '/payment-methods', null, userToken);
  console.log('');

  // Test 5: Admin Protected Endpoints
  console.log('📋 Test 5: Admin Protected Endpoints');
  await testEndpoint('GET', '/admin/stats', null, adminToken);
  await testEndpoint('GET', '/admin/orders', null, adminToken);
  await testEndpoint('GET', '/admin/products', null, adminToken);
  await testEndpoint('GET', '/admin/categories', null, adminToken);
  await testEndpoint('GET', '/admin/users', null, adminToken);
  await testEndpoint('GET', '/admin/revenue-data', null, adminToken);
  await testEndpoint('GET', '/admin/product-stats', null, adminToken);
  console.log('');

  // Test 6: Settings Endpoints
  console.log('📋 Test 6: Settings Endpoints');
  await testEndpoint('GET', '/settings', null, adminToken);
  await testEndpoint('PUT', '/settings', {
    websiteName: 'Koshiro Fashion Updated',
    enableDarkMode: true
  }, adminToken);
  console.log('');

  // Test 7: CRUD Operations (Admin)
  console.log('📋 Test 7: CRUD Operations (Admin)');
  
  // Create a test category
  const newCategory = await testEndpoint('POST', '/admin/categories', {
    name: 'Test Category',
    nameEn: 'Test Category EN',
    nameJa: 'テストカテゴリ',
    description: 'Test category description',
    slug: 'test-category',
    isActive: true
  }, adminToken);

  if (newCategory) {
    const categoryId = newCategory.category._id;
    console.log(`✅ Created category with ID: ${categoryId}`);

    // Update category
    await testEndpoint('PUT', `/admin/categories/${categoryId}`, {
      name: 'Updated Test Category',
      description: 'Updated description'
    }, adminToken);

    // Create a test product
    const newProduct = await testEndpoint('POST', '/admin/products', {
      name: 'Test Product',
      nameEn: 'Test Product EN',
      nameJa: 'テスト商品',
      description: 'Test product description',
      price: 100000,
      categoryId: categoryId,
      images: ['/placeholder.svg'],
      sizes: ['S', 'M', 'L'],
      colors: ['Red', 'Blue'],
      stock: 10,
      isActive: true,
      isFeatured: false,
      onSale: false,
      tags: ['test']
    }, adminToken);

    if (newProduct) {
      const productId = newProduct.product._id;
      console.log(`✅ Created product with ID: ${productId}`);

      // Update product
      await testEndpoint('PUT', `/admin/products/${productId}`, {
        name: 'Updated Test Product',
        price: 150000
      }, adminToken);

      // Test user operations with the product
      await testEndpoint('POST', '/wishlist', { productId }, userToken);
      await testEndpoint('POST', '/cart', { productId, quantity: 1 }, userToken);

      // Delete product
      await testEndpoint('DELETE', `/admin/products/${productId}`, null, adminToken);
    }

    // Delete category
    await testEndpoint('DELETE', `/admin/categories/${categoryId}`, null, adminToken);
  }
  console.log('');

  // Test 8: Order Tracking (Public)
  console.log('📋 Test 8: Order Tracking (Public)');
  await testEndpoint('GET', '/orders/track/TEST123');
  console.log('');

  // Test 9: Review Operations
  console.log('📋 Test 9: Review Operations');
  const newReview = await testEndpoint('POST', '/reviews', {
    rating: 5,
    title: 'Great Product!',
    comment: 'This is a test review'
  }, userToken);

  if (newReview) {
    const reviewId = newReview.review._id;
    await testEndpoint('POST', `/reviews/${reviewId}/helpful`, null, userToken);
  }
  console.log('');

  console.log('🎉 All tests completed!');
}

// Run the tests
runTests().catch(console.error); 