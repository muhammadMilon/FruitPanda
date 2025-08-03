import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft, Package, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  productInfo: {
    name: string;
    nameBn: string;
    image: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
  };
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    area: string;
    phone: string;
  };
  createdAt: string;
}

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const orderNumber = searchParams.get('orderNumber');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderNumber && orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderNumber, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      } else {
        toast.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!orderNumber) return;

    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/payments/receipt/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Receipt downloaded successfully!');
      } else {
        toast.error('Failed to download receipt. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🎉 Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-2">Thank you for choosing Fruit Panda!</p>
          <p className="text-lg font-semibold text-green-600 mb-6">Order Number: #{order.orderNumber}</p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
            <button
              onClick={downloadReceipt}
              disabled={downloading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Summary
            </h3>
            
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center">
                  <img
                    src={item.productInfo.image}
                    alt={item.productInfo.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium text-gray-800">{item.productInfo.nameBn}</h4>
                    <p className="text-gray-600 text-sm">{item.productInfo.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">৳{item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{order.pricing.deliveryFee === 0 ? 'Free' : `৳${order.pricing.deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 text-lg border-t pt-2">
                <span>Total</span>
                <span>৳{order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
                <p><strong>Address:</strong> {order.shippingAddress.address}</p>
                <p><strong>City:</strong> {order.shippingAddress.city}</p>
                <p><strong>Area:</strong> {order.shippingAddress.area}</p>
                <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Method:</strong> {order.payment.method.toUpperCase()}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                  </span>
                </p>
                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">What's Next?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <div>
                    <p className="text-green-800 font-medium">Order Confirmation</p>
                    <p className="text-green-700">You will receive a confirmation call within 30 minutes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                  <div>
                    <p className="text-green-800 font-medium">Order Processing</p>
                    <p className="text-green-700">Your order will be prepared and packed with care</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                  <div>
                    <p className="text-green-800 font-medium">Delivery</p>
                    <p className="text-green-700">Fresh fruits will be delivered to your doorstep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Need help?</strong> Contact us at{' '}
                <span className="font-mono">+880 1234-567890</span> or email{' '}
                <span className="font-mono">support@fruitpanda.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 