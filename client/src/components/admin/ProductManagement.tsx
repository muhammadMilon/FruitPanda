import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
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
  seller: {
    _id: string;
    name: string;
  };
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
  status: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
    },
    status: 'active'
  });

  const categories = ['Seasonal', 'Regular', 'Exotic', 'Organic', 'Imported'];
  const units = ['kg', 'piece', 'dozen', 'gram', 'liter'];
  const weightUnits = ['kg', 'g'];
  const statuses = ['active', 'inactive', 'out_of_stock', 'discontinued'];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/admin/products?${params}`);
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

  const handleStatusUpdate = async (productId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/products/${productId}/status`, { status: newStatus });
      toast.success('Product status updated successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error('Failed to update product status');
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
      },
      status: 'active'
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
      features: product.features,
      status: product.status
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
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
          <h2 className="text-xl font-semibold text-gray-800">Product Management</h2>
          
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
          
          {/* Filters */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
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

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={product.images[0]?.url || '/placeholder-fruit.jpg'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{product.nameBn}</h3>
                      <p className="text-sm text-gray-600">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.origin.region}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <p className="font-medium">৳{product.price}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-gray-500 line-through">৳{product.originalPrice}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <p className={`font-medium ${
                      product.inventory.available > 20 ? 'text-green-600' :
                      product.inventory.available > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.inventory.available}
                    </p>
                    <p className="text-xs text-gray-500">of {product.inventory.stock}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={product.status}
                    onChange={(e) => handleStatusUpdate(product._id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingProduct(product)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit Product"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          title="Create New Product"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;