import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, User, MapPin, FileText, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FormData {
  // Personal
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    nid: string;
  };
  
  // Business
  businessInfo: {
    businessName: string;
    businessType: 'farmer' | 'wholesaler' | 'retailer';
    experience: string;
    specialization: string[];
    businessAddress: string;
    city: string;
    district: string;
  };
  
  // Banking
  bankingInfo: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };

  // Documents
  documents: {
    nidImage: string;
    businessLicense: string;
    bankStatement: string;
  };

  // Additional
  additionalInfo: string;
  agreeToTerms: boolean;
}

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      nid: ''
    },
    businessInfo: {
      businessName: '',
      businessType: 'farmer',
      experience: '',
      specialization: [],
      businessAddress: '',
      city: '',
      district: ''
    },
    bankingInfo: {
      bankName: '',
      accountNumber: '',
      accountHolderName: ''
    },
    documents: {
      nidImage: '',
      businessLicense: '',
      bankStatement: ''
    },
    additionalInfo: '',
    agreeToTerms: false
  });

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  // Check if user already has an application
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/users/seller-applications/my-application', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setApplicationStatus(response.data.application.status);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error checking application status:', error);
        }
      }
    };

    checkApplicationStatus();
  }, [user]);

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Business Details', icon: Store },
    { id: 3, title: 'Location & Banking', icon: MapPin },
    { id: 4, title: 'Documents', icon: FileText },
    { id: 5, title: 'Review & Submit', icon: CheckCircle }
  ];

  const businessTypes = [
    { value: 'farmer', label: 'Farmer', description: 'Direct fruit producer' },
    { value: 'wholesaler', label: 'Wholesaler', description: 'Bulk distributor' },
    { value: 'retailer', label: 'Retailer', description: 'Retail seller' }
  ];

  const specializationOptions = [
    'Mango', 'Litchi', 'Jackfruit', 'Pineapple', 'Dragon Fruit', 'Guava', 
    'Papaya', 'Banana', 'Orange', 'Coconut', 'Organic Fruits', 'Seasonal Fruits'
  ];

  // Handle file upload (simplified - in real app you'd upload to cloud storage)
  const handleFileUpload = (field: keyof FormData['documents'], file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: e.target?.result as string
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.personalInfo.fullName) errors.push('Full name is required');
        if (!formData.personalInfo.phone) errors.push('Phone number is required');
        if (!formData.personalInfo.nid) errors.push('NID is required');
        break;
      case 2:
        if (!formData.businessInfo.businessName) errors.push('Business name is required');
        if (!formData.businessInfo.experience) errors.push('Experience is required');
        if (!formData.businessInfo.businessAddress) errors.push('Business address is required');
        if (!formData.businessInfo.city) errors.push('City is required');
        if (!formData.businessInfo.district) errors.push('District is required');
        break;
      case 3:
        if (!formData.bankingInfo.bankName) errors.push('Bank name is required');
        if (!formData.bankingInfo.accountNumber) errors.push('Account number is required');
        if (!formData.bankingInfo.accountHolderName) errors.push('Account holder name is required');
        break;
      case 4:
        // Documents are optional for now - can be added later
        break;
      case 5:
        if (!formData.agreeToTerms) errors.push('You must agree to terms and conditions');
        break;
      default:
        break;
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    if (validation.isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      validation.errors.forEach(error => toast.error(error));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5).isValid) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Debug: Log the token and form data
      console.log('Token exists:', !!token);
      console.log('Agree to terms:', formData.agreeToTerms);
      console.log('Form validation:', validateStep(5));
      console.log('User info:', user);
      console.log('Submitting form data:', JSON.stringify(formData, null, 2));
      
      const response = await axios.post('http://localhost:3000/api/users/seller-applications/submit', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response:', response.data);
      toast.success('Application submitted successfully!');
      navigate('/seller-application-success');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Show validation errors
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.msg || 'Validation error');
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already has an application, show status
  if (applicationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            {applicationStatus === 'pending' ? (
              <>
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Application Pending</h1>
                <p className="text-gray-600 mb-6">
                  Your seller application is currently under review. We'll notify you once it's been processed.
                </p>
              </>
            ) : applicationStatus === 'approved' ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Application Approved!</h1>
                <p className="text-gray-600 mb-6">
                  Congratulations! Your seller application has been approved. You can now start adding products.
                </p>
                <button
                  onClick={() => navigate('/seller-dashboard')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to Seller Dashboard
                </button>
              </>
            ) : (
              <>
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Application Rejected</h1>
                <p className="text-gray-600 mb-6">
                  Unfortunately, your seller application has been rejected. You can submit a new application.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit New Application
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to submit a seller application.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  placeholder="Your email"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NID Number *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.nid}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, nid: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your NID number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessInfo.businessName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your business name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <select
                  value={formData.businessInfo.businessType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    businessInfo: { ...prev.businessInfo, businessType: e.target.value as 'farmer' | 'wholesaler' | 'retailer' }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience *
                </label>
                <textarea
                  value={formData.businessInfo.experience}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    businessInfo: { ...prev.businessInfo, experience: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Describe your experience in fruit business"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specializationOptions.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.businessInfo.specialization.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              businessInfo: {
                                ...prev.businessInfo,
                                specialization: [...prev.businessInfo.specialization, specialty]
                              }
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              businessInfo: {
                                ...prev.businessInfo,
                                specialization: prev.businessInfo.specialization.filter(s => s !== specialty)
                              }
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Location & Banking Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address *
                </label>
                <textarea
                  value={formData.businessInfo.businessAddress}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    businessInfo: { ...prev.businessInfo, businessAddress: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter your business address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, city: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.district}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, district: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter district"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Banking Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bankingInfo.bankName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankingInfo: { ...prev.bankingInfo, bankName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter bank name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.bankingInfo.accountNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankingInfo: { ...prev.bankingInfo, accountNumber: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bankingInfo.accountHolderName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankingInfo: { ...prev.bankingInfo, accountHolderName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter account holder name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Documents (Optional)</h2>
            <p className="text-gray-600 text-sm">You can upload supporting documents to help with your application review. These are optional but recommended.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NID Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.documents.nidImage ? (
                    <div>
                      <img src={formData.documents.nidImage} alt="NID" className="w-32 h-20 object-cover mx-auto mb-2" />
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, nidImage: '' }
                        }))}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('nidImage', file);
                        }}
                        className="hidden"
                        id="nid-upload"
                      />
                      <label htmlFor="nid-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                        Upload NID Image
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business License (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.documents.businessLicense ? (
                    <div>
                      <img src={formData.documents.businessLicense} alt="License" className="w-32 h-20 object-cover mx-auto mb-2" />
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, businessLicense: '' }
                        }))}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('businessLicense', file);
                        }}
                        className="hidden"
                        id="license-upload"
                      />
                      <label htmlFor="license-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                        Upload Business License
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Statement (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.documents.bankStatement ? (
                    <div>
                      <img src={formData.documents.bankStatement} alt="Statement" className="w-32 h-20 object-cover mx-auto mb-2" />
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, bankStatement: '' }
                        }))}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('bankStatement', file);
                        }}
                        className="hidden"
                        id="statement-upload"
                      />
                      <label htmlFor="statement-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                        Upload Bank Statement
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Review & Submit</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Personal Information</h3>
                <p><strong>Name:</strong> {formData.personalInfo.fullName}</p>
                <p><strong>Email:</strong> {formData.personalInfo.email}</p>
                <p><strong>Phone:</strong> {formData.personalInfo.phone}</p>
                <p><strong>NID:</strong> {formData.personalInfo.nid}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Business Information</h3>
                <p><strong>Business Name:</strong> {formData.businessInfo.businessName}</p>
                <p><strong>Business Type:</strong> {formData.businessInfo.businessType}</p>
                <p><strong>Experience:</strong> {formData.businessInfo.experience}</p>
                <p><strong>Address:</strong> {formData.businessInfo.businessAddress}</p>
                <p><strong>City:</strong> {formData.businessInfo.city}</p>
                <p><strong>District:</strong> {formData.businessInfo.district}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Banking Information</h3>
                <p><strong>Bank:</strong> {formData.bankingInfo.bankName}</p>
                <p><strong>Account Number:</strong> {formData.bankingInfo.accountNumber}</p>
                <p><strong>Account Holder:</strong> {formData.bankingInfo.accountHolderName}</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    agreeToTerms: e.target.checked
                  }))}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Seller Registration</h1>
            <p className="text-gray-600">Join our platform as a fruit seller</p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <step.icon size={20} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(5).isValid}
                  className={`px-8 py-2 rounded-lg ${
                    isSubmitting || !validateStep(5).isValid
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistration;