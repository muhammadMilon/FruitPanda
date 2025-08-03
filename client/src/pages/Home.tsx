import React from 'react';
import { Link } from 'react-router-dom';
import { Citrus as Fruit, TrendingUp, Truck, ShieldCheck, Store, Users, Award } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-green-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Fresh Seasonal Fruits
                <br />
                <span className="text-green-600">Delivered to Your Door</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Connect directly with verified farmers and get the freshest seasonal fruits delivered to your home. Experience the taste of nature's best offerings.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Shop Now
                </Link>
                <Link
                  to="/seller-registration"
                  className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors border border-green-600"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg"
                alt="Fresh Fruits"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Daily Fresh</p>
                    <p className="font-semibold">100+ Varieties</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Fruit className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Farmers</h3>
              <p className="text-gray-600">
                All our farmers are carefully verified to ensure the highest quality fruits.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Truck className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Same-day delivery in Dhaka, next-day delivery nationwide.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">
                100% satisfaction guaranteed or your money back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seller CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-4">Join Our Marketplace</h2>
              <p className="text-green-100 mb-6">
                Are you a farmer, wholesaler, or fruit seller? Join thousands of sellers who are already earning through our platform.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-green-100 text-sm">Active Sellers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-green-100 text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-green-100 text-sm">Seller Satisfaction</div>
                </div>
              </div>
              <Link
                to="/seller-registration"
                className="inline-flex items-center bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <Store className="mr-2" size={20} />
                Start Selling Today
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <Users className="text-white mb-2" size={24} />
                <h4 className="text-white font-medium mb-1">Direct Customer Access</h4>
                <p className="text-green-100 text-sm">Reach customers directly without middlemen</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <Award className="text-white mb-2" size={24} />
                <h4 className="text-white font-medium mb-1">Fair Pricing</h4>
                <p className="text-green-100 text-sm">Get fair prices for your quality produce</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <Truck className="text-white mb-2" size={24} />
                <h4 className="text-white font-medium mb-1">Logistics Support</h4>
                <p className="text-green-100 text-sm">We handle delivery and logistics for you</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <ShieldCheck className="text-white mb-2" size={24} />
                <h4 className="text-white font-medium mb-1">Secure Payments</h4>
                <p className="text-green-100 text-sm">Guaranteed payments within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Fruits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Seasonal Favorites</h2>
            <p className="text-gray-600">
              Discover what's fresh and in season right now
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'Mango',
                nameBn: 'আম',
                image: 'https://images.pexels.com/photos/33108108/pexels-photo-33108108.png',
                price: 120
              },
              {
                name: 'Litchi',
                nameBn: 'লিচু',
                image: 'https://images.pexels.com/photos/28939333/pexels-photo-28939333.jpeg',
                price: 150
              },
              {
                name: 'Jackfruit',
                nameBn: 'কাঁঠাল',
                image: 'https://images.pexels.com/photos/8678933/pexels-photo-8678933.jpeg',
                price: 300
              },
              {
                name: 'Pineapple',
                nameBn: 'আনারস',
                image: 'https://images.pexels.com/photos/2469772/pexels-photo-2469772.jpeg',
                price: 90
              }
            ].map((fruit, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img
                  src={fruit.image}
                  alt={fruit.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{fruit.nameBn}</h3>
                  <p className="text-gray-600 mb-2">{fruit.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-semibold">৳{fruit.price}/kg</span>
                    <Link
                      to={`/shop`}
                      className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      View More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Shopping Fresh Today</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Fruit Panda for their fresh fruit needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/seller-registration"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-green-600 transition-colors"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;