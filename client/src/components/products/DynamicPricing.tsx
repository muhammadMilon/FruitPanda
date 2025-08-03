import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceTrend {
  id: string;
  name: string;
  nameBn: string;
  currentPrice: number;
  priceHistory: PricePoint[];
  forecastedPrices: PricePoint[];
  priceFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  supplyStatus: 'high' | 'medium' | 'low';
  demandStatus: 'high' | 'medium' | 'low';
  bestTimeToBuy: string;
  image: string;
}

// Mock data
const fruitPriceTrends: PriceTrend[] = [
  {
    id: '1',
    name: 'Mango',
    nameBn: 'আম',
    currentPrice: 120,
    priceHistory: [
      { date: '2025-03-01', price: 180 },
      { date: '2025-03-15', price: 165 },
      { date: '2025-04-01', price: 150 },
      { date: '2025-04-15', price: 135 },
      { date: '2025-05-01', price: 120 },
    ],
    forecastedPrices: [
      { date: '2025-05-15', price: 110 },
      { date: '2025-06-01', price: 105 },
      { date: '2025-06-15', price: 100 },
      { date: '2025-07-01', price: 115 },
      { date: '2025-07-15', price: 130 },
    ],
    priceFactors: [
      { 
        factor: 'Seasonal Peak', 
        impact: 'negative', 
        description: 'We are entering peak mango season, resulting in increased supply and lower prices'
      },
      { 
        factor: 'Weather Conditions', 
        impact: 'positive', 
        description: 'Recent favorable weather has led to good harvests'
      },
      { 
        factor: 'Transportation Costs', 
        impact: 'negative', 
        description: 'Fuel prices have decreased, lowering transportation costs'
      },
    ],
    supplyStatus: 'high',
    demandStatus: 'high',
    bestTimeToBuy: 'Mid-June',
    image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg'
  },
  {
    id: '2',
    name: 'Litchi',
    nameBn: 'লিচু',
    currentPrice: 150,
    priceHistory: [
      { date: '2025-03-01', price: 0 },
      { date: '2025-03-15', price: 0 },
      { date: '2025-04-01', price: 0 },
      { date: '2025-04-15', price: 200 },
      { date: '2025-05-01', price: 150 },
    ],
    forecastedPrices: [
      { date: '2025-05-15', price: 140 },
      { date: '2025-06-01', price: 170 },
      { date: '2025-06-15', price: 190 },
      { date: '2025-07-01', price: 0 },
      { date: '2025-07-15', price: 0 },
    ],
    priceFactors: [
      { 
        factor: 'Short Season', 
        impact: 'positive', 
        description: 'Litchi has a very short season, prices will rise toward the end'
      },
      { 
        factor: 'Weather Impact', 
        impact: 'neutral', 
        description: 'Weather conditions have been average for litchi cultivation'
      },
      { 
        factor: 'High Demand', 
        impact: 'positive', 
        description: 'Increasing demand as the season progresses'
      },
    ],
    supplyStatus: 'medium',
    demandStatus: 'high',
    bestTimeToBuy: 'Now',
    image: 'https://images.pexels.com/photos/5945782/pexels-photo-5945782.jpeg'
  },
  {
    id: '3',
    name: 'Jackfruit',
    nameBn: 'কাঁঠাল',
    currentPrice: 300,
    priceHistory: [
      { date: '2025-03-01', price: 400 },
      { date: '2025-03-15', price: 380 },
      { date: '2025-04-01', price: 350 },
      { date: '2025-04-15', price: 320 },
      { date: '2025-05-01', price: 300 },
    ],
    forecastedPrices: [
      { date: '2025-05-15', price: 290 },
      { date: '2025-06-01', price: 270 },
      { date: '2025-06-15', price: 260 },
      { date: '2025-07-01', price: 280 },
      { date: '2025-07-15', price: 320 },
    ],
    priceFactors: [
      { 
        factor: 'Seasonal Availability', 
        impact: 'negative', 
        description: 'Increasing availability as we enter peak season'
      },
      { 
        factor: 'Transportation Issues', 
        impact: 'positive', 
        description: 'Some logistics challenges in certain growing regions'
      },
      { 
        factor: 'Quality Variations', 
        impact: 'neutral', 
        description: 'Mixed quality reports from different regions'
      },
    ],
    supplyStatus: 'medium',
    demandStatus: 'medium',
    bestTimeToBuy: 'Mid-June',
    image: 'https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg'
  },
];

const DynamicPricing: React.FC = () => {
  const [selectedFruit, setSelectedFruit] = useState<PriceTrend | null>(null);
  const [chartData, setChartData] = useState<{dates: string[], prices: number[]}>({dates: [], prices: []});
  
  useEffect(() => {
    // Set the first fruit as default selected
    if (fruitPriceTrends.length > 0 && !selectedFruit) {
      setSelectedFruit(fruitPriceTrends[0]);
    }
  }, []);
  
  useEffect(() => {
    if (selectedFruit) {
      // Combine historical and forecasted prices for the chart
      const combined = [
        ...selectedFruit.priceHistory,
        ...selectedFruit.forecastedPrices
      ].filter(point => point.price > 0); // Filter out zero prices (out of season)
      
      setChartData({
        dates: combined.map(point => {
          const date = new Date(point.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        prices: combined.map(point => point.price)
      });
    }
  }, [selectedFruit]);

  const getSupplyStatusColor = (status: string): string => {
    switch(status) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriceTrend = (): { trend: 'up' | 'down' | 'stable', percentage: number } => {
    if (!selectedFruit) return { trend: 'stable', percentage: 0 };
    
    const latestHistorical = selectedFruit.priceHistory[selectedFruit.priceHistory.length - 1].price;
    const nextForecasted = selectedFruit.forecastedPrices[0].price;
    
    const difference = nextForecasted - latestHistorical;
    const percentage = Math.abs(Math.round((difference / latestHistorical) * 100));
    
    if (difference > 0) return { trend: 'up', percentage };
    if (difference < 0) return { trend: 'down', percentage };
    return { trend: 'stable', percentage: 0 };
  };
  
  const renderPriceChart = () => {
    if (!chartData.dates.length) return null;
    
    const maxPrice = Math.max(...chartData.prices);
    const minPrice = Math.min(...chartData.prices);
    const range = maxPrice - minPrice;
    
    // Find index where forecast begins
    const forecastStartIndex = selectedFruit?.priceHistory.length || 0;
    
    return (
      <div className="h-48 mt-4 relative">
        {/* Y-axis label */}
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-500">
          Price (Tk)
        </div>
        
        {/* Chart */}
        <div className="h-full flex items-end relative border-b border-l border-gray-300">
          {chartData.prices.map((price, index) => {
            const height = range ? ((price - minPrice) / range) * 80 + 10 : 50;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1"
              >
                <div 
                  className={`w-full max-w-[30px] mx-auto rounded-t ${
                    index < forecastStartIndex ? 'bg-blue-500' : 'bg-orange-400'
                  }`} 
                  style={{ height: `${height}%` }}
                ></div>
                <div className={`text-[9px] mt-1 ${index % 2 === 0 ? 'visible' : 'invisible'}`}>
                  {chartData.dates[index]}
                </div>
              </div>
            );
          })}
          
          {/* Divider between historical and forecast */}
          {forecastStartIndex > 0 && (
            <div 
              className="absolute h-full border-r border-dashed border-gray-400" 
              style={{ left: `${(forecastStartIndex / chartData.dates.length) * 100}%` }}
            ></div>
          )}
          
          {/* Legend */}
          <div className="absolute top-2 right-2 flex items-center text-xs">
            <div className="flex items-center mr-3">
              <div className="w-3 h-3 bg-blue-500 mr-1"></div>
              <span>Historical</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-400 mr-1"></div>
              <span>Forecast</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedFruit) return null;
  
  const priceTrend = getPriceTrend();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dynamic Pricing Insights</h2>
          <p className="text-gray-600">
            Our AI analyzes market conditions, seasonal trends, and supply-demand dynamics to predict fruit prices.
            Make informed buying decisions with real-time pricing intelligence.
          </p>
        </div>
        
        {/* Fruit Selection */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {fruitPriceTrends.map(fruit => (
            <button
              key={fruit.id}
              onClick={() => setSelectedFruit(fruit)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFruit?.id === fruit.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {fruit.name}
            </button>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedFruit.nameBn}</h3>
                  <p className="text-gray-600">{selectedFruit.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                  priceTrend.trend === 'down' ? 'bg-green-500' : 
                  priceTrend.trend === 'up' ? 'bg-red-500' : 
                  'bg-gray-500'
                }`}>
                  <div className="flex items-center">
                    {priceTrend.trend === 'down' ? <TrendingDown size={16} className="mr-1" /> : 
                     priceTrend.trend === 'up' ? <TrendingUp size={16} className="mr-1" /> : null}
                    <span>
                      {priceTrend.trend === 'down' ? 'Falling' : 
                       priceTrend.trend === 'up' ? 'Rising' : 
                       'Stable'}
                      {priceTrend.percentage > 0 && ` (${priceTrend.percentage}%)`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">৳{selectedFruit.currentPrice}</span>
                  <span className="ml-1 text-gray-500">/kg</span>
                </div>
                
                {selectedFruit.bestTimeToBuy === 'Now' && (
                  <div className="mt-2 bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm inline-flex items-center">
                    <AlertTriangle size={16} className="mr-1" />
                    Best time to buy is now!
                  </div>
                )}
              </div>
              
              {/* Price Chart */}
              {renderPriceChart()}
            </div>
            
            <div className="bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Market Factors</h4>
              
              <div className="space-y-4">
                {selectedFruit.priceFactors.map((factor, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{factor.factor}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        factor.impact === 'positive' ? 'bg-red-100 text-red-800' : 
                        factor.impact === 'negative' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {factor.impact === 'positive' ? 'Price ↑' : 
                         factor.impact === 'negative' ? 'Price ↓' : 
                         'Neutral'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{factor.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Supply:</span>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-1 ${getSupplyStatusColor(selectedFruit.supplyStatus)}`}></span>
                    <span className="text-sm font-medium capitalize">{selectedFruit.supplyStatus}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Demand:</span>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-1 ${getSupplyStatusColor(selectedFruit.demandStatus)}`}></span>
                    <span className="text-sm font-medium capitalize">{selectedFruit.demandStatus}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best time to buy:</span>
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-500 mr-1" />
                    <span className="text-sm font-medium">{selectedFruit.bestTimeToBuy}</span>
                  </div>
                </div>
              </div>
              
              {selectedFruit.bestTimeToBuy !== 'Now' ? (
                <button className="mt-6 w-full bg-white border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors">
                  Set Price Alert
                </button>
              ) : (
                <button className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Buy Now
                </button>
              )}
            </div>
          </div>
          
          {/* How it works */}
          <div className="border-t border-gray-200 p-6">
            <h4 className="font-semibold text-gray-800 mb-4">How Our Price Prediction Works</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">Historical Data Analysis</p>
                <p className="text-blue-700">We analyze 5+ years of price data across all growing regions</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-medium text-purple-800 mb-1">Real-time Market Monitoring</p>
                <p className="text-purple-700">Our systems track supply chains, weather, and market conditions</p>
              </div>
              
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="font-medium text-teal-800 mb-1">AI Price Forecasting</p>
                <p className="text-teal-700">Machine learning models predict price trends with 85%+ accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricing;