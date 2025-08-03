import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, DollarSign, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Receipt {
  id: string;
  receiptNumber: string;
  orderNumber: string;
  total: number;
  status: string;
  generatedAt: string;
  downloadCount: number;
  pdfUrl: string;
}

const ReceiptList: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/receipts/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setReceipts(response.data.receipts);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const generateMissingReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/receipts/generate-missing', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(response.data.message);
      fetchReceipts(); // Refresh receipts list
    } catch (error: any) {
      console.error('Error generating missing receipts:', error);
      toast.error(error.response?.data?.message || 'Failed to generate receipts');
    }
  };

  const downloadReceipt = async (receiptId: string, receiptNumber: string) => {
    try {
      setDownloading(receiptId);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:3000/api/receipts/download/${receiptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
      
      // Refresh receipts to update download count
      fetchReceipts();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'downloaded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your receipts will appear here after you make purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your Receipts</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={generateMissingReceipts}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Generate Missing Receipts
          </button>
          <span className="text-sm text-gray-500">
            {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      Receipt #{receipt.receiptNumber}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(receipt.generatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>BDT {receipt.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{receipt.downloadCount} download{receipt.downloadCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    Order #{receipt.orderNumber}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadReceipt(receipt.id, receipt.receiptNumber)}
                  disabled={downloading === receipt.id}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === receipt.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="ml-2">Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceiptList; 