import React from 'react';

const TermsConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
      <div className="prose max-w-none">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Service Terms</h2>
            <p className="text-gray-600">By using our service, you agree to these terms and conditions. We reserve the right to modify these terms at any time.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">User Responsibilities</h2>
            <p className="text-gray-600">Users must provide accurate information for delivery and are responsible for maintaining the security of their account.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Limitation of Liability</h2>
            <p className="text-gray-600">While we strive to provide the best service possible, we are not liable for any damages or losses incurred through the use of our service.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;