import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Search, Filter } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  content: string;
  contentBn: string;
  author: string;
  authorBn: string;
  publishDate: string;
  readTime: number;
  category: string;
  categoryBn: string;
  tags: string[];
  tagsBn: string[];
  image: string;
  featured: boolean;
  language: 'en' | 'bn';
  status: 'draft' | 'published' | 'archived';
}

const AdminBlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'The Ultimate Guide to Mango Varieties in Bangladesh',
      titleBn: 'বাংলাদেশের আমের জাতের সম্পূর্ণ গাইড',
      excerpt: 'Discover the rich diversity of mango varieties grown in Bangladesh...',
      excerptBn: 'বাংলাদেশে উৎপাদিত আমের বিভিন্ন জাতের সমৃদ্ধ বৈচিত্র্য আবিষ্কার করুন...',
      content: 'Full content here...',
      contentBn: 'সম্পূর্ণ বিষয়বস্তু এখানে...',
      author: 'Dr. Rashida Khatun',
      authorBn: 'ড. রশিদা খাতুন',
      publishDate: '2025-03-15',
      readTime: 8,
      category: 'Fruit Guide',
      categoryBn: 'ফলের গাইড',
      tags: ['Mango', 'Varieties', 'Bangladesh', 'Nutrition'],
      tagsBn: ['আম', 'জাত', 'বাংলাদেশ', 'পুষ্টি'],
      image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
      featured: true,
      language: 'en',
      status: 'published'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'en' | 'bn'>('all');

  const categories = [
    { en: 'Fruit Guide', bn: 'ফলের গাইড' },
    { en: 'Health & Nutrition', bn: 'স্বাস্থ্য ও পুষ্টি' },
    { en: 'Seasonal Guide', bn: 'মৌসুমী গাইড' },
    { en: 'Recipes & Cooking', bn: 'রেসিপি ও রান্না' },
    { en: 'Exotic Fruits', bn: 'বিদেশী ফল' }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.titleBn.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesLanguage = filterLanguage === 'all' || post.language === filterLanguage;
    
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
          <button
            onClick={() => {}} // Removed setShowCreateModal(true)
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Create New Post
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="bn">Bangla</option>
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">{post.title}</h3>
                          <p className="text-sm text-gray-600">{post.titleBn}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                              {post.language === 'bn' ? 'বাংলা' : 'English'}
                            </span>
                            {post.featured && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p>{post.author}</p>
                        <p className="text-gray-600">{post.authorBn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p>{post.category}</p>
                        <p className="text-gray-600">{post.categoryBn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(post.publishDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {}} // Removed setEditingPost(post)
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {}} // Removed handleDeletePost(post.id)
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
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
        </div>

        {/* Create Post Modal */}
        {/* Removed PostForm and related modals */}
      </div>
    </div>
  );
};

export default AdminBlogManagement;