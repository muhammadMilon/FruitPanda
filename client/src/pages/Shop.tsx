import React, { useState } from 'react';
import { Filter, Grid, List, Star, Truck, Heart, ShoppingCart, Info, Award, Leaf, X, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  origin: string;
  inStock: boolean;
  organic: boolean;
  description: string;
  weight: string;
  variety?: string;
  nutritionFacts: {
    calories: number;
    carbs: string;
    fiber: string;
    sugar: string;
    vitaminC: string;
    vitaminA: string;
  };
  shippingInfo: {
    deliveryTime: string;
    freeShipping: boolean;
    minOrder?: number;
  };
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
}

const products: Product[] = [
  {
    id: '1',
    name: 'Himsagar Mango',
    nameBn: 'হিমসাগর আম',
    price: 150,
    rating: 4.9,
    reviews: 324,
    image: 'https://images.pexels.com/photos/26672466/pexels-photo-26672466.jpeg',
    category: 'Seasonal',
    origin: 'Rajshahi',
    inStock: true,
    organic: true,
    variety: 'Himsagar',
    description: 'The king of mangoes! Himsagar is renowned for its exceptional sweetness, smooth texture, and rich aroma. This premium variety from Rajshahi is considered the finest mango in Bangladesh.',
    weight: '1kg',
    nutritionFacts: {
      calories: 60,
      carbs: '15g',
      fiber: '1.6g',
      sugar: '13.7g',
      vitaminC: '36.4mg',
      vitaminA: '54μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: true,
      minOrder: 1000
    },
    seller: {
      name: 'Rahman Premium Farms',
      rating: 4.9,
      verified: true,
    }
  },
  {
    id: '2',
    name: 'Amrapali Mango',
    nameBn: 'আম্রপালি আম',
    price: 120,
    rating: 4.7,
    reviews: 256,
    image: 'https://images.pexels.com/photos/2667738/pexels-photo-2667738.jpeg',
    category: 'Seasonal',
    origin: 'Chapainawabganj',
    inStock: true,
    organic: true,
    variety: 'Amrapali',
    description: 'A hybrid variety known for its consistent quality and excellent taste. Amrapali mangoes are medium-sized with a perfect balance of sweetness and slight tartness.',
    weight: '1kg',
    nutritionFacts: {
      calories: 65,
      carbs: '16g',
      fiber: '1.8g',
      sugar: '14.2g',
      vitaminC: '38mg',
      vitaminA: '58μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: true,
      minOrder: 800
    },
    seller: {
      name: 'Chapai Mango Gardens',
      rating: 4.8,
      verified: true,
    }
  },
  {
    id: '3',
    name: 'Harivanga Mango',
    nameBn: 'হাড়িভাঙ্গা আম',
    price: 140,
    rating: 4.8,
    reviews: 189,
    image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
    category: 'Seasonal',
    origin: 'Dinajpur',
    inStock: true,
    organic: true,
    variety: 'Harivanga',
    description: 'A traditional variety with distinctive green skin and incredibly sweet, juicy flesh. Harivanga is prized for its unique flavor profile and aromatic qualities.',
    weight: '1kg',
    nutritionFacts: {
      calories: 62,
      carbs: '15.5g',
      fiber: '1.7g',
      sugar: '14g',
      vitaminC: '35mg',
      vitaminA: '52μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: true,
      minOrder: 900
    },
    seller: {
      name: 'Dinajpur Heritage Orchards',
      rating: 4.7,
      verified: true,
    }
  },
  {
    id: '4',
    name: 'Lengra Mango',
    nameBn: 'লেংড়া আম',
    price: 130,
    rating: 4.6,
    reviews: 198,
    image: 'https://images.pexels.com/photos/33108108/pexels-photo-33108108.png',
    category: 'Seasonal',
    origin: 'Rajshahi',
    inStock: true,
    organic: true,
    variety: 'Lengra',
    description: 'A classic variety with a rich, sweet taste and smooth texture. Lengra mangoes are known for their consistent quality and are perfect for both eating fresh and making desserts.',
    weight: '1kg',
    nutritionFacts: {
      calories: 58,
      carbs: '14.5g',
      fiber: '1.5g',
      sugar: '13.2g',
      vitaminC: '34mg',
      vitaminA: '50μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: true,
      minOrder: 800
    },
    seller: {
      name: 'Rajshahi Mango Collective',
      rating: 4.8,
      verified: true,
    }
  },
  {
    id: '5',
    name: 'Litchi',
    nameBn: 'লিচু',
    price: 150,
    rating: 4.7,
    reviews: 189,
    image: 'https://images.pexels.com/photos/17201891/pexels-photo-17201891.jpeg',
    category: 'Seasonal',
    origin: 'Dinajpur',
    inStock: true,
    organic: true,
    description: 'Sweet and juicy litchis from Dinajpur. Perfect for summer refreshment with their delicate floral flavor and refreshing taste.',
    weight: '1kg',
    nutritionFacts: {
      calories: 66,
      carbs: '16.5g',
      fiber: '1.3g',
      sugar: '15.2g',
      vitaminC: '71.5mg',
      vitaminA: '0μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: true,
      minOrder: 1000
    },
    seller: {
      name: 'Dinajpur Fruit Garden',
      rating: 4.8,
      verified: true,
    }
  },
  {
    id: '6',
    name: 'Jackfruit',
    nameBn: 'কাঁঠাল',
    price: 300,
    rating: 4.6,
    reviews: 156,
    image: 'https://images.pexels.com/photos/12577516/pexels-photo-12577516.jpeg',
    category: 'Seasonal',
    origin: 'Mymensingh',
    inStock: true,
    organic: true,
    description: 'Large, ripe jackfruits with sweet, aromatic segments. Perfect for sharing with family and rich in nutrients.',
    weight: 'per piece',
    nutritionFacts: {
      calories: 95,
      carbs: '23g',
      fiber: '1.5g',
      sugar: '19g',
      vitaminC: '13.7mg',
      vitaminA: '5μg'
    },
    shippingInfo: {
      deliveryTime: '1-2 days nationwide',
      freeShipping: false,
      minOrder: 500
    },
    seller: {
      name: 'Green Valley Farms',
      rating: 4.7,
      verified: true,
    }
  },
  {
    id: '7',
    name: 'Pineapple',
    nameBn: 'আনারস',
    price: 90,
    rating: 4.5,
    reviews: 178,
    image: 'https://images.pexels.com/photos/2469772/pexels-photo-2469772.jpeg',
    category: 'Regular',
    origin: 'Tangail',
    inStock: true,
    organic: false,
    description: 'Sweet and tangy pineapples. Rich in vitamins and perfect for juicing or eating fresh.',
    weight: 'per piece',
    nutritionFacts: {
      calories: 50,
      carbs: '13g',
      fiber: '1.4g',
      sugar: '10g',
      vitaminC: '47.8mg',
      vitaminA: '3μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: false,
      minOrder: 300
    },
    seller: {
      name: 'Tangail Fruits',
      rating: 4.6,
      verified: true,
    }
  },
  {
    id: '8',
    name: 'Dragon Fruit',
    nameBn: 'ড্রাগন ফল',
    price: 220,
    rating: 4.7,
    reviews: 145,
    image: 'https://images.pexels.com/photos/2907428/pexels-photo-2907428.jpeg',
    category: 'Exotic',
    origin: 'Khagrachari',
    inStock: true,
    organic: true,
    description: 'Exotic dragon fruit rich in antioxidants. Sweet and refreshing taste with a unique texture.',
    weight: 'per piece',
    nutritionFacts: {
      calories: 60,
      carbs: '13g',
      fiber: '3g',
      sugar: '8g',
      vitaminC: '3mg',
      vitaminA: '0μg'
    },
    shippingInfo: {
      deliveryTime: '1-2 days nationwide',
      freeShipping: true,
      minOrder: 1200
    },
    seller: {
      name: 'Hill Orchards',
      rating: 4.8,
      verified: true,
    }
  },
  {
    id: '9',
    name: 'Banana',
    nameBn: 'কলা',
    price: 50,
    rating: 4.5,
    reviews: 200,
    image: 'https://images.pexels.com/photos/5946090/pexels-photo-5946090.jpeg',
    category: 'Regular',
    origin: 'Sylhet',
    inStock: true,
    organic: false,
    description: 'Fresh bananas from Sylhet, perfect for a quick snack or adding to smoothies.',
    weight: '1 dozen',
    nutritionFacts: {
      calories: 89,
      carbs: '23g',
      fiber: '2.6g',
      sugar: '12g',
      vitaminC: '8.7mg',
      vitaminA: '64μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: false,
      minOrder: 200
    },
    seller: {
      name: 'Sylhet Banana Farm',
      rating: 4.6,
      verified: true,
    }
  },
  {
    id: '10',
    name: 'Orange',
    nameBn: 'কমলা',
    price: 80,
    rating: 4.4,
    reviews: 170,
    image: 'https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg',
    category: 'Regular',
    origin: 'Chittagong',
    inStock: true,
    organic: false,
    description: 'Juicy oranges from Chittagong, rich in vitamin C and perfect for juicing or eating fresh.',
    weight: '1kg',
    nutritionFacts: {
      calories: 47,
      carbs: '12g',
      fiber: '2.4g',
      sugar: '9g',
      vitaminC: '53.2mg',
      vitaminA: '225μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: false,
      minOrder: 250
    },
    seller: {
      name: 'Chittagong Citrus Farm',
      rating: 4.5,
      verified: true,
    }
  },
  {
    id: '11',
    name: 'Guava',
    nameBn: 'পেয়ারা',
    price: 60,
    rating: 4.3,
    reviews: 160,
    image: 'https://images.pexels.com/photos/5945791/pexels-photo-5945791.jpeg',
    category: 'Regular',
    origin: 'Barisal',
    inStock: true,
    organic: true,
    description: 'Fresh guavas from Barisal, known for their sweet and aromatic flavor. Great for snacking or making juices.',
    weight: '1kg',
    nutritionFacts: {
      calories: 68,
      carbs: '14g',
      fiber: '5.4g',
      sugar: '8.9g',
      vitaminC: '228.3mg',
      vitaminA: '624μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: false,
      minOrder: 300
    },
    seller: {
      name: 'Barisal Fruit Growers',
      rating: 4.4,
      verified: true,
    }
  },
  {
    id: '12',
    name: 'Papaya',
    nameBn: 'পেঁপে',
    price: 70,
    rating: 4.2,
    reviews: 140,
    image: 'https://images.pexels.com/photos/5507722/pexels-photo-5507722.jpeg',
    category: 'Regular',
    origin: 'Khulna',
    inStock: true,
    organic: true,
    description: 'Sweet and ripe papayas from Khulna, perfect for salads or smoothies.',
    weight: '1kg',
    nutritionFacts: {
      calories: 59,
      carbs: '15g',
      fiber: '1.7g',
      sugar: '11.8g',
      vitaminC: '60.9mg',
      vitaminA: '950μg'
    },
    shippingInfo: {
      deliveryTime: 'Same day in Dhaka, 1-2 days nationwide',
      freeShipping: false,
      minOrder: 200
    },
    seller: {
      name: 'Khulna Tropical Farms',
      rating: 4.3,
      verified: true,
    }
  }
];

const Shop: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  
  type TabId = 'description' | 'nutrition' | 'reviews' | 'shipping';
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const { addItem: addToCart } = useCart();

  const categories = ['All', 'Seasonal', 'Regular', 'Exotic', 'Organic'];
  const mangoVarieties = ['All Mangoes', 'Himsagar', 'Amrapali', 'Harivanga', 'Lengra'];

  // Handle add to cart with success notification
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      nameBn: product.nameBn,
      price: product.price,
      quantity: 1,
      image: product.image,
      weight: product.weight
    });
    
    // Show success toast
    setAddedProductName(product.nameBn);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const toggleCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategories([]);
      return;
    }

    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filteredProducts = products
    .filter(product =>
      (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
          }`}
      />
    ));
  };

  const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
          {product.organic && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <Leaf size={16} className="mr-1" />
              Organic
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{product.nameBn}</h2>
              <p className="text-lg text-gray-600 mb-2">{product.name}</p>
              {product.variety && (
                <p className="text-sm text-green-600 mb-2">Variety: {product.variety}</p>
              )}

              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {renderStars(product.rating)}
                  <span className="ml-2 text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>
                {product.seller.verified && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Award size={16} className="mr-1" />
                    Verified Seller
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-gray-800">৳{product.price}</span>
                  <span className="text-gray-600">/{product.weight}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Truck size={16} className="mr-1" />
                  {product.origin}
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Seller Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-medium">{product.seller.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    {renderStars(product.seller.rating)}
                    <span className="ml-1 text-sm">({product.seller.rating})</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">
                    {product.seller.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description', icon: Info },
                { id: 'nutrition', label: 'Nutrition Facts', icon: Leaf },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'shipping', label: 'Shipping Info', icon: Truck }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-1">Category</h4>
                    <p className="text-gray-600">{product.category}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Nutrition Facts</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center border-b border-gray-200 pb-2 mb-4">
                    <h4 className="font-bold text-lg">Nutrition Facts</h4>
                    <p className="text-sm text-gray-600">Per 100g serving</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium">Calories</span>
                      <span>{product.nutritionFacts.calories}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium">Total Carbohydrates</span>
                      <span>{product.nutritionFacts.carbs}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2 ml-4">
                      <span>Dietary Fiber</span>
                      <span>{product.nutritionFacts.fiber}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2 ml-4">
                      <span>Sugars</span>
                      <span>{product.nutritionFacts.sugar}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium">Vitamin C</span>
                      <span>{product.nutritionFacts.vitaminC}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Vitamin A</span>
                      <span>{product.nutritionFacts.vitaminA}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Reviews</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Kamal Hassan', rating: 5, comment: 'Excellent quality mangoes! Very sweet and fresh.', date: '2 days ago' },
                    { name: 'Rahima Begum', rating: 4, comment: 'Good quality, delivered on time. Will order again.', date: '1 week ago' },
                    { name: 'Abdul Karim', rating: 5, comment: 'Best mangoes I have ever tasted. Highly recommended!', date: '2 weeks ago' }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-medium text-sm">
                              {review.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{review.name}</p>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 ml-11">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Delivery Time</h4>
                    <p className="text-gray-700">{product.shippingInfo.deliveryTime}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Shipping Cost</h4>
                    <p className="text-gray-700">
                      {product.shippingInfo.freeShipping
                        ? `Free shipping on orders above ৳${product.shippingInfo.minOrder}`
                        : 'Standard shipping rates apply'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Packaging</h4>
                    <p className="text-gray-700">
                      All fruits are carefully packed in temperature-controlled packaging to ensure freshness during transit.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Success Toast Component
  const SuccessToast = () => (
    showSuccessToast && (
      <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center animate-slide-in">
        <CheckCircle size={24} className="mr-3" />
        <div>
          <p className="font-medium">Successfully Added to Cart!</p>
          <p className="text-sm text-green-100">{addedProductName} has been added to your cart</p>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Removed Cart Button */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Fresh Fruits Shop</h1>
          <p className="text-gray-600">
            Browse our selection of fresh, seasonal fruits from verified farmers
          </p>
        </div>

        {/* Mango Varieties Showcase */}
        <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Mango Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mangoVarieties.slice(1).map((variety) => (
              <div key={variety} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">{variety.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-gray-800">{variety}</h3>
                <p className="text-sm text-gray-600">Premium Quality</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Filter size={20} />
                Filters
              </button>

              <div className="hidden md:flex items-center gap-2">
                <span className="text-gray-600">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'rating')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm ${category === 'All'
                            ? selectedCategories.length === 0
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : selectedCategories.includes(category)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                    <span className="text-gray-600">
                      ৳{priceRange[0]} - ৳{priceRange[1]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback icon when image fails */}
                    <div className="hidden w-full h-full items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {/* Fruit Panda Logo Overlay - Better positioned */}
                  <div className="absolute top-3 right-3 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <img 
                      src="/logo.png" 
                      alt="Fruit Panda" 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  {product.organic && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Leaf size={12} className="mr-1" />
                      Organic
                    </div>
                  )}
                  {product.variety && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                      {product.variety}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {product.nameBn}
                    </h3>
                    <p className="text-gray-600">{product.name}</p>
                  </div>

                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-gray-800">
                        ৳{product.price}
                      </span>
                      <span className="text-gray-600">/{product.weight}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck size={16} className="mr-1" />
                      {product.origin}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex">
                  <div className="w-48 h-48 flex-shrink-0 relative">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback icon when image fails */}
                      <div className="hidden w-full h-full items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {/* Fruit Panda Logo Overlay - Better positioned */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <img 
                        src="/logo.png" 
                        alt="Fruit Panda" 
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    {product.organic && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <Leaf size={12} className="mr-1" />
                        Organic
                      </div>
                    )}
                  </div>
                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {product.nameBn}
                        </h3>
                        <p className="text-gray-600">{product.name}</p>
                        {product.variety && (
                          <p className="text-sm text-green-600">Variety: {product.variety}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">
                          ৳{product.price}
                        </div>
                        <p className="text-gray-600">per {product.weight}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-2">{product.description}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-1">
                          {renderStars(product.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({product.reviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="flex items-center mr-4">
                            <Truck size={16} className="mr-1" />
                            {product.origin}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals and Toasts */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
        
        <SuccessToast />
      </div>

      {/* Add custom styles for the toast animation */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Shop;