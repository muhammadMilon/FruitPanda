import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import Shop from './pages/Shop';
import Blog from './pages/Blog';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetails from './pages/ProductDetails';
import UserProfile from './pages/UserProfile';
import AuthCallback from './pages/AuthCallback';
import SellerDashboard from './pages/SellerDashboard';
import SellerRegistration from './pages/SellerRegistration';
import SellerApplicationSuccess from './pages/SellerApplicationSuccess';
import AddProduct from './pages/AddProduct';
import SeasonalForecast from './pages/SeasonalForecast';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogManagement from './pages/admin/AdminBlogManagement';
import FAQ from './pages/customer-service/FAQ';
import ReturnPolicy from './pages/customer-service/ReturnPolicy';
import PrivacyPolicy from './pages/customer-service/PrivacyPolicy';
import ShippingPolicy from './pages/customer-service/ShippingPolicy';
import TermsConditions from './pages/customer-service/TermsConditions';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/seller-dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
                <Route path="/seller/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                <Route path="/seller-registration" element={<SellerRegistration />} />
                <Route path="/seller-application-success" element={<SellerApplicationSuccess />} />
                <Route path="/become-seller" element={<SellerRegistration />} />
                <Route path="/seasonal-forecast" element={<SeasonalForecast />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/blog" element={<ProtectedRoute><AdminBlogManagement /></ProtectedRoute>} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;