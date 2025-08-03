import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddProductForm from '../components/seller/AddProductForm';

const AddProduct: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/seller-dashboard"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-600 mt-2">Add a new product to your inventory</p>
        </div>

        {/* Add Product Form */}
        <AddProductForm />
      </div>
    </div>
  );
};

export default AddProduct; 