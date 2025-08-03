import React, { useState } from 'react';
import { Calendar, ArrowLeft, ArrowRight, Info } from 'lucide-react';

interface FruitSeason {
  id: string;
  name: string;
  englishName: string;
  seasonStart: number; // 1-12 for months
  seasonEnd: number; // 1-12 for months
  peakMonth: number; // 1-12 for peak month
  image: string;
  currentPrice: number;
  predictedPrice: number;
  availability: 'high' | 'medium' | 'low' | 'none';
  region: string[];
}

const fruitSeasons: FruitSeason[] = [
  {
    id: '1',
    name: 'আম',
    englishName: 'Mango',
    seasonStart: 4, // April
    seasonEnd: 7, // July
    peakMonth: 5, // May
    image: 'https://images.pexels.com/photos/26672466/pexels-photo-26672466.jpeg',
    currentPrice: 120,
    predictedPrice: 100,
    availability: 'high',
    region: ['Rajshahi', 'Chapainawabganj', 'Dinajpur']
  },
  {
    id: '2',
    name: 'কাঁঠাল',
    englishName: 'Jackfruit',
    seasonStart: 3, // March
    seasonEnd: 8, // August
    peakMonth: 6, // June
    image: 'https://images.pexels.com/photos/12577516/pexels-photo-12577516.jpeg',
    currentPrice: 300,
    predictedPrice: 350,
    availability: 'medium',
    region: ['Dhaka', 'Mymensingh']
  },
  {
    id: '3',
    name: 'লিচু',
    englishName: 'Litchi',
    seasonStart: 5, // May
    seasonEnd: 6, // June
    peakMonth: 5, // May
    image: 'https://images.pexels.com/photos/17201891/pexels-photo-17201891.jpeg',
    currentPrice: 150,
    predictedPrice: 180,
    availability: 'medium',
    region: ['Dinajpur', 'Rangpur']
  },
  {
    id: '4',
    name: 'পেঁপে',
    englishName: 'Papaya',
    seasonStart: 1, // January
    seasonEnd: 12, // December
    peakMonth: 7, // July
    image: 'https://images.pexels.com/photos/5507722/pexels-photo-5507722.jpeg',
    currentPrice: 60,
    predictedPrice: 55,
    availability: 'high',
    region: ['Nationwide']
  },
  {
    id: '5',
    name: 'আনারস',
    englishName: 'Pineapple',
    seasonStart: 5, // May
    seasonEnd: 8, // August
    peakMonth: 6, // June
    image: 'https://images.pexels.com/photos/2469772/pexels-photo-2469772.jpeg',
    currentPrice: 90,
    predictedPrice: 80,
    availability: 'medium',
    region: ['Rangamati', 'Khagrachari', 'Sylhet']
  },
  {
    id: '6',
    name: 'জাম',
    englishName: 'Blackberry',
    seasonStart: 5, // May
    seasonEnd: 7, // July
    peakMonth: 6, // June
    image: 'https://images.pexels.com/photos/134581/blackberries-bramble-berries-bush-134581.jpeg',
    currentPrice: 110,
    predictedPrice: 120,
    availability: 'low',
    region: ['Rajshahi', 'Dhaka']
  },
  {
    id: '7',
    name: 'বেল',
    englishName: 'Wood Apple',
    seasonStart: 3, // March
    seasonEnd: 6, // June
    peakMonth: 4, // April
    image: 'https://images.pexels.com/photos/33166863/pexels-photo-33166863.jpeg',
    currentPrice: 40,
    predictedPrice: 35,
    availability: 'high',
    region: ['Chittagong', 'Cox\'s Bazar']
  },
  {
    id: '8',
    name: 'কুল',
    englishName: 'Kul Boroi',
    seasonStart: 8, // August
    seasonEnd: 10, // October
    peakMonth: 9, // September
    image: 'https://images.pexels.com/photos/33030027/pexels-photo-33030027.jpeg',
    currentPrice: 30,
    predictedPrice: 25,
    availability: 'medium',
    region: ['Sylhet', 'Moulvibazar']
  },
  {
    id: '9',
    name: 'পেয়ারা',
    englishName: 'Guava',
    seasonStart: 6, // June
    seasonEnd: 10, // October
    peakMonth: 8, // August
    image: 'https://images.pexels.com/photos/5945791/pexels-photo-5945791.jpeg',
    currentPrice: 50,
    predictedPrice: 45,
    availability: 'high',
    region: ['Barisal', 'Khulna']
  }
  
];

const SeasonalForecast: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedFruit, setSelectedFruit] = useState<FruitSeason | null>(null);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getFruitsInSeason = (month: number): FruitSeason[] => {
    return fruitSeasons.filter(fruit => {
      if (fruit.seasonStart <= fruit.seasonEnd) {
        return month >= fruit.seasonStart && month <= fruit.seasonEnd;
      } else {
        // For fruits that span across year end (e.g., Dec to Feb)
        return month >= fruit.seasonStart || month <= fruit.seasonEnd;
      }
    });
  };
  
  const getUpcomingFruits = (month: number): FruitSeason[] => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const followingMonth = nextMonth === 12 ? 1 : nextMonth + 1;
    
    return fruitSeasons.filter(fruit => {
      // Fruits that start in the next two months but aren't currently in season
      const isInSeason = fruit.seasonStart <= fruit.seasonEnd 
        ? month >= fruit.seasonStart && month <= fruit.seasonEnd
        : month >= fruit.seasonStart || month <= fruit.seasonEnd;
        
      const startsInNextTwoMonths = 
        fruit.seasonStart === nextMonth || 
        fruit.seasonStart === followingMonth;
        
      return !isInSeason && startsInNextTwoMonths;
    });
  };

  const getAvailabilityColor = (availability: 'high' | 'medium' | 'low' | 'none'): string => {
    switch(availability) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      case 'none': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriceChangeIndicator = (current: number, predicted: number) => {
    const diff = predicted - current;
    if (diff > 0) {
      return <span className="text-red-500">↑ {Math.abs(diff)} Tk</span>;
    } else if (diff < 0) {
      return <span className="text-green-500">↓ {Math.abs(diff)} Tk</span>;
    } else {
      return <span className="text-gray-500">→ Stable</span>;
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev === 1 ? 12 : prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev === 12 ? 1 : prev + 1);
  };

  const fruitsInSeason = getFruitsInSeason(currentMonth);
  const upcomingFruits = getUpcomingFruits(currentMonth);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Seasonal Fruit Forecast</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover which fruits are currently in season, when your favorites will be available, and get AI-powered price predictions.
        </p>
      </div>

      {/* Month Selector */}
      <div className="flex justify-center items-center mb-8">
        <button 
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center mx-4">
          <Calendar className="mr-2 text-green-600" />
          <h2 className="text-xl font-semibold">{months[currentMonth - 1]}</h2>
        </div>
        <button 
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Fruits in Season */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-green-700 flex items-center">
          <span className="inline-block w-3 h-3 bg-green-700 rounded-full mr-2"></span>
          Currently in Season
        </h2>
        
        {fruitsInSeason.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No fruits are in season this month</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fruitsInSeason.map(fruit => (
              <div 
                key={fruit.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedFruit(fruit)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={fruit.image} 
                    alt={fruit.englishName} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{fruit.name}</h3>
                      <p className="text-gray-600">{fruit.englishName}</p>
                    </div>
                    <div className={`${getAvailabilityColor(fruit.availability)} text-white text-xs px-2 py-1 rounded-full`}>
                      {fruit.availability === 'high' ? 'Peak Season' : 
                       fruit.availability === 'medium' ? 'Available' : 
                       fruit.availability === 'low' ? 'Limited' : 'Unavailable'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Price</p>
                      <p className="font-semibold">৳{fruit.currentPrice}/kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Forecast</p>
                      <p className="font-semibold flex items-center justify-end">
                        {getPriceChangeIndicator(fruit.currentPrice, fruit.predictedPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Fruits */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-orange-700 flex items-center">
          <span className="inline-block w-3 h-3 bg-orange-700 rounded-full mr-2"></span>
          Coming Soon
        </h2>
        
        {upcomingFruits.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No upcoming fruits in the next two months</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFruits.map(fruit => (
              <div 
                key={fruit.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => setSelectedFruit(fruit)}
              >
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  Coming in {months[fruit.seasonStart - 1]}
                </div>
                <div className="h-48 overflow-hidden">
                  <img 
                    src={fruit.image} 
                    alt={fruit.englishName} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform filter grayscale hover:grayscale-0"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{fruit.name}</h3>
                  <p className="text-gray-600">{fruit.englishName}</p>
                  
                  <button className="mt-4 w-full py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium flex items-center justify-center">
                    <Calendar className="mr-2" size={16} />
                    Set Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Year-round Calendar View */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Annual Fruit Calendar</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-gray-700">Fruit</th>
                {months.map((month, index) => (
                  <th 
                    key={index} 
                    className={`py-3 px-4 text-center text-sm ${currentMonth === index + 1 ? 'bg-green-100' : ''}`}
                  >
                    {month.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fruitSeasons.map(fruit => (
                <tr key={fruit.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center">
                      <img 
                        src={fruit.image} 
                        alt={fruit.englishName} 
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                      <span>{fruit.englishName}</span>
                    </div>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                    // Determine the cell color based on availability
                    let cellClass = '';
                    if (fruit.seasonStart <= fruit.seasonEnd) {
                      if (month >= fruit.seasonStart && month <= fruit.seasonEnd) {
                        cellClass = month === fruit.peakMonth ? 'bg-green-500' : 'bg-green-200';
                      }
                    } else {
                      // For fruits that span across year end
                      if (month >= fruit.seasonStart || month <= fruit.seasonEnd) {
                        cellClass = month === fruit.peakMonth ? 'bg-green-500' : 'bg-green-200';
                      }
                    }
                    
                    return (
                      <td 
                        key={month} 
                        className={`py-3 px-4 text-center ${cellClass} ${currentMonth === month ? 'border-2 border-blue-500' : ''}`}
                      >
                        {month === fruit.peakMonth && <span className="h-2 w-2 bg-white rounded-full inline-block"></span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <Info size={16} className="mr-1" />
          <span>
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1 ml-2"></span> Peak Season
            <span className="inline-block w-3 h-3 bg-green-200 rounded-full mr-1 ml-2"></span> Available
          </span>
        </div>
      </div>

      {/* Fruit Detail Modal */}
      {selectedFruit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedFruit.image} 
                alt={selectedFruit.englishName} 
                className="w-full h-64 object-cover"
              />
              <button 
                onClick={() => setSelectedFruit(null)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedFruit.name}</h2>
                  <p className="text-lg text-gray-600">{selectedFruit.englishName}</p>
                </div>
                <div className={`${getAvailabilityColor(selectedFruit.availability)} text-white px-3 py-1 rounded-full`}>
                  {selectedFruit.availability === 'high' ? 'Peak Season' : 
                   selectedFruit.availability === 'medium' ? 'Available' : 
                   selectedFruit.availability === 'low' ? 'Limited' : 'Unavailable'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Season Information</h3>
                  <p className="mb-1">
                    <span className="text-gray-600">Season:</span> {months[selectedFruit.seasonStart - 1]} to {months[selectedFruit.seasonEnd - 1]}
                  </p>
                  <p className="mb-1">
                    <span className="text-gray-600">Peak Month:</span> {months[selectedFruit.peakMonth - 1]}
                  </p>
                  <p>
                    <span className="text-gray-600">Growing Regions:</span> {selectedFruit.region.join(', ')}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Price Forecast</h3>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <span className="text-gray-600">Current Price</span>
                    <span className="font-bold">৳{selectedFruit.currentPrice}/kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Predicted Next Month</span>
                    <div className="font-bold flex items-center">
                      ৳{selectedFruit.predictedPrice}/kg 
                      <span className="ml-2">{getPriceChangeIndicator(selectedFruit.currentPrice, selectedFruit.predictedPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Order Now
                </button>
                <button className="bg-white border border-green-600 text-green-600 hover:bg-green-50 py-2 px-4 rounded-lg transition-colors">
                  Set Availability Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalForecast;