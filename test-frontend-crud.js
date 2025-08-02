// Test script to verify frontend-backend CRUD connection
const API_BASE_URL = 'http://localhost:3000/api';

// Test admin credentials
const adminCredentials = {
  email: 'admin@koshiro.com',
  password: 'admin123'
};

let authToken = null;

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('🔐 Testing admin login...');
  
  try {
    const response = await makeRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(adminCredentials)
    });
    
    authToken = response.token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    return false;
  }
}

// Test CRUD operations through API
async function testApiCRUD() {
  console.log('\n🚀 Testing API CRUD operations...\n');

  try {
    // 1. Test Category CRUD
    console.log('📁 Testing Category CRUD...');
    
    const testCategory = {
      name: 'API Test Category',
      nameEn: 'API Test Category',
      nameJa: 'APIテストカテゴリ',
      description: 'Category created via API test',
      slug: 'api-test-category',
      isActive: true
    };
    
    // Create category
    console.log('Creating category via API...');
    const createdCategory = await makeRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(testCategory)
    });
    console.log('✅ Category created via API:', createdCategory.category.name);
    
    const categoryId = createdCategory.category._id;
    
    // Read categories
    console.log('Reading categories via API...');
    const categories = await makeRequest('/admin/categories');
    const foundCategory = categories.categories.find(cat => cat._id === categoryId);
    console.log('✅ Category found via API:', foundCategory.name);
    
    // Update category
    console.log('Updating category via API...');
    const updatedCategory = await makeRequest(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...testCategory,
        name: 'Updated API Test Category',
        description: 'Updated via API test'
      })
    });
    console.log('✅ Category updated via API:', updatedCategory.category.name);
    
    // 2. Test Product CRUD
    console.log('\n📦 Testing Product CRUD...');
    
    const testProduct = {
      name: 'API Test Product',
      nameEn: 'API Test Product',
      nameJa: 'APIテスト商品',
      description: 'Product created via API test',
      descriptionEn: 'Product created via API test in English',
      descriptionJa: 'APIテストで作成された商品',
      price: 150000,
      originalPrice: 180000,
      categoryId: categoryId,
      images: ['https://example.com/api-test-image.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 25,
      tags: ['api-test', 'sample'],
      isActive: true,
      isFeatured: true,
      onSale: true
    };
    
    // Create product
    console.log('Creating product via API...');
    const createdProduct = await makeRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(testProduct)
    });
    console.log('✅ Product created via API:', createdProduct.product.name);
    
    const productId = createdProduct.product._id;
    
    // Read products
    console.log('Reading products via API...');
    const products = await makeRequest('/admin/products');
    const foundProduct = products.data.find(prod => prod._id === productId);
    console.log('✅ Product found via API:', foundProduct.name);
    
    // Update product
    console.log('Updating product via API...');
    const updatedProduct = await makeRequest(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...testProduct,
        name: 'Updated API Test Product',
        price: 140000
      })
    });
    console.log('✅ Product updated via API:', updatedProduct.product.name);
    
    // 3. Test Delete operations
    console.log('\n🗑️ Testing Delete operations...');
    
    // Delete product
    console.log('Deleting product via API...');
    await makeRequest(`/admin/products/${productId}`, {
      method: 'DELETE'
    });
    console.log('✅ Product deleted via API');
    
    // Delete category
    console.log('Deleting category via API...');
    await makeRequest(`/admin/categories/${categoryId}`, {
      method: 'DELETE'
    });
    console.log('✅ Category deleted via API');
    
    console.log('\n🎉 All API CRUD tests passed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ API CRUD test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Frontend-Backend CRUD Tests...\n');
  
  // Test admin login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin authentication');
    return;
  }
  
  // Test API CRUD operations
  const crudSuccess = await testApiCRUD();
  
  if (crudSuccess) {
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Frontend can connect to backend');
    console.log('✅ CRUD operations work correctly');
    console.log('✅ Authentication is working');
  } else {
    console.log('\n❌ Some tests failed');
  }
}

// Run the tests
runTests().catch(console.error); 