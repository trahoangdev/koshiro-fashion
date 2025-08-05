import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuthentication() {
  try {
    console.log('🧪 Testing Authentication...\n');

    // Test login
    console.log('1. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'customer1@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    const token = loginResponse.data.token;

    // Test protected endpoints with token
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n2. Testing wishlist endpoint with auth...');
    const wishlistResponse = await axios.get(`${API_BASE_URL}/wishlist`, { headers: authHeaders });
    console.log('✅ Wishlist:', wishlistResponse.data.length || 0, 'items found');

    console.log('\n3. Testing cart endpoint with auth...');
    const cartResponse = await axios.get(`${API_BASE_URL}/cart`, { headers: authHeaders });
    console.log('✅ Cart:', cartResponse.data.items?.length || 0, 'items found');

    console.log('\n4. Testing user orders with auth...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers: authHeaders });
    console.log('✅ Orders:', ordersResponse.data.data?.length || 0, 'orders found');

    console.log('\n5. Testing profile with auth...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: authHeaders });
    console.log('✅ Profile:', profileResponse.data.user.name);

    console.log('\n🎉 Authentication testing completed successfully!');

  } catch (error: any) {
    console.error('❌ Error testing authentication:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAuthentication(); 