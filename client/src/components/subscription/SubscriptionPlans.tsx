import React from 'react';
import { Check, X } from 'lucide-react';

interface PlanFeature {
  title: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  interval: 'weekly' | 'biweekly' | 'monthly';
  description: string;
  features: PlanFeature[];
  popular: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'weekly-essentials',
    name: 'Weekly Essentials',
    nameBn: 'সাপ্তাহিক অপরিহার্য',
    price: 499,
    interval: 'weekly',
    description: 'Perfect for small families looking for a regular supply of essential fruits',
    features: [
      { title: '3-4 varieties of seasonal fruits', included: true },
      { title: 'Up to 2kg total weight', included: true },
      { title: 'Free delivery', included: true },
      { title: 'Fruit quality guarantee', included: true },
      { title: 'Customize selections', included: false },
      { title: 'Premium exotic fruits', included: false },
    ],
    popular: false,
  },
  {
    id: 'family-basket',
    name: 'Family Basket',
    nameBn: 'পারিবারিক ঝুড়ি',
    price: 899,
    interval: 'weekly',
    description: 'Our most popular plan for families who love variety and premium quality',
    features: [
      { title: '5-6 varieties of seasonal fruits', included: true },
      { title: 'Up to 4kg total weight', included: true },
      { title: 'Free delivery', included: true },
      { title: 'Fruit quality guarantee', included: true },
      { title: 'Customize selections', included: true },
      { title: 'Premium exotic fruits', included: false },
    ],
    popular: true,
  },
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    nameBn: 'প্রিমিয়াম মাসিক',
    price: 2499,
    interval: 'monthly',
    description: 'Luxury selection of premium local and imported fruits delivered monthly',
    features: [
      { title: '7-8 varieties of seasonal fruits', included: true },
      { title: 'Up to 6kg total weight', included: true },
      { title: 'Free priority delivery', included: true },
      { title: 'Fruit quality guarantee', included: true },
      { title: 'Customize selections', included: true },
      { title: 'Premium exotic fruits', included: true },
    ],
    popular: false,
  },
];

const SubscriptionPlans: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Fruit Subscription Plans</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enjoy fresh seasonal fruits delivered directly to your doorstep on a regular schedule.
          Choose the plan that best fits your household needs.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border ${
              plan.popular 
                ? 'border-green-500 shadow-lg transform hover:-translate-y-1' 
                : 'border-gray-200 shadow-md'
            }`}
          >
            {plan.popular && (
              <div className="bg-green-500 text-white text-center py-2 font-medium text-sm">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
                <p className="text-gray-600">{plan.nameBn}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">৳{plan.price}</span>
                  <span className="ml-1 text-gray-500">/{plan.interval}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.included ? (
                      <Check size={18} className="text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.title}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-2 rounded-lg transition-colors ${
                  plan.popular 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white border border-green-500 text-green-500 hover:bg-green-50'
                }`}
              >
                Subscribe Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-green-50 rounded-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How Our Subscriptions Work</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <span className="text-green-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Choose Your Plan</h4>
            <p className="text-sm text-gray-600">Select the subscription that fits your household's fruit consumption</p>
          </div>
          
          <div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Customize (Optional)</h4>
            <p className="text-sm text-gray-600">Tailor your fruit selection or let us surprise you with seasonal picks</p>
          </div>
          
          <div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Regular Delivery</h4>
            <p className="text-sm text-gray-600">Enjoy fresh fruits delivered to your doorstep on schedule</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Pause, modify, or cancel your subscription anytime. No long-term commitment required.
          </p>
          <a href="#" className="text-green-600 font-medium hover:underline text-sm">
            View Subscription FAQ
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;