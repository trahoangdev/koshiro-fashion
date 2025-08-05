import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testApiEndpoints() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test products endpoint
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=10`);
    console.log('✅ Products:', productsResponse.data.products?.length || 0, 'products found');

    // Test categories endpoint
    console.log('\n3. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ Categories:', categoriesResponse.data.categories?.length || 0, 'categories found');

    // Test admin stats (without auth for now)
    console.log('\n4. Testing admin stats endpoint...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`);
      console.log('✅ Admin stats:', statsResponse.data);
    } catch (error: any) {
      console.log('❌ Admin stats (expected - requires auth):', error.response?.status, error.response?.data?.message);
    }

    // Test admin products (without auth for now)
    console.log('\n5. Testing admin products endpoint...');
    try {
      const adminProductsResponse = await axios.get(`${API_BASE_URL}/admin/products`);
      console.log('✅ Admin products:', adminProductsResponse.data.data?.length || 0, 'products found');
    } catch (error: any) {
      console.log('❌ Admin products (expected - requires auth):', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error: any) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testApiEndpoints(); 