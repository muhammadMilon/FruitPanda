import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import AIAssistant from '../ai/AIAssistant';
import logo from '../../logo.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Handle scroll effect and mobile menu
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Check if link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`bg-white shadow-md fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Moved more to the left */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group ml-0">
              <div className="flex items-center justify-center h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover:rotate-12 overflow-hidden cursor-pointer">
                <img 
                  src={logo} 
                  alt="Fruit Panda Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="flex items-center space-x-6 max-sm:hidden flex-1 justify-center">
              <Link 
                to="/shop" 
                className={`transition-colors duration-200 font-medium px-2 py-1 ${
                  isActiveLink('/shop') 
                    ? 'text-green-600 font-bold border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Shop
              </Link>
              <Link 
                to="/blog" 
                className={`transition-colors duration-200 font-medium px-2 py-1 ${
                  isActiveLink('/blog') 
                    ? 'text-green-600 font-bold border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Blog
              </Link>
              <Link 
                to="/seasonal-forecast" 
                className={`transition-colors duration-200 font-medium px-2 py-1 ${
                  isActiveLink('/seasonal-forecast') 
                    ? 'text-green-600 font-bold border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Seasonal
              </Link>
              <Link 
                to="/contact" 
                className={`transition-colors duration-200 font-medium px-2 py-1 ${
                  isActiveLink('/contact') 
                    ? 'text-green-600 font-bold border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Contact
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors duration-200 font-medium px-2 py-1 ${
                  isActiveLink('/about') 
                    ? 'text-green-600 font-bold border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                About
              </Link>
            </div>

            {/* Desktop Right Section - Moved more to the right */}
            <div className="flex items-center space-x-6 max-sm:hidden ml-auto mr-0">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 group">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Cart
                </span>
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-green-600 transition-colors duration-200">
                    <User className="h-6 w-6" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    {user.role === 'seller' && (
                      <Link
                        to="/seller-dashboard"
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Seller Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Right Section (Cart and Menu Button) */}
            <div className="flex items-center space-x-2 max-sm:flex sm:hidden">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors duration-200">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Link>
              
              <button
                className="menu-button p-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu max-sm:block sm:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="py-4 border-t border-gray-200 space-y-1">
              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/shop"
                  className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/blog"
                  className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  to="/seasonal-forecast"
                  className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Seasonal Forecast
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </div>

              {/* User Section */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    
                    {user.role === 'seller' && (
                      <Link
                        to="/seller-dashboard"
                        className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Seller Dashboard
                      </Link>
                    )}
                    
                    {user.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Link
                      to="/login"
                      className="block w-full text-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* AI Assistant Component */}
      <AIAssistant show={showAIAssistant} onClose={() => setShowAIAssistant(false)} />

      {/* Floating AI Assistant Button (Alternative access point) */}
      {!showAIAssistant && (
        <button
          onClick={() => setShowAIAssistant(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
          title="AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {/* Removed blinking animation */}
          
          {/* Tooltip */}
          <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with AI
          </span>
        </button>
      )}
    </>
  );
};

export default Navbar;