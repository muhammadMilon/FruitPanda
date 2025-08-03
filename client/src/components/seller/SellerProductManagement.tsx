import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
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
    reserved: number;
    available: number;
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
  status: string;
  ratings: {
    average: number;
    count: number;
  };
  analytics: {
    views: number;
    purchases: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  originalPrice: number;
  category: string;
  unit: string;
  weight: {
    value: number;
    unit: string;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  inventory: {
    stock: number;
  };
  origin: {
    region: string;
    farm: string;
  };
  features: {
    organic: boolean;
    seasonal: boolean;
    imported: boolean;
    premium: boolean;
  };
}

const SellerProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

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
      stock: 0
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

  const categories = ['Seasonal', 'Regular', 'Exotic', 'Organic', 'Imported'];
  const units = ['kg', 'piece', 'dozen', 'gram', 'liter'];
  const weightUnits = ['kg', 'g'];
  const statuses = ['active', 'inactive', 'out_of_stock'];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/products/seller/my-products?${params}`);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const response = await api.post('/products', formData);
      toast.success('Product created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await api.put(`/products/${editingProduct._id}`, formData);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
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
        stock: 0
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
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      nameBn: product.nameBn,
      description: product.description,
      descriptionBn: product.descriptionBn,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      unit: product.unit,
      weight: product.weight,
      images: product.images.length > 0 ? product.images : [{
        url: '',
        alt: '',
        isPrimary: true
      }],
      inventory: {
        stock: product.inventory.stock
      },
      origin: product.origin,
      features: product.features
    });
    setEditingProduct(product);
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', isPrimary: false }]
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageField = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const ProductForm = ({ title, onSave, onCancel }: {
    title: string;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name (Bangla) *
              </label>
              <input
                type="text"
                value={formData.nameBn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameBn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English) *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Bangla) *
              </label>
              <textarea
                value={formData.descriptionBn}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionBn: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Pricing and Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (৳)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Value *
              </label>
              <input
                type="number"
                value={formData.weight.value}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weight: { ...prev.weight, value: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                min="0"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Unit *
              </label>
              <select
                value={formData.weight.unit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weight: { ...prev.weight, unit: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {weightUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.inventory.stock}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  inventory: { ...prev.inventory, stock: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                min="0"
              />
            </div>
          </div>

          {/* Origin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <input
                type="text"
                value={formData.origin.region}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  origin: { ...prev.origin, region: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name
              </label>
              <input
                type="text"
                value={formData.origin.farm}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  origin: { ...prev.origin, farm: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.features).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      features: { ...prev.features, [key]: e.target.checked }
                    }))}
                    className="form-checkbox text-green-600"
                  />
                  <span className="ml-2 text-sm capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={image.url}
                    onChange={(e) => updateImageField(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={image.alt}
                    onChange={(e) => updateImageField(index, 'alt', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={image.isPrimary}
                      onChange={(e) => updateImageField(index, 'isPrimary', e.target.checked)}
                      className="form-checkbox text-green-600"
                    />
                    <span className="ml-1 text-sm">Primary</span>
                  </label>
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="text-green-600 hover:text-green-800 text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Image
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">My Products</h2>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first product to the marketplace</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.images[0]?.url || '/placeholder-fruit.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-800">{product.nameBn}</h3>
                    <p className="text-sm text-gray-600">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.origin.region}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-800">৳{product.price}</span>
                      <span className="text-sm text-gray-600">/{product.unit}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Stock: {product.inventory.available}</p>
                      <p className="text-xs text-gray-500">Views: {product.analytics?.views || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingProduct(product)}
                      className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductForm
          title="Add New Product"
          onSave={handleCreateProduct}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductForm
          title="Edit Product"
          onSave={handleUpdateProduct}
          onCancel={() => {
            setEditingProduct(null);
            resetForm();
          }}
        />
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={viewingProduct.images[0]?.url || '/placeholder-fruit.jpg'}
                    alt={viewingProduct.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">Name</h3>
                    <p>{viewingProduct.nameBn} ({viewingProduct.name})</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Price</h3>
                    <p>৳{viewingProduct.price} per {viewingProduct.unit}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Category</h3>
                    <p>{viewingProduct.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Origin</h3>
                    <p>{viewingProduct.origin.region}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Stock</h3>
                    <p>{viewingProduct.inventory.available} available of {viewingProduct.inventory.stock}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{viewingProduct.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(viewingProduct.features).map(([key, value]) => 
                    value && (
                      <span key={key} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    )
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Views</p>
                    <p className="text-lg font-semibold">{viewingProduct.analytics?.views || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Purchases</p>
                    <p className="text-lg font-semibold">{viewingProduct.analytics?.purchases || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductManagement;