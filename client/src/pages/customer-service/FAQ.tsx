import React from 'react';

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What types of fruits do you offer?</h2>
          <p className="text-gray-600">We offer a wide variety of fresh, seasonal fruits sourced directly from local farmers and trusted suppliers.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How do you ensure fruit quality?</h2>
          <p className="text-gray-600">Each piece of fruit is carefully inspected for quality and freshness before being made available for purchase.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What is your delivery area?</h2>
          <p className="text-gray-600">We currently deliver to most major cities and surrounding areas. Enter your zip code at checkout to confirm delivery availability.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;