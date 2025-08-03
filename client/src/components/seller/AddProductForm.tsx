import React, { useState } from 'react';
import { Package, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ProductFormData {
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  originalPrice?: number;
  category: string;
  unit: string;
  weight: {
    value: number;
    unit: string;
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  inventory: {
    stock: number;
  };
  origin: {
    region: string;
    farm?: string;
  };
  features: {
    organic: boolean;
    seasonal: boolean;
    imported: boolean;
    premium: boolean;
  };
}

const AddProductForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    nameBn: '',
    description: '',
    descriptionBn: '',
    price: 0,
    originalPrice: 0,
    category: 'Seasonal',
    unit: 'kg',
    weight: {
      value: 1,
      unit: 'kg'
    },
    images: [{
      url: '',
      alt: '',
      isPrimary: true
    }],
    inventory: {
      stock: 1
    },
    origin: {
      region: '',
      farm: ''
    },
    features: {
      organic: false,
      seasonal: false,
      imported: false,
      premium: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Seasonal', 'Regular', 'Exotic', 'Organic', 'Imported'];
  const units = ['kg', 'piece', 'dozen', 'gram', 'liter'];
  const weightUnits = ['kg', 'g'];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFeatureChange = (feature: keyof ProductFormData['features']) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.nameBn || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.origin.region) {
      toast.error('Please enter the product origin region');
      return;
    }

    if (formData.inventory.stock <= 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure all required fields are present
      const productData = {
        ...formData,
        // Ensure images array has at least one image
        images: formData.images.length > 0 ? formData.images : [{
          url: '',
          alt: formData.name,
          isPrimary: true
        }]
      };
      
      console.log('Submitting product data:', productData);
      const response = await api.post('/seller/products', productData);
      console.log('Product added successfully:', response.data);
      toast.success('Product added successfully!');
      
      // Redirect to seller dashboard after a short delay
      setTimeout(() => {
        navigate('/seller-dashboard');
      }, 1500);
      
      // Reset form
      setFormData({
        name: '',
        nameBn: '',
        description: '',
        descriptionBn: '',
        price: 0,
        originalPrice: 0,
        category: 'Seasonal',
        unit: 'kg',
        weight: {
          value: 1,
          unit: 'kg'
        },
        images: [{
          url: '',
          alt: '',
          isPrimary: true
        }],
        inventory: {
          stock: 1
        },
        origin: {
          region: '',
          farm: ''
        },
        features: {
          organic: false,
          seasonal: false,
          imported: false,
          premium: false
        }
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Please log in again to add products');
      } else if (error.response?.status === 403) {
        toast.error('You need seller privileges to add products');
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || 'Failed to add product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Package className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name (English) *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter product name in English"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name (Bengali) *
            </label>
            <input
              type="text"
              value={formData.nameBn}
              onChange={(e) => handleInputChange('nameBn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter product name in Bengali"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Enter product description in English"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Bengali)
            </label>
            <textarea
              value={formData.descriptionBn}
              onChange={(e) => handleInputChange('descriptionBn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Enter product description in Bengali"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (৳) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (৳)
            </label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              value={formData.inventory.stock}
              onChange={(e) => handleInputChange('inventory.stock', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              min="1"
              required
            />
          </div>
        </div>

        {/* Category and Unit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={formData.weight.value}
                onChange={(e) => handleInputChange('weight.value', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1"
                min="0"
                step="0.1"
              />
              <select
                value={formData.weight.unit}
                onChange={(e) => handleInputChange('weight.unit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {weightUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Origin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region *
            </label>
            <input
              type="text"
              value={formData.origin.region}
              onChange={(e) => handleInputChange('origin.region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Rajshahi, Chapainawabganj"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Name
            </label>
            <input
              type="text"
              value={formData.origin.farm}
              onChange={(e) => handleInputChange('origin.farm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Farm name (optional)"
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.organic}
                onChange={() => handleFeatureChange('organic')}
                className="mr-2"
              />
              <span className="text-sm">Organic</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.seasonal}
                onChange={() => handleFeatureChange('seasonal')}
                className="mr-2"
              />
              <span className="text-sm">Seasonal</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.imported}
                onChange={() => handleFeatureChange('imported')}
                className="mr-2"
              />
              <span className="text-sm">Imported</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.premium}
                onChange={() => handleFeatureChange('premium')}
                className="mr-2"
              />
              <span className="text-sm">Premium</span>
            </label>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image URL
          </label>
          <input
            type="url"
            value={formData.images[0].url}
            onChange={(e) => handleInputChange('images', [{
              url: e.target.value,
              alt: formData.name,
              isPrimary: true
            }])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/seller-dashboard')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg text-white font-medium flex items-center ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm; 