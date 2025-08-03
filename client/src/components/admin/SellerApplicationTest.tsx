import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SellerApplicationTest: React.FC = () => {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/seller-applications/test');
      console.log('Test response:', response.data);
      setTestData(response.data);
      toast.success('Test completed successfully');
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(error.response?.data?.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Seller Applications Test</h2>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Test...' : 'Run Database Test'}
      </button>

      {testData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <p><strong>Total Users:</strong> {testData.totalUsers}</p>
          <p><strong>Users with Applications:</strong> {testData.usersWithApplications}</p>
          <div className="mt-2">
            <strong>Applications:</strong>
            <ul className="list-disc list-inside mt-1">
              {testData.applications.map((app: any, index: number) => (
                <li key={index}>
                  {app.name} ({app.email}) - Status: {app.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApplicationTest; 