import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
      <div className="prose max-w-none">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Delivery Times</h2>
            <p className="text-gray-600">We process orders within 24 hours and deliver within 2-3 business days to ensure maximum freshness.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Shipping Methods</h2>
            <p className="text-gray-600">We use temperature-controlled vehicles and specialized packaging to maintain fruit quality during transit.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Shipping Costs</h2>
            <p className="text-gray-600">Free shipping on orders over ৳1000. Standard shipping rates apply for orders under ৳1000.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;