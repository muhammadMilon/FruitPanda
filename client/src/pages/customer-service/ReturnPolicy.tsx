import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Return Policy</h1>
      <div className="prose max-w-none">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Quality Guarantee</h2>
            <p className="text-gray-600">If you're not satisfied with the quality of your fruits, contact us within 24 hours of delivery for a full refund or replacement.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Return Process</h2>
            <p className="text-gray-600">Simply contact our customer service team with your order number and photos of the received items. We'll process your return immediately.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Refund Timeline</h2>
            <p className="text-gray-600">Refunds are processed within 1-2 business days of approval. The amount will be credited back to your original payment method.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;