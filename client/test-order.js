// Simple test script to test order creation
const testOrderCreation = async () => {
  try {
    // First, let's try to login to get a token
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

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful, token received');

    // Now test order creation
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
    const orderResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(orderData)
    });

    console.log('Response status:', orderResponse.status);
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Order creation failed:', errorData);
      return;
    }

    const orderResult = await orderResponse.json();
    console.log('Order created successfully:', orderResult);

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testOrderCreation(); 