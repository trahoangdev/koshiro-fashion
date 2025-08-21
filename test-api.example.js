const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🔍 Testing API endpoints...\n');

    // First, login as admin to get token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com', // Use example email
        password: 'example-password' // Use example password
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Test notifications with auth
    console.log('\n📧 Testing notifications...');
    const notificationsResponse = await fetch(`${API_BASE_URL}/notifications?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const notificationsData = await notificationsResponse.json();
    console.log(`  - Total notifications: ${notificationsData.pagination?.total || 0}`);
    console.log(`  - Unread notifications: ${notificationsData.unreadCount || 0}`);
    console.log(`  - Response structure:`, Object.keys(notificationsData));

    // Test orders with auth
    console.log('\n📦 Testing orders...');
    const ordersResponse = await fetch(`${API_BASE_URL}/admin/orders?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const ordersData = await ordersResponse.json();
    console.log(`  - Total orders: ${ordersData.pagination?.total || 0}`);
    console.log(`  - Orders returned: ${ordersData.data?.length || 0}`);
    console.log(`  - Response structure:`, Object.keys(ordersData));

    // Test admin stats with auth
    console.log('\n📊 Testing admin stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const statsData = await statsResponse.json();
    console.log(`  - Total orders: ${statsData.totalOrders || 0}`);
    console.log(`  - Total products: ${statsData.totalProducts || 0}`);
    console.log(`  - Total users: ${statsData.totalUsers || 0}`);
    console.log(`  - Total revenue: ${statsData.totalRevenue || 0}`);

    console.log('\n✅ API testing completed!');
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Instructions for use:
console.log(`
📋 Instructions:
1. Copy this file to test-api.js
2. Update the email and password with real credentials
3. Run: node test-api.js
4. Delete test-api.js after testing (it contains credentials)
`);

// Uncomment the line below to run the test
// testAPI();
