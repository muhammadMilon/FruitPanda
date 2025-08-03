import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProducts = [
  {
    name: 'Premium Rajshahi Mango',
    nameBn: 'রাজশাহী আম',
    slug: 'premium-rajshahi-mango',
    description: 'Sweet and juicy mangoes from Rajshahi orchards.',
    descriptionBn: 'রাজশাহীর বিখ্যাত আম বাগান থেকে মিষ্টি ও রসালো আম।',
    category: 'Seasonal',
    price: 120,
    originalPrice: 150,
    unit: 'kg',
    weight: { value: 1, unit: 'kg' },
    images: [{ url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', alt: 'Mango', isPrimary: true }],
    inventory: { stock: 100, reserved: 0, available: 100 },
    origin: { region: 'Rajshahi', farm: 'Organic Farm' },
    nutritionFacts: { calories: 60, carbs: '15g', fiber: '1.6g', sugar: '14g', vitaminC: '36.4mg', vitaminA: '54μg', protein: '0.8g', fat: '0.4g' },
    features: { organic: true, seasonal: true, premium: false, imported: false },
    status: 'active',
    shipping: {
      freeShipping: false,
      minOrderForFreeShipping: 1000,
      deliveryTime: { min: 1, max: 3 },
      shippingCost: 60,
      availableRegions: ['Dhaka', 'Rajshahi', 'Chittagong']
    },
    ratings: { average: 4.8, count: 245 }
  },
  {
    name: 'Fresh Dhaka Banana',
    nameBn: 'তাজা ঢাকা কলা',
    slug: 'fresh-dhaka-banana',
    description: 'Fresh and sweet bananas from Dhaka region.',
    descriptionBn: 'ঢাকা অঞ্চল থেকে তাজা ও মিষ্টি কলা।',
    category: 'Regular',
    price: 80,
    originalPrice: 100,
    unit: 'dozen',
    weight: { value: 2, unit: 'kg' },
    images: [{ url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', alt: 'Banana', isPrimary: true }],
    inventory: { stock: 50, reserved: 0, available: 50 },
    origin: { region: 'Dhaka', farm: 'Green Valley Farm' },
    nutritionFacts: { calories: 89, carbs: '23g', fiber: '2.6g', sugar: '12g', vitaminC: '8.7mg', vitaminA: '3μg', protein: '1.1g', fat: '0.3g' },
    features: { organic: false, seasonal: false, premium: false, imported: false },
    status: 'active',
    shipping: {
      freeShipping: false,
      minOrderForFreeShipping: 1000,
      deliveryTime: { min: 1, max: 2 },
      shippingCost: 60,
      availableRegions: ['Dhaka', 'Rajshahi', 'Chittagong']
    },
    ratings: { average: 4.5, count: 180 }
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fruitpanda');
    console.log('✅ Connected to MongoDB');

    let seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      seller = await User.create({
        name: 'Sample Seller',
        email: 'seller@fruitpanda.com',
        password: 'seller123',
        role: 'seller',
        emailVerified: true,
        isActive: true,
        sellerInfo: {
          businessName: 'Fresh Fruits Co.',
          rating: 4.5,
          verified: true,
          location: 'Dhaka, Bangladesh'
        }
      });
    }

    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: seller._id,
      sellerInfo: {
        name: seller.name,
        rating: 4.5,
        verified: true,
        location: 'Dhaka, Bangladesh'
      }
    }));

    const createdProducts = await Product.insertMany(productsWithSeller);
    console.log(`✅ Created ${createdProducts.length} sample products`);

    console.log('\n📋 Sample Products:');
    createdProducts.forEach(product => {
      console.log(`   - ${product.name} (ID: ${product._id}) - ৳${product.price}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedProducts(); 