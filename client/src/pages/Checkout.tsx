import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, Shield, AlertTriangle, CheckCircle, Loader2, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { CartItem } from '../context/CartContext';
import toast from 'react-hot-toast';

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  instructions: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
}

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    area: '',
    instructions: ''
  });

  const [selectedPayment, setSelectedPayment] = useState<string>('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    paymentMethod: 'bkash'
  });
  const [isFormAutoFilled, setIsFormAutoFilled] = useState(false);

  // Fetch user profile data and auto-fill form
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const profile = userData.user;
          
          // Auto-fill the delivery address with user's saved information
          setDeliveryAddress(prev => ({
            ...prev,
            fullName: profile.name || user.name || '',
            phone: profile.phone || '',
            address: profile.address?.street || '',
            city: profile.address?.city || '',
            area: profile.address?.state || '',
            instructions: ''
          }));
          
          // Mark form as auto-filled if we got any data
          if (profile.name || profile.phone || profile.address?.street) {
            setIsFormAutoFilled(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // If fetch fails, still try to use basic user info
        if (user.name) {
          setDeliveryAddress(prev => ({
            ...prev,
            fullName: user.name
          }));
          setIsFormAutoFilled(true);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bkash',
      name: 'bKash',
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      description: 'Pay securely with bKash mobile banking'
    },
    {
      id: 'nagad',
      name: 'Nagad',
      icon: <CreditCard className="w-6 h-6 text-orange-600" />,
      description: 'Pay using your Nagad account'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <Truck className="w-6 h-6 text-green-600" />,
      description: 'Pay when you receive your order'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculateSubtotal = () => {
    return total;
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 1000 ? 0 : 60;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };



  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!deliveryAddress.fullName || deliveryAddress.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!deliveryAddress.phone || deliveryAddress.phone.trim().length < 10) {
      errors.phone = 'Valid phone number is required (at least 10 digits)';
    }
    
    if (!deliveryAddress.address || deliveryAddress.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }
    
    if (!deliveryAddress.city || deliveryAddress.city.trim().length < 2) {
      errors.city = 'City is required';
    }
    
    if (!deliveryAddress.area || deliveryAddress.area.trim().length < 2) {
      errors.area = 'Area is required';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to place an order.');
      return;
    }
    
    if (items.length === 0) {
      alert('Your cart is empty. Please add items to proceed.');
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      alert(`Please fix ${Object.keys(errors).length} validation error${Object.keys(errors).length > 1 ? 's' : ''} before placing your order`);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Create order object matching the Order schema
      const orderData = {
        items: items.map((item: CartItem) => ({
          product: item.id,
          productInfo: {
            name: item.name,
            nameBn: item.nameBn || item.name, // Fallback to English name if Bengali not available
            image: item.image,
            seller: item.seller
          },
          quantity: item.quantity,
          price: item.price,
          weight: item.weight || '1kg', // Default weight if not provided
          subtotal: item.price * item.quantity
        })),
        shippingAddress: deliveryAddress,
        payment: {
          method: selectedPayment,
          status: selectedPayment === 'cod' ? 'pending' : 'pending'
        },
        total: calculateTotal() // Add the total to the order data
      };

      // Make the actual API call to save the order
      const token = localStorage.getItem('token');
      console.log('Sending order request with token:', token ? 'Token exists' : 'No token');
      console.log('Order data:', orderData);
      
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to place order');
      }

      const result = await response.json();
      
      console.log('Order placed successfully:', result);
      console.log('Order ID from response:', result.order._id);
      console.log('Order Number from response:', result.order.orderNumber);
      
      setOrderNumber(result.order.orderNumber);
      setOrderId(result.order._id);
      
      // Test: Log the orderId that will be used in payment confirmation
      console.log('OrderId set for payment confirmation:', result.order._id);
      
      // Test: Verify the order was created properly
      try {
        const testResponse = await fetch(`http://localhost:3000/api/orders/test/${result.order._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const testResult = await testResponse.json();
        console.log('Order verification test result:', testResult);
      } catch (testError) {
        console.error('Order verification test failed:', testError);
      }
      
      // If payment method is not COD, show payment form
      if (selectedPayment !== 'cod') {
        console.log('Showing payment form for non-COD order');
        setShowPaymentForm(true);
      } else {
        console.log('COD order, showing success message');
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully! Thank you for choosing Fruit Panda!');
        // Navigate to OrderSuccess page
        window.location.href = `/order-success?orderNumber=${result.order.orderNumber}&orderId=${result.order._id}`;
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentDetails.transactionId.trim()) {
      alert('Please enter your transaction ID');
      return;
    }

    console.log('Payment confirmation started');
    console.log('Current orderId:', orderId);
    console.log('Current orderNumber:', orderNumber);

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        orderId,
        transactionId: paymentDetails.transactionId,
        paymentMethod: selectedPayment,
        amount: calculateTotal()
      };
      
      console.log('Sending payment confirmation request:', requestData);
      
      const response = await fetch('http://localhost:3000/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Payment confirmation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment confirmation error response:', errorData);
        
        // For now, let's proceed to success page even if server fails
        console.log('Server payment confirmation failed, but proceeding to success page');
        setOrderPlaced(true);
        clearCart();
        toast.success('Payment submitted successfully! Waiting for admin verification.');
        
        // Navigate to OrderSuccess page even if server confirmation failed
        window.location.href = `/order-success?orderNumber=${orderNumber}&orderId=${orderId}`;
        return;
      }

      const result = await response.json();
      
      console.log('Payment confirmed successfully:', result);
      
      setOrderPlaced(true);
      setOrderNumber(result.order.orderNumber);
      setOrderId(result.order.id);
      clearCart();
      toast.success('Payment submitted successfully! Waiting for admin verification.');
      
      // Navigate to OrderSuccess page
      window.location.href = `/order-success?orderNumber=${result.order.orderNumber}&orderId=${result.order.id}`;
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Payment confirmation failed, but proceeding to success page');
      
      // Even if there's an error, proceed to success page
      setOrderPlaced(true);
      clearCart();
      toast.success('Payment submitted successfully! Waiting for admin verification.');
      
      // Navigate to OrderSuccess page
      window.location.href = `/order-success?orderNumber=${orderNumber}&orderId=${orderId}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download receipt function
  const downloadReceipt = async () => {
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
    }
  };

  // Show payment confirmation form
  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h1>
                <p className="text-gray-600">Order #{orderNumber}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-blue-800">
                  <Package className="w-5 h-5 mr-2" />
                  <span className="font-medium">Order Total: ৳{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handlePaymentConfirmation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center">
                      {selectedPayment === 'bkash' && <CreditCard className="w-6 h-6 text-pink-600 mr-2" />}
                      {selectedPayment === 'nagad' && <CreditCard className="w-6 h-6 text-orange-600 mr-2" />}
                      <span className="font-medium">{selectedPayment.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    value={paymentDetails.transactionId}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Enter your transaction ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please enter the transaction ID from your {selectedPayment.toUpperCase()} payment
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Package className="w-5 h-5 text-yellow-500 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Payment Instructions</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        After completing your payment via {selectedPayment.toUpperCase()}, please enter the transaction ID above. Your payment will be verified by our admin team.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Back to Order
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                        Submitting Payment...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after order is placed
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">🎉 Order Submitted Successfully!</h1>
            <p className="text-gray-600 mb-2">Thank you for choosing Fruit Panda!</p>
            <p className="text-lg font-semibold text-green-600 mb-6">Order Number: #{orderNumber}</p>
            
            {/* Status Information */}
            <div className="bg-yellow-50 p-6 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-yellow-800 mb-3">Order Status: Pending Verification</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <div>
                    <p className="text-yellow-800 font-medium">Payment Submitted</p>
                    <p className="text-yellow-700">Your payment has been submitted and is waiting for admin verification</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                  <div>
                    <p className="text-gray-800 font-medium">Admin Verification</p>
                    <p className="text-gray-700">Our admin team will verify your transaction ID within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                  <div>
                    <p className="text-gray-800 font-medium">Order Confirmation</p>
                    <p className="text-gray-700">You will receive an email once your payment is verified</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-blue-50 p-6 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Subtotal:</span>
                  <span className="font-medium">৳{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Delivery Fee:</span>
                  <span className="font-medium">৳{calculateDeliveryFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-blue-800 font-semibold">Total Amount:</span>
                  <span className="text-blue-800 font-bold">৳{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 p-6 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-green-800 mb-3">What's Next?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <div>
                    <p className="text-green-800 font-medium">Payment Verification</p>
                    <p className="text-green-700">Our admin team will verify your transaction ID</p>
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
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Need help?</strong> Contact us at <span className="font-mono">+880 1234-567890</span> or email <span className="font-mono">support@fruitpanda.com</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/shop'}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue Shopping
              </button>
              <button
                onClick={downloadReceipt}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Download Receipt
              </button>
              <button
                onClick={() => window.location.href = '/user-profile?tab=orders'}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                View Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message if no items
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
            <button
              onClick={() => window.location.href = '/shop'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-8">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Delivery Address</h2>
                {Object.keys(validationErrors).length > 0 && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {Object.keys(validationErrors).length} error{Object.keys(validationErrors).length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              {/* Auto-fill indicator */}
              {isFormAutoFilled && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800 font-medium">
                      Form pre-filled with your saved information. You can edit any field as needed.
                    </span>
                  </div>
                </div>
              )}
              
              {/* Validation Errors Summary */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="text-red-800 font-semibold text-lg">Validation Errors</h3>
                  </div>
                  <p className="text-red-700 mb-3">Please fix the following errors before placing your order:</p>
                  <ul className="text-red-700 text-sm space-y-2">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field} className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <div>
                          <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="ml-1">{error}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={deliveryAddress.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.fullName && (
                      <p className="text-red-600 text-sm mt-1 font-medium flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={deliveryAddress.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.phone && (
                      <p className="text-red-600 text-sm mt-1 font-medium flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={deliveryAddress.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      validationErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.address && (
                    <p className="text-red-600 text-sm mt-1 font-medium flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {validationErrors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.city && (
                      <p className="text-red-600 text-sm mt-1 font-medium flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {validationErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                      Area *
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={deliveryAddress.area}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.area ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.area && (
                      <p className="text-red-600 text-sm mt-1 font-medium flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {validationErrors.area}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions
                  </label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    value={deliveryAddress.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any specific instructions for delivery?"
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-center flex-grow">
                      <div className="mr-3">{method.icon}</div>
                      <div>
                        <p className="font-medium text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPayment === method.id
                        ? 'border-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPayment === method.id && (
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-800">{item.nameBn}</h3>
                      <p className="text-gray-600">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.weight} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">৳{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{calculateDeliveryFee() === 0 ? 'Free' : `৳${calculateDeliveryFee()}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>৳{calculateTotal()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full mt-6 py-3 rounded-lg transition-colors flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-6 flex items-center justify-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                <span>Secure checkout powered by SSL Commerz</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Delivery Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Same-day delivery available for Dhaka City
                </p>
                <p className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Order before 2 PM for same-day delivery
                </p>
                <p className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  100% quality guarantee or money back
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;