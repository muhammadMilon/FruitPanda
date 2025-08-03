import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Mail, Phone, ArrowRight, Home } from 'lucide-react';

const SellerApplicationSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Application Submitted Successfully!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your interest in becoming a seller on Fruit Panda. 
              We've received your application and will review it carefully.
            </p>
            
            {/* Application Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">Application ID</p>
                  <p className="font-medium text-gray-800">APP-{Date.now().toString().slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted On</p>
                  <p className="font-medium text-gray-800">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Review Time</p>
                  <p className="font-medium text-gray-800">2-3 Business Days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    <Clock size={16} className="mr-1" />
                    Under Review
                  </span>
                </div>
              </div>
            </div>
            
            {/* What's Next */}
            <div className="text-left mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What Happens Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Document Verification</h3>
                    <p className="text-gray-600 text-sm">Our team will verify all submitted documents and information.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Background Check</h3>
                    <p className="text-gray-600 text-sm">We'll conduct a background check to ensure platform safety.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Approval Notification</h3>
                    <p className="text-gray-600 text-sm">You'll receive an email with the decision and next steps.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-green-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Onboarding & Training</h3>
                    <p className="text-gray-600 text-sm">Once approved, we'll help you set up your seller account and provide training.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Email Support</p>
                    <p className="font-medium text-gray-800">sellers@fruitpanda.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Support</p>
                    <p className="font-medium text-gray-800">+880 1234-567890</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Our seller support team is available Monday to Friday, 9 AM to 6 PM.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Home size={20} className="mr-2" />
                Back to Home
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                Browse Products
                <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">While You Wait...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Prepare Your Products</h3>
                <p className="text-gray-600 text-sm">
                  Start thinking about what fruits you'd like to sell and gather high-quality photos of your products.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Learn Best Practices</h3>
                <p className="text-gray-600 text-sm">
                  Check out our seller guidelines and best practices to maximize your success on the platform.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Set Up Your Workspace</h3>
                <p className="text-gray-600 text-sm">
                  Organize your inventory and prepare your packaging materials for efficient order fulfillment.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Join Our Community</h3>
                <p className="text-gray-600 text-sm">
                  Connect with other sellers in our community forum to share tips and experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationSuccess;