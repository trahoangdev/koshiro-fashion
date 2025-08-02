// Test script to verify CRUD operations
const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testCategory = {
  name: 'Test Category',
  nameEn: 'Test Category',
  nameJa: 'テストカテゴリ',
  description: 'Test category description',
  slug: 'test-category',
  isActive: true
};

const testProduct = {
  name: 'Test Product',
  nameEn: 'Test Product',
  nameJa: 'テスト商品',
  description: 'Test product description',
  descriptionEn: 'Test product description in English',
  descriptionJa: 'テスト商品の説明',
  price: 100000,
  originalPrice: 120000,
  categoryId: '', // Will be set after creating category
  images: ['https://example.com/test-image.jpg'],
  sizes: ['S', 'M', 'L'],
  colors: ['Red', 'Blue'],
  stock: 10,
  tags: ['test', 'sample'],
  isActive: true,
  isFeatured: false,
  onSale: true
};

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
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

// Test CRUD operations
async function testCRUD() {
  console.log('🚀 Starting CRUD test...\n');

  try {
    // 1. Test Category CRUD
    console.log('📁 Testing Category CRUD...');
    
    // Create category
    console.log('Creating category...');
    const createdCategory = await makeRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(testCategory)
    });
    console.log('✅ Category created:', createdCategory.category.name);
    
    const categoryId = createdCategory.category._id;
    
    // Read category
    console.log('Reading category...');
    const categories = await makeRequest('/admin/categories');
    const foundCategory = categories.categories.find(cat => cat._id === categoryId);
    console.log('✅ Category found:', foundCategory.name);
    
    // Update category
    console.log('Updating category...');
    const updatedCategory = await makeRequest(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...testCategory,
        name: 'Updated Test Category',
        description: 'Updated description'
      })
    });
    console.log('✅ Category updated:', updatedCategory.category.name);
    
    // 2. Test Product CRUD
    console.log('\n📦 Testing Product CRUD...');
    
    // Set category ID for product
    testProduct.categoryId = categoryId;
    
    // Create product
    console.log('Creating product...');
    const createdProduct = await makeRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(testProduct)
    });
    console.log('✅ Product created:', createdProduct.product.name);
    
    const productId = createdProduct.product._id;
    
    // Read products
    console.log('Reading products...');
    const products = await makeRequest('/admin/products');
    const foundProduct = products.data.find(prod => prod._id === productId);
    console.log('✅ Product found:', foundProduct.name);
    
    // Update product
    console.log('Updating product...');
    const updatedProduct = await makeRequest(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...testProduct,
        name: 'Updated Test Product',
        price: 90000
      })
    });
    console.log('✅ Product updated:', updatedProduct.product.name);
    
    // 3. Test Delete operations
    console.log('\n🗑️ Testing Delete operations...');
    
    // Delete product
    console.log('Deleting product...');
    await makeRequest(`/admin/products/${productId}`, {
      method: 'DELETE'
    });
    console.log('✅ Product deleted');
    
    // Delete category
    console.log('Deleting category...');
    await makeRequest(`/admin/categories/${categoryId}`, {
      method: 'DELETE'
    });
    console.log('✅ Category deleted');
    
    console.log('\n🎉 All CRUD tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ CRUD test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCRUD(); 