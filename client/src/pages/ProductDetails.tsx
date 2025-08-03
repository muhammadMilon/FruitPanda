import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Truck, Shield, ArrowLeft, ArrowRight, User, ThumbsUp, ThumbsDown, Calendar, Package, Clock, MapPin } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

interface NutritionInfo {
  servingSize: string;
  calories: number;
  totalFat: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
  totalCarbs: string;
  dietaryFiber: string;
  sugars: string;
  protein: string;
  vitaminC: string;
  calcium: string;
  iron: string;
  potassium: string;
  vitaminA?: string;
  folate?: string;
  magnesium?: string;
}

interface ProductData {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  discountPrice: number;
  description: string;
  descriptionBn: string;
  detailedDescription: string;
  rating: number;
  reviews: number;
  stock: number;
  weight: string;
  origin: string;
  harvestDate: string;
  shelfLife: string;
  storageInstructions: string;
  seller: {
    name: string;
    rating: number;
    verified: boolean;
    location: string;
    yearsInBusiness: number;
    totalProducts: number;
  };
  images: string[];
  features: string[];
  nutritionFacts: NutritionInfo;
  shippingInfo: {
    freeShippingThreshold: number;
    standardDelivery: {
      time: string;
      cost: number;
      areas: string[];
    };
    expressDelivery: {
      time: string;
      cost: number;
      areas: string[];
    };
    packaging: string;
    handling: string;
  };
  reviewsData: Review[];
}

const productsDatabase: { [key: string]: ProductData } = {
  '1': {
    id: '1',
    name: 'Premium Rajshahi Mango',
    nameBn: 'রাজশাহী আম',
    price: 120,
    discountPrice: 100,
    description: 'Sweet and juicy mangoes from the renowned orchards of Rajshahi. Each fruit is carefully selected to ensure premium quality and taste.',
    descriptionBn: 'রাজশাহীর বিখ্যাত আম বাগান থেকে মিষ্টি ও রসালো আম। প্রতিটি ফল সাবধানে বাছাই করা হয় প্রিমিয়াম মান ও স্বাদ নিশ্চিত করার জন্য।',
    detailedDescription: `Our Premium Rajshahi Mangoes are sourced directly from certified organic farms in the heart of Rajshahi district. These mangoes are known for their exceptional sweetness, rich flavor, and smooth texture. Each mango is hand-picked at the perfect ripeness to ensure you receive the best quality fruit.

The mangoes are grown using traditional farming methods without harmful pesticides or chemicals. Our farmers follow sustainable practices that not only produce superior fruit but also protect the environment. The unique soil and climate conditions of Rajshahi create the perfect environment for these world-class mangoes.

These mangoes are perfect for eating fresh, making smoothies, desserts, or traditional Bengali sweets. Rich in vitamins A and C, they provide excellent nutritional value while satisfying your sweet cravings.`,
    rating: 4.8,
    reviews: 245,
    stock: 50,
    weight: '1kg',
    origin: 'Rajshahi, Bangladesh',
    harvestDate: '2025-05-15',
    shelfLife: '5-7 days at room temperature',
    storageInstructions: 'Store in a cool, dry place. Refrigerate after ripening to extend freshness.',
    seller: {
      name: 'Rahman Fruits',
      rating: 4.9,
      verified: true,
      location: 'Rajshahi, Bangladesh',
      yearsInBusiness: 15,
      totalProducts: 25
    },
    images: [
      'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
      'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg',
      'https://images.pexels.com/photos/2294478/pexels-photo-2294478.jpeg',
      'https://images.pexels.com/photos/2294472/pexels-photo-2294472.jpeg'
    ],
    features: [
      'Naturally ripened',
      'No artificial chemicals',
      'Handpicked at peak ripeness',
      'Direct from farmer',
      'Organic certified',
      'Premium quality guarantee'
    ],
    nutritionFacts: {
      servingSize: '1 medium mango (200g)',
      calories: 135,
      totalFat: '0.6g',
      saturatedFat: '0.1g',
      cholesterol: '0mg',
      sodium: '2mg',
      totalCarbs: '35g',
      dietaryFiber: '3.7g',
      sugars: '31g',
      protein: '1.1g',
      vitaminC: '122% DV',
      calcium: '2% DV',
      iron: '1% DV',
      potassium: '325mg',
      vitaminA: '25% DV',
      folate: '18% DV'
    },
    shippingInfo: {
      freeShippingThreshold: 1000,
      standardDelivery: {
        time: '2-3 business days',
        cost: 60,
        areas: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi']
      },
      expressDelivery: {
        time: '24 hours',
        cost: 120,
        areas: ['Dhaka Metro']
      },
      packaging: 'Eco-friendly packaging with protective cushioning',
      handling: 'Temperature-controlled storage and transport'
    },
    reviewsData: [
      {
        id: '1',
        userName: 'Kamal Hassan',
        rating: 5,
        date: '2025-03-10',
        comment: 'Absolutely delicious mangoes! The sweetness and flavor are exceptional. Delivered fresh and perfectly ripe. Will definitely order again.',
        verified: true,
        helpful: 12,
        images: ['https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg']
      },
      {
        id: '2',
        userName: 'Rahima Begum',
        rating: 5,
        date: '2025-03-08',
        comment: 'Best mangoes I\'ve had this season! Great quality and fast delivery. The packaging was excellent too.',
        verified: true,
        helpful: 8
      },
      {
        id: '3',
        userName: 'Abdul Karim',
        rating: 4,
        date: '2025-03-05',
        comment: 'Very good quality mangoes. Slightly expensive but worth it for the taste and freshness.',
        verified: true,
        helpful: 5
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Fresh Dinajpur Litchi',
    nameBn: 'দিনাজপুর লিচু',
    price: 150,
    discountPrice: 130,
    description: 'Sweet and juicy litchis from Dinajpur. Known for their delicate flavor and refreshing taste.',
    descriptionBn: 'দিনাজপুরের মিষ্টি ও রসালো লিচু। তাদের সূক্ষ্ম স্বাদ এবং সতেজ স্বাদের জন্য পরিচিত।',
    detailedDescription: `Our Fresh Dinajpur Litchis are harvested from the fertile lands of northern Bangladesh, where the climate and soil conditions are perfect for growing these delicate fruits. Each litchi is carefully selected for its size, sweetness, and freshness.

Litchis are known for their unique floral aroma and sweet, translucent flesh. They are rich in vitamin C and provide natural hydration, making them perfect for hot summer days. Our litchis are picked at optimal ripeness to ensure maximum flavor and nutritional value.

These litchis are perfect for eating fresh, adding to fruit salads, or making refreshing beverages. They're also excellent for desserts and can be preserved for longer enjoyment.`,
    rating: 4.7,
    reviews: 189,
    stock: 30,
    weight: '1kg',
    origin: 'Dinajpur, Bangladesh',
    harvestDate: '2025-05-20',
    shelfLife: '3-5 days at room temperature',
    storageInstructions: 'Keep in refrigerator for extended freshness. Consume within 5 days of purchase.',
    seller: {
      name: 'Dinajpur Fresh',
      rating: 4.8,
      verified: true,
      location: 'Dinajpur, Bangladesh',
      yearsInBusiness: 12,
      totalProducts: 18
    },
    images: [
      'https://images.pexels.com/photos/5945782/pexels-photo-5945782.jpeg',
      'https://images.pexels.com/photos/4113792/pexels-photo-4113792.jpeg',
      'https://images.pexels.com/photos/2469772/pexels-photo-2469772.jpeg',
      'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg'
    ],
    features: [
      'Hand-picked fresh',
      'High vitamin C content',
      'Natural hydration',
      'Pesticide-free',
      'Premium grade',
      'Short season specialty'
    ],
    nutritionFacts: {
      servingSize: '10 pieces (100g)',
      calories: 66,
      totalFat: '0.4g',
      saturatedFat: '0.1g',
      cholesterol: '0mg',
      sodium: '1mg',
      totalCarbs: '17g',
      dietaryFiber: '1.3g',
      sugars: '15g',
      protein: '0.8g',
      vitaminC: '119% DV',
      calcium: '1% DV',
      iron: '2% DV',
      potassium: '171mg',
      vitaminA: '0% DV',
      folate: '3% DV'
    },
    shippingInfo: {
      freeShippingThreshold: 1000,
      standardDelivery: {
        time: '1-2 business days',
        cost: 80,
        areas: ['Dhaka', 'Chittagong', 'Sylhet', 'Rangpur']
      },
      expressDelivery: {
        time: 'Same day',
        cost: 150,
        areas: ['Dhaka Metro']
      },
      packaging: 'Special ventilated packaging to maintain freshness',
      handling: 'Cold chain maintained throughout delivery'
    },
    reviewsData: [
      {
        id: '1',
        userName: 'Sadia Rahman',
        rating: 5,
        date: '2025-03-12',
        comment: 'Perfect litchis! Sweet, juicy and fresh. The kids loved them. Great packaging too.',
        verified: true,
        helpful: 15
      },
      {
        id: '2',
        userName: 'Mahmud Ali',
        rating: 4,
        date: '2025-03-09',
        comment: 'Good quality litchis. A bit pricey but worth it for the freshness.',
        verified: true,
        helpful: 7
      }
    ]
  },
  '3': {
    id: '3',
    name: 'Organic Jackfruit',
    nameBn: 'জৈব কাঁঠাল',
    price: 300,
    discountPrice: 280,
    description: 'Large, sweet jackfruits grown organically. Perfect for sharing with family and friends.',
    descriptionBn: 'বড়, মিষ্টি কাঁঠাল জৈবিকভাবে চাষ করা। পরিবার এবং বন্ধুদের সাথে ভাগাভাগির জন্য উপযুক্ত।',
    detailedDescription: `Our Organic Jackfruits are grown in the fertile regions of Mymensingh using completely organic farming methods. These massive fruits can weigh up to 10-15 kg and are known for their sweet, aromatic flesh and unique texture.

Jackfruit is considered a superfruit due to its high nutritional content, including vitamin C, potassium, and dietary fiber. The flesh can be eaten fresh when ripe, or used in various culinary preparations when unripe. It's also an excellent source of plant-based protein.

Each jackfruit is carefully inspected for ripeness and quality. The sweet, golden segments inside are perfect for eating fresh, making desserts, or even savory dishes. Jackfruit seeds are also edible and nutritious when cooked.`,
    rating: 4.6,
    reviews: 156,
    stock: 15,
    weight: 'per piece (8-12kg)',
    origin: 'Mymensingh, Bangladesh',
    harvestDate: '2025-05-10',
    shelfLife: '3-5 days when ripe',
    storageInstructions: 'Store at room temperature until ripe, then refrigerate segments for up to 3 days.',
    seller: {
      name: 'Green Valley Farms',
      rating: 4.7,
      verified: true,
      location: 'Mymensingh, Bangladesh',
      yearsInBusiness: 20,
      totalProducts: 30
    },
    images: [
      'https:images.pexels.com/photos/17249035/pexels-photo-17249035.jpeg',
      'https:images.pexels.com/photos/20568676/pexels-photo-20568676.jpeg'
      // 'https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg',
      // 'https://images.pexels.com/photos/4113792/pexels-photo-4113792.jpeg',
      // 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
      // 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg'
    ],
    features: [
      'Certified organic',
      'Large size (8-12kg)',
      'Sweet aromatic flesh',
      'High in fiber',
      'Sustainable farming',
      'Multiple uses'
    ],
    nutritionFacts: {
      servingSize: '1 cup sliced (165g)',
      calories: 157,
      totalFat: '1.1g',
      saturatedFat: '0.3g',
      cholesterol: '0mg',
      sodium: '3mg',
      totalCarbs: '38g',
      dietaryFiber: '2.5g',
      sugars: '31g',
      protein: '2.8g',
      vitaminC: '23% DV',
      calcium: '3% DV',
      iron: '4% DV',
      potassium: '739mg',
      vitaminA: '5% DV',
      magnesium: '15% DV'
    },
    shippingInfo: {
      freeShippingThreshold: 1000,
      standardDelivery: {
        time: '2-3 business days',
        cost: 100,
        areas: ['Dhaka', 'Chittagong', 'Sylhet', 'Mymensingh']
      },
      expressDelivery: {
        time: '24 hours',
        cost: 200,
        areas: ['Dhaka Metro']
      },
      packaging: 'Heavy-duty packaging with extra protection for large fruits',
      handling: 'Careful handling due to size and weight'
    },
    reviewsData: [
      {
        id: '1',
        userName: 'Nasir Ahmed',
        rating: 5,
        date: '2025-03-11',
        comment: 'Huge jackfruit with incredibly sweet flesh. Fed the whole family for days! Excellent quality.',
        verified: true,
        helpful: 20
      },
      {
        id: '2',
        userName: 'Fatima Khatun',
        rating: 4,
        date: '2025-03-07',
        comment: 'Good quality jackfruit. Very sweet and fresh. A bit heavy to handle but worth it.',
        verified: true,
        helpful: 12
      }
    ]
  },
  '4': {
    id: '4',
    name: 'Sweet Tangail Pineapple',
    nameBn: 'মিষ্টি টাঙ্গাইল আনারস',
    price: 90,
    discountPrice: 75,
    description: 'Sweet and tangy pineapples from Tangail. Perfect for fresh consumption and juicing.',
    descriptionBn: 'টাঙ্গাইলের মিষ্টি ও টক আনারস। তাজা খাওয়া এবং রস তৈরির জন্য উপযুক্ত।',
    detailedDescription: `Our Sweet Tangail Pineapples are grown in the ideal climate of central Bangladesh, where the combination of rainfall and sunshine creates perfectly balanced sweet and tangy flavors. Each pineapple is allowed to ripen naturally on the plant for maximum sweetness.

Pineapples are rich in vitamin C, manganese, and bromelain, an enzyme that aids digestion. They're perfect for eating fresh, making smoothies, grilling, or adding to both sweet and savory dishes. The natural enzymes in pineapple also make it an excellent meat tenderizer.

Our pineapples are harvested at optimal ripeness, ensuring they're ready to eat upon delivery. The golden flesh is juicy, sweet, and has the perfect balance of acidity that makes pineapples so refreshing.`,
    rating: 4.5,
    reviews: 178,
    stock: 40,
    weight: 'per piece (1.5-2kg)',
    origin: 'Tangail, Bangladesh',
    harvestDate: '2025-05-05',
    shelfLife: '5-7 days at room temperature',
    storageInstructions: 'Store at room temperature until fully ripe, then refrigerate for up to 5 days.',
    seller: {
      name: 'Tangail Fruits',
      rating: 4.6,
      verified: true,
      location: 'Tangail, Bangladesh',
      yearsInBusiness: 18,
      totalProducts: 22
    },
    images: [
      'https://images.pexels.com/photos/2469772/pexels-photo-2469772.jpeg',
      'https://images.pexels.com/photos/4113792/pexels-photo-4113792.jpeg',
      'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
      'https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg'
    ],
    features: [
      'Tree-ripened',
      'High vitamin C',
      'Natural enzymes',
      'Sweet and tangy',
      'Versatile use',
      'Digestive benefits'
    ],
    nutritionFacts: {
      servingSize: '1 cup chunks (165g)',
      calories: 82,
      totalFat: '0.2g',
      saturatedFat: '0.0g',
      cholesterol: '0mg',
      sodium: '2mg',
      totalCarbs: '22g',
      dietaryFiber: '2.3g',
      sugars: '16g',
      protein: '0.9g',
      vitaminC: '131% DV',
      calcium: '2% DV',
      iron: '3% DV',
      potassium: '180mg',
      vitaminA: '2% DV',
      magnesium: '5% DV'
    },
    shippingInfo: {
      freeShippingThreshold: 1000,
      standardDelivery: {
        time: '2-3 business days',
        cost: 70,
        areas: ['Dhaka', 'Chittagong', 'Sylhet', 'Tangail']
      },
      expressDelivery: {
        time: '24 hours',
        cost: 140,
        areas: ['Dhaka Metro']
      },
      packaging: 'Protective packaging to prevent bruising during transport',
      handling: 'Careful handling to maintain fruit integrity'
    },
    reviewsData: [
      {
        id: '1',
        userName: 'Ruma Akter',
        rating: 5,
        date: '2025-03-13',
        comment: 'Perfect pineapple! Sweet, juicy and perfectly ripe. Made amazing smoothies with it.',
        verified: true,
        helpful: 18
      },
      {
        id: '2',
        userName: 'Karim Uddin',
        rating: 4,
        date: '2025-03-10',
        comment: 'Good quality pineapple. Nice balance of sweet and tart. Fresh and juicy.',
        verified: true,
        helpful: 9
      }
    ]
  },
  '5': {
    id: '5',
    name: 'Rangpur Sagor Banana',
    nameBn: 'রংপুর সাগর কলা',
    price: 60,
    discountPrice: 50,
    description: 'Fresh Sagor bananas from Rangpur. Perfect ripeness for immediate consumption.',
    descriptionBn: 'রংপুরের তাজা সাগর কলা। তাৎক্ষণিক খাওয়ার জন্য নিখুঁত পাকা।',
    detailedDescription: `Our Rangpur Sagor Bananas are considered among the finest banana varieties in Bangladesh. Grown in the fertile plains of northern Bangladesh, these bananas are known for their perfect sweetness, creamy texture, and rich flavor.

Sagor bananas are smaller than regular bananas but pack more flavor and nutrition per bite. They're rich in potassium, vitamin B6, and natural sugars, making them perfect for energy and nutrition. These bananas are ideal for eating fresh, adding to cereals, making smoothies, or baking.

Each bunch is carefully selected to ensure uniform ripeness and quality. The bananas are harvested at the right stage and allowed to ripen naturally, ensuring optimal taste and nutritional value.`,
    rating: 4.4,
    reviews: 234,
    stock: 60,
    weight: '12 pieces (1.5kg)',
    origin: 'Rangpur, Bangladesh',
    harvestDate: '2025-05-18',
    shelfLife: '3-5 days at room temperature',
    storageInstructions: 'Store at room temperature. Refrigerate only when fully ripe to slow ripening.',
    seller: {
      name: 'Northern Agro',
      rating: 4.5,
      verified: true,
      location: 'Rangpur, Bangladesh',
      yearsInBusiness: 25,
      totalProducts: 35
    },
    images: [
      'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg',
      'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
      'https://images.pexels.com/photos/4113792/pexels-photo-4113792.jpeg',
      'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg'
    ],
    features: [
      'Premium Sagor variety',
      'Perfect ripeness',
      'High potassium',
      'Natural energy source',
      'Creamy texture',
      'Traditional variety'
    ],
    nutritionFacts: {
      servingSize: '1 medium banana (118g)',
      calories: 105,
      totalFat: '0.4g',
      saturatedFat: '0.1g',
      cholesterol: '0mg',
      sodium: '1mg',
      totalCarbs: '27g',
      dietaryFiber: '3.1g',
      sugars: '14g',
      protein: '1.3g',
      vitaminC: '17% DV',
      calcium: '1% DV',
      iron: '2% DV',
      potassium: '422mg',
      vitaminA: '2% DV',
      folate: '6% DV'
    },
    shippingInfo: {
      freeShippingThreshold: 1000,
      standardDelivery: {
        time: '1-2 business days',
        cost: 50,
        areas: ['Dhaka', 'Chittagong', 'Sylhet', 'Rangpur']
      },
      expressDelivery: {
        time: 'Same day',
        cost: 100,
        areas: ['Dhaka Metro']
      },
      packaging: 'Ventilated packaging to prevent over-ripening',
      handling: 'Gentle handling to prevent bruising'
    },
    reviewsData: [
      {
        id: '1',
        userName: 'Shahida Begum',
        rating: 5,
        date: '2025-03-14',
        comment: 'Best bananas I\'ve bought online! Perfect ripeness and incredibly sweet. Kids love them.',
        verified: true,
        helpful: 22
      },
      {
        id: '2',
        userName: 'Rafiq Hassan',
        rating: 4,
        date: '2025-03-11',
        comment: 'Good quality Sagor bananas. Fresh and tasty. Great for breakfast.',
        verified: true,
        helpful: 14
      }
    ]
  },
  '6': {
    id: '6',
    name: 'Exotic Dragon Fruit',
    nameBn: 'বিদেশী ড্রাগন ফল',
    price: 220,
    discountPrice: 200,
    description: 'Exotic dragon fruit rich in antioxidants. Sweet and refreshing taste with unique appearance.',
    descriptionBn: 'অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ বিদেশী ড্রাগন ফল। অনন্য চেহারা সহ মিষ্টি এবং সতেজ স্বাদ।',
    detailedDescription: `Our Exotic Dragon Fruits are grown in the hilly regions of Khagrachari, where the unique climate and soil conditions produce these stunning fruits. Dragon fruit, also known as pitaya, is not only visually striking but also packed with nutrients and antioxidants.

The flesh is mildly sweet with a texture similar to kiwi, dotted with small black seeds that add a pleasant crunch. Dragon fruit is low in calories but high in vitamin C, iron, and magnesium. It's also rich in antioxidants that help boost immunity and fight inflammation.

These exotic fruits are perfect for eating fresh, adding to fruit salads, making smoothie bowls, or as an Instagram-worthy garnish. The vibrant pink skin and white flesh with black seeds make it as beautiful as it is nutritious.`,
    rating: 4.7,
    reviews: 145,
    stock: 25,
    weight: 'per piece (300-400g)',
    origin: 'Khagrachari, Bangladesh',
    harvestDate: '2025-05-12',
    shelfLife: '5-7 days when ripe',
    storageInstructions: 'Store at room temperature until ripe, then refrigerate for up to 5 days.',
    seller: {
      name: 'Hill Orchards',
      rating: 4.8,
      verified: true,
      location: 'Khagrachari, Bangladesh',
      yearsInBusiness: 10,
      totalProducts: 15
    },
    images: [
      'https://images.pexels.com/photos/2907428/pexels-photo-2907428.jpeg',
      'https://images.pexels.com/photos/4113792/pexels-photo-4113792.jpeg',
      'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
      'https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg'
    ],
    features: [
      'Exotic variety',
      'High antioxidants',
      'Low calorie',
      'Unique appearance',
      'Rich in vitamin C',
      'Instagram-worthy'
    ],
    nutritionFacts: {
      servingSize: '1 cup cubed (227g)',
      calories: 136,
      totalFat: '0.4g',
      saturatedFat: '0.1g',
      cholesterol: '0mg',
      sodium: '0mg',
      totalCarbs: '29g',
      dietaryFiber: '7g',
      sugars: '21g',
      protein: '3g',
      vitaminC: '9% DV',
      calcium: '3% DV',
      iron: '8% DV',
      potassium: '350mg',
      vitaminA: '0% DV',
      magnesium: '18% DV'
    },
    shippingInfo: {
      freeShippingThreshold: 1000,
      standardDelivery: {
        time: '2-3 business days',
        cost: 90,
        areas: ['Dhaka', 'Chittagong', 'Sylhet']
      },
      expressDelivery: {
        time: '24 hours',
        cost: 180,
        areas: ['Dhaka Metro']
      },
      packaging: 'Special protective packaging for delicate exotic fruits',
      handling: 'Extra care during transport to prevent damage'
    },
    reviewsData: [
      {
        id: '1',
        userName: 'Nadia Islam',
        rating: 5,
        date: '2025-03-12',
        comment: 'Amazing dragon fruit! So beautiful and tasty. Perfect for smoothie bowls. Will order again!',
        verified: true,
        helpful: 25,
        images: ['https://images.pexels.com/photos/2907428/pexels-photo-2907428.jpeg']
      },
      {
        id: '2',
        userName: 'Arif Rahman',
        rating: 4,
        date: '2025-03-09',
        comment: 'First time trying dragon fruit. Unique taste and texture. Kids were fascinated by the appearance.',
        verified: true,
        helpful: 16
      }
    ]
  }
};

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews' | 'shipping'>('description');
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  const product = productsDatabase[id || '1'];

  if (!product) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handlePrevImage = () => {
    setSelectedImage(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={size}
        className={index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getFilteredReviews = () => {
    if (reviewFilter === 'all') return product.reviewsData;
    return product.reviewsData.filter(review => review.rating === parseInt(reviewFilter));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    product.reviewsData.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const filteredReviews = getFilteredReviews();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Product Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.nameBn}</h1>
            <p className="text-xl text-gray-600 mb-4">{product.name}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(product.rating, 20)}
              </div>
              <span className="ml-2 text-gray-600">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">৳{product.discountPrice}</span>
                {product.price > product.discountPrice && (
                  <span className="text-xl text-gray-500 line-through">৳{product.price}</span>
                )}
                <span className="text-green-600 text-sm font-medium">
                  {Math.round((1 - product.discountPrice/product.price) * 100)}% OFF
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Price per {product.weight}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center border rounded-lg py-2"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  {product.stock} pieces available
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                Add to Cart
              </button>
              <button className="w-full bg-white border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition-colors">
                Buy Now
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="text-gray-600" size={24} />
                <div>
                  <p className="font-medium text-gray-800">Free Delivery</p>
                  <p className="text-sm text-gray-600">For orders over ৳1000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-gray-600" size={24} />
                <div>
                  <p className="font-medium text-gray-800">Quality Guarantee</p>
                  <p className="text-sm text-gray-600">100% money back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-12">
          <div className="border-b">
            <nav className="flex gap-8 px-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'nutrition', label: 'Nutrition Facts' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'shipping', label: 'Shipping Info' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'description' | 'nutrition' | 'reviews' | 'shipping')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 text-xl">Product Description</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{product.descriptionBn}</p>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-green-800 mb-2">Detailed Information</h4>
                      <p className="text-green-700 text-sm leading-relaxed">{product.detailedDescription}</p>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-3">Key Features:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 text-xl">Product Details</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Origin</span>
                      <span className="font-medium">{product.origin}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Harvest Date</span>
                      <span className="font-medium">{new Date(product.harvestDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Shelf Life</span>
                      <span className="font-medium">{product.shelfLife}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Weight</span>
                      <span className="font-medium">{product.weight}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-600 block mb-2">Storage Instructions:</span>
                      <p className="text-sm text-gray-700">{product.storageInstructions}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Facts Tab */}
            {activeTab === 'nutrition' && (
              <div className="max-w-4xl mx-auto">
                <h3 className="font-semibold text-gray-800 mb-6 text-xl text-center">Nutrition Information</h3>
                <div className="bg-white border-2 border-gray-800 rounded-lg p-6 max-w-md mx-auto">
                  <div className="text-center border-b-8 border-gray-800 pb-2 mb-4">
                    <h4 className="text-2xl font-bold">Nutrition Facts</h4>
                    <p className="text-sm">Serving Size: {product.nutritionFacts.servingSize}</p>
                  </div>
                  
                  <div className="border-b-4 border-gray-800 pb-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Calories</span>
                      <span className="text-xl font-bold">{product.nutritionFacts.calories}</span>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm font-bold mb-2">% Daily Value*</div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                      <span><strong>Total Fat</strong> {product.nutritionFacts.totalFat}</span>
                      <span><strong>1%</strong></span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1 pl-4">
                      <span>Saturated Fat {product.nutritionFacts.saturatedFat}</span>
                      <span><strong>1%</strong></span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                      <span><strong>Cholesterol</strong> {product.nutritionFacts.cholesterol}</span>
                      <span><strong>0%</strong></span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                      <span><strong>Sodium</strong> {product.nutritionFacts.sodium}</span>
                      <span><strong>0%</strong></span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                      <span><strong>Total Carbohydrate</strong> {product.nutritionFacts.totalCarbs}</span>
                      <span><strong>13%</strong></span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1 pl-4">
                      <span>Dietary Fiber {product.nutritionFacts.dietaryFiber}</span>
                      <span><strong>13%</strong></span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300 pb-1 pl-4">
                      <span>Total Sugars {product.nutritionFacts.sugars}</span>
                      <span></span>
                    </div>
                    <div className="flex justify-between border-b-4 border-gray-800 pb-2">
                      <span><strong>Protein</strong> {product.nutritionFacts.protein}</span>
                      <span><strong>2%</strong></span>
                    </div>
                    
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Vitamin C</span>
                        <span>{product.nutritionFacts.vitaminC}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calcium</span>
                        <span>{product.nutritionFacts.calcium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Iron</span>
                        <span>{product.nutritionFacts.iron}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potassium</span>
                        <span>{product.nutritionFacts.potassium}</span>
                      </div>
                      {product.nutritionFacts.vitaminA && (
                        <div className="flex justify-between">
                          <span>Vitamin A</span>
                          <span>{product.nutritionFacts.vitaminA}</span>
                        </div>
                      )}
                      {product.nutritionFacts.folate && (
                        <div className="flex justify-between">
                          <span>Folate</span>
                          <span>{product.nutritionFacts.folate}</span>
                        </div>
                      )}
                      {product.nutritionFacts.magnesium && (
                        <div className="flex justify-between">
                          <span>Magnesium</span>
                          <span>{product.nutritionFacts.magnesium}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-gray-300 text-xs">
                    <p>* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-green-800 mb-2">Rich in Vitamin C</h4>
                    <p className="text-green-700 text-sm">Boosts immune system and promotes healthy skin</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-orange-800 mb-2">High in Fiber</h4>
                    <p className="text-orange-700 text-sm">Supports digestive health and helps maintain blood sugar</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-blue-800 mb-2">Natural Antioxidants</h4>
                    <p className="text-blue-700 text-sm">Protects cells from damage and supports overall health</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Customer Reviews</h3>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-gray-800 mb-2">{product.rating}</div>
                        <div className="flex justify-center mb-2">
                          {renderStars(product.rating, 20)}
                        </div>
                        <p className="text-gray-600">Based on {product.reviews} reviews</p>
                      </div>
                      
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center">
                            <span className="text-sm w-8">{rating}</span>
                            <Star size={16} className="text-yellow-400 fill-current mr-2" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / product.reviewsData.length) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {ratingDistribution[rating as keyof typeof ratingDistribution]}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by rating:</label>
                        <select
                          value={reviewFilter}
                          onChange={(e) => setReviewFilter(e.target.value as 'all' | '5' | '4' | '3' | '2' | '1')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="all">All Reviews</option>
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reviews List */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {filteredReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <User size={20} className="text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-800 mr-2">{review.userName}</h4>
                                  {review.verified && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center mt-1">
                                  {renderStars(review.rating)}
                                  <span className="ml-2 text-sm text-gray-500">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                          
                          {review.images && (
                            <div className="flex gap-2 mb-4">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button className="flex items-center text-gray-500 hover:text-green-600 transition-colors">
                                <ThumbsUp size={16} className="mr-1" />
                                Helpful ({review.helpful})
                              </button>
                              <button className="flex items-center text-gray-500 hover:text-red-600 transition-colors">
                                <ThumbsDown size={16} className="mr-1" />
                                Not Helpful
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredReviews.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No reviews found for the selected rating.</p>
                      </div>
                    )}
                    
                    <div className="mt-8 text-center">
                      <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Write a Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Info Tab */}
            {activeTab === 'shipping' && (
              <div className="max-w-4xl mx-auto">
                <h3 className="font-semibold text-gray-800 mb-6 text-xl">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Delivery Options */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Truck className="mr-2" size={20} />
                      Delivery Options
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-800">Standard Delivery</h5>
                          <span className="text-green-600 font-medium">৳{product.shippingInfo.standardDelivery.cost}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <Clock size={16} className="inline mr-1" />
                          {product.shippingInfo.standardDelivery.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <MapPin size={16} className="inline mr-1" />
                          Available in: {product.shippingInfo.standardDelivery.areas.join(', ')}
                        </p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-800">Express Delivery</h5>
                          <span className="text-green-600 font-medium">৳{product.shippingInfo.expressDelivery.cost}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <Clock size={16} className="inline mr-1" />
                          {product.shippingInfo.expressDelivery.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <MapPin size={16} className="inline mr-1" />
                          Available in: {product.shippingInfo.expressDelivery.areas.join(', ')}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-medium text-green-800 mb-1">Free Shipping</h5>
                        <p className="text-sm text-green-700">
                          Orders over ৳{product.shippingInfo.freeShippingThreshold} qualify for free standard delivery
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Packaging & Handling */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Package className="mr-2" size={20} />
                      Packaging & Handling
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Packaging</h5>
                        <p className="text-sm text-gray-600">{product.shippingInfo.packaging}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Handling</h5>
                        <p className="text-sm text-gray-600">{product.shippingInfo.handling}</p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-medium text-blue-800 mb-1">Quality Assurance</h5>
                        <p className="text-sm text-blue-700">
                          All fruits are inspected before packaging to ensure you receive the highest quality products.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Timeline */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Shipping Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package size={24} className="text-green-600" />
                      </div>
                      <h5 className="font-medium text-gray-800 mb-1">Order Placed</h5>
                      <p className="text-sm text-gray-600">Order confirmation sent</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar size={24} className="text-blue-600" />
                      </div>
                      <h5 className="font-medium text-gray-800 mb-1">Processing</h5>
                      <p className="text-sm text-gray-600">Fruits selected & packed</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Truck size={24} className="text-purple-600" />
                      </div>
                      <h5 className="font-medium text-gray-800 mb-1">Shipped</h5>
                      <p className="text-sm text-gray-600">On the way to you</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield size={24} className="text-green-600" />
                      </div>
                      <h5 className="font-medium text-gray-800 mb-1">Delivered</h5>
                      <p className="text-sm text-gray-600">Enjoy your fresh fruits!</p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">Important Notes</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Delivery times may vary during peak seasons</li>
                      <li>• We'll contact you if any delivery issues arise</li>
                      <li>• Signature required for orders over ৳2000</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2">Customer Support</h5>
                    <p className="text-sm text-green-700 mb-2">
                      Need help with your order? Contact us:
                    </p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Phone: +880 1234-567890</li>
                      <li>• Email: support@fruitpanda.com</li>
                      <li>• Live Chat: Available 9 AM - 9 PM</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seller Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{product.seller.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{product.seller.rating}</span>
                </div>
                {product.seller.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Seller
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{product.seller.location}</p>
                <p>{product.seller.yearsInBusiness} years in business</p>
                <p>{product.seller.totalProducts} products available</p>
              </div>
            </div>
            <button className="bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
              View Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;