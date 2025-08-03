import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Information Collection</h2>
            <p className="text-gray-600">We collect only necessary information to process your orders and improve your shopping experience. This includes contact details and delivery preferences.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Protection</h2>
            <p className="text-gray-600">Your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
            <p className="text-gray-600">You have the right to access, modify, or delete your personal information at any time. Contact our support team for assistance.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;