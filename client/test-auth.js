// Test authentication and order creation
const testAuthAndOrder = async () => {
  try {
    console.log('Testing authentication...');
    
    // Test login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@fruitpanda.com',
        password: 'admin123'
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful, user:', loginData.user.name);
    console.log('Token received:', loginData.token ? 'Yes' : 'No');

    // Test order creation
    const orderData = {
      items: [
        {
          product: 'test-product-id',
          productInfo: {
            name: 'Test Product',
            nameBn: 'টেস্ট প্রোডাক্ট',
            image: 'test-image.jpg',
            seller: 'test-seller'
          },
          quantity: 2,
          price: 100,
          weight: '1kg',
          subtotal: 200
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        area: 'Test Area',
        instructions: 'Test instructions'
      },
      payment: {
        method: 'cod',
        status: 'pending'
      }
    };

    console.log('Sending order creation request...');
    console.log('Order data:', JSON.stringify(orderData, null, 2));
    
    const orderResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(orderData)
    });

    console.log('Order response status:', orderResponse.status);
    console.log('Order response headers:', orderResponse.headers);
    
    const responseText = await orderResponse.text();
    console.log('Order response body:', responseText);
    
    if (!orderResponse.ok) {
      console.error('Order creation failed');
      return;
    }

    const orderResult = JSON.parse(responseText);
    console.log('Order created successfully:', orderResult);

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAuthAndOrder(); 