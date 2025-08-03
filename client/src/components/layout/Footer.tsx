import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '../../logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover:rotate-12 overflow-hidden cursor-pointer">
                <img 
                  src={logo} 
                  alt="Fruit Panda Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white">Fruit Panda</span>
            </Link>
            <p className="text-sm">
              Connecting farmers directly to fruit lovers across Bangladesh.
              Fresh, seasonal fruits delivered to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="hover:text-green-500 transition-colors">Shop</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-500 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/seasonal-forecast" className="hover:text-green-500 transition-colors">Seasonal Forecast</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="hover:text-green-500 transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-green-500 transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-green-500 transition-colors">Return Policy</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-green-500 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-green-500 transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>Email: support@fruitpanda.com</li>
              <li>Phone: +880 1234-567890</li>
              <li>Address: Dhaka, Bangladesh</li>
            </ul>
            <Link
              to="/seller-registration"
              className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Become a Seller
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Fruit Panda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;