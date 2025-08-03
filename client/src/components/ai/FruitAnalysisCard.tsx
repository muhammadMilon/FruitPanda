import React from 'react';
import { Check, AlertTriangle, Info, Star, Leaf, Clock } from 'lucide-react';

interface AnalysisResult {
  fruitName: string;
  fruitNameBn: string;
  ripeness: 'unripe' | 'ripe' | 'overripe';
  freshness: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  defects: string[];
  suggestedUses: string[];
  nutritionalInfo: {
    calories: number;
    vitamins: string[];
    benefits: string[];
  };
  storageAdvice: string;
  confidence: number;
}

interface FruitAnalysisCardProps {
  result: AnalysisResult;
  onShopClick: () => void;
}

const FruitAnalysisCard: React.FC<FruitAnalysisCardProps> = ({ result, onShopClick }) => {
  const getQualityColor = (quality: string) => {
    switch(quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-green-500 bg-green-50';
      case 'fair': return 'text-yellow-500 bg-yellow-50';
      case 'poor': return 'text-red-500 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRipenessInfo = (ripeness: string) => {
    switch(ripeness) {
      case 'ripe': 
        return { 
          text: 'Perfect to eat now', 
          color: 'text-green-600 bg-green-100', 
          icon: Check 
        };
      case 'unripe': 
        return { 
          text: 'Not ready yet, wait a few days', 
          color: 'text-yellow-600 bg-yellow-100', 
          icon: Clock 
        };
      case 'overripe': 
        return { 
          text: 'Best used in cooking or smoothies', 
          color: 'text-orange-600 bg-orange-100', 
          icon: AlertTriangle 
        };
      default: 
        return { 
          text: 'Unknown ripeness', 
          color: 'text-gray-600 bg-gray-100', 
          icon: Info 
        };
    }
  };

  const ripenessInfo = getRipenessInfo(result.ripeness);
  const IconComponent = ripenessInfo.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{result.fruitNameBn}</h2>
          <p className="text-gray-600">{result.fruitName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(result.quality)}`}>
          {result.quality.charAt(0).toUpperCase() + result.quality.slice(1)} Quality
        </div>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">AI Confidence:</span>
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(result.confidence / 20)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 font-medium">{result.confidence}%</span>
        </div>
      </div>

      {/* Freshness Score */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Freshness Score</span>
          <span className="text-sm font-bold">{result.freshness}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              result.freshness >= 80 ? 'bg-green-500' :
              result.freshness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.freshness}%` }}
          ></div>
        </div>
      </div>
      
      {/* Ripeness Status */}
      <div className={`flex items-center p-4 rounded-lg ${ripenessInfo.color}`}>
        <IconComponent size={20} className="mr-3" />
        <div>
          <p className="font-medium capitalize">{result.ripeness}</p>
          <p className="text-sm">{ripenessInfo.text}</p>
        </div>
      </div>

      {/* Defects */}
      {result.defects.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <AlertTriangle size={16} className="mr-2 text-orange-500" />
            Detected Issues
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 bg-orange-50 p-3 rounded-lg">
            {result.defects.map((defect, index) => (
              <li key={index}>{defect}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Suggested Uses */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Recommended Uses</h4>
        <div className="flex flex-wrap gap-2">
          {result.suggestedUses.map((use, index) => (
            <span 
              key={index} 
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
            >
              {use}
            </span>
          ))}
        </div>
      </div>

      {/* Nutritional Information */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Leaf size={16} className="mr-2 text-green-600" />
          Nutritional Information
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Calories (per 100g):</span>
            <span className="font-medium">{result.nutritionalInfo.calories}</span>
          </div>
          <div>
            <span className="text-gray-600">Key Vitamins:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.nutritionalInfo.vitamins.map((vitamin, index) => (
                <span key={index} className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                  {vitamin}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Health Benefits:</span>
            <ul className="list-disc list-inside mt-1 text-gray-700">
              {result.nutritionalInfo.benefits.map((benefit, index) => (
                <li key={index} className="text-xs">{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Storage Advice */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center">
          <Info size={16} className="mr-2 text-yellow-600" />
          Storage Advice
        </h4>
        <p className="text-sm text-gray-700">{result.storageAdvice}</p>
      </div>
      
      {/* Action Button */}
      <button
        onClick={onShopClick}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
      >
        Shop {result.fruitName}
      </button>
    </div>
  );
};

export default FruitAnalysisCard;