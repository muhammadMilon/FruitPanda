import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PendingPayment {
  _id: string;
  orderNumber: string;
  customerId: {
    name: string;
    email: string;
    phone: string;
  };
  pricing: {
    total: number;
  };
  payment: {
    method: string;
    transactionId?: string;
    submittedAt: string;
  };
  status: string;
  createdAt: string;
}

const PaymentManagement: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmationForm, setConfirmationForm] = useState({
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/orders?status=pending&paymentStatus=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPendingPayments(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const generateAllReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/receipts/generate-all-paid', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(response.data.message);
    } catch (error: any) {
      console.error('Error generating all receipts:', error);
      toast.error(error.response?.data?.message || 'Failed to generate receipts');
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    if (!confirmationForm.transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setConfirming(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/payments/admin/confirm/${orderId}`, {
        transactionId: confirmationForm.transactionId,
        notes: confirmationForm.notes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('Payment confirmed successfully');
      setConfirmationForm({ transactionId: '', notes: '' });
      setShowDetails(false);
      setSelectedPayment(null);
      fetchPendingPayments();
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(null);
    }
  };

  const handleRejectPayment = async (orderId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please enter rejection reason');
      return;
    }

    setRejecting(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/payments/admin/reject/${orderId}`, {
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('Payment rejected successfully');
      fetchPendingPayments();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setRejecting(null);
    }
  };

  const openPaymentDetails = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setConfirmationForm({
      transactionId: payment.payment.transactionId || '',
      notes: ''
    });
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bkash':
        return '💚';
      case 'nagad':
        return '🟢';
      case 'cod':
        return '💰';
      case 'card':
        return '💳';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={generateAllReceipts}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate All Receipts
          </button>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-600">
              {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending payments</h3>
          <p className="mt-1 text-sm text-gray-500">
            All payments have been processed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingPayments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        Order #{payment.orderNumber}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Pending
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>{getPaymentMethodIcon(payment.payment.method)}</span>
                        <span>{payment.payment.method.toUpperCase()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>BDT {payment.pricing.total.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(payment.payment.submittedAt)}</span>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600">
                      {payment.customerId.name} • {payment.customerId.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openPaymentDetails(payment)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <p className="text-sm text-gray-900">{selectedPayment.orderNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <p className="text-sm text-gray-900">{selectedPayment.customerId.name}</p>
                <p className="text-sm text-gray-600">{selectedPayment.customerId.email}</p>
                <p className="text-sm text-gray-600">{selectedPayment.customerId.phone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <p className="text-sm text-gray-900">{selectedPayment.payment.method.toUpperCase()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-sm text-gray-900">BDT {selectedPayment.pricing.total.toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID (if provided)
                </label>
                <p className="text-sm text-gray-900">{selectedPayment.payment.transactionId || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitted At
                </label>
                <p className="text-sm text-gray-900">{formatDate(selectedPayment.payment.submittedAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID (Admin)
                </label>
                <input
                  type="text"
                  value={confirmationForm.transactionId}
                  onChange={(e) => setConfirmationForm(prev => ({ ...prev, transactionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter transaction ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={confirmationForm.notes}
                  onChange={(e) => setConfirmationForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Add any notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPayment(selectedPayment._id, 'Payment verification failed')}
                disabled={rejecting === selectedPayment._id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting === selectedPayment._id ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => handleConfirmPayment(selectedPayment._id)}
                disabled={confirming === selectedPayment._id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {confirming === selectedPayment._id ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement; 