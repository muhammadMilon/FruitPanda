import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search, AlertCircle } from 'lucide-react';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface SellerApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    nid: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    experience: string;
    specialization: string[];
    businessAddress: string;
    city: string;
    district: string;
  };
  bankingInfo: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminComments?: string;
  rejectionReason?: string;
}

const SellerApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('Fetching seller applications with params:', params.toString());
      
      const response = await api.get(`/admin/seller-applications?${params}`);
      console.log('Seller applications response:', response.data);
      
      if (response.data.applications) {
        setApplications(response.data.applications);
      } else {
        setApplications([]);
      }
    } catch (error: unknown) {
      console.error('Error fetching applications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      console.log('Approving application:', applicationId);
      await api.patch(`/admin/seller-applications/${applicationId}/approve`, {
        comments: 'Application approved by admin'
      });
      toast.success('Application approved successfully');
      fetchApplications();
    } catch (error: unknown) {
      console.error('Error approving application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve application';
      toast.error(errorMessage);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      console.log('Rejecting application:', applicationId);
      await api.patch(`/admin/seller-applications/${applicationId}/reject`, {
        rejectionReason: 'Application rejected by admin'
      });
      toast.success('Application rejected successfully');
      fetchApplications();
    } catch (error: unknown) {
      console.error('Error rejecting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject application';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Applications</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchApplications}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Seller Applications</h2>
        
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">No seller applications found</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No applications have been submitted yet'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{application.personalInfo.fullName}</div>
                      <div className="text-gray-500">{application.personalInfo.email}</div>
                      <div className="text-xs text-gray-400">{application.personalInfo.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{application.businessInfo.businessName}</div>
                      <div className="text-gray-500 capitalize">{application.businessInfo.businessType}</div>
                      <div className="text-xs text-gray-400">{application.businessInfo.city}, {application.businessInfo.district}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(application._id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Approve Application"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(application._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Reject Application"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {application.status === 'approved' && (
                      <span className="text-green-600 text-xs">✓ Approved</span>
                    )}
                    {application.status === 'rejected' && (
                      <span className="text-red-600 text-xs">✗ Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerApplicationManagement; 