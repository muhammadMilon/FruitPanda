import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, StopCircle, MessageCircle, Bot, User as UserIcon, Loader } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  typing?: boolean;
}

interface AIAssistantProps {
  show: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ show, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'হ্যালো! আমি ফ্রুট পান্ডার সহকারী। আপনাকে কীভাবে সাহায্য করতে পারি? (Hello! I am Fruit Panda Assistant. How can I help you?)',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample quick suggestions
  const suggestions = [
    'What fruits are in season now?',
    'How to check fruit quality?',
    'Delivery options',
    'Payment methods',
    'Best time to buy mangoes',
    'Organic fruit availability',
    'Bulk order discounts',
    'Fruit storage tips',
    'Return policy',
    'Subscription plans',
    'Fruit nutrition facts',
    'Gift packages'
  ];

  // Knowledge base for AI responses
  const knowledgeBase = {
    seasonal: {
      keywords: ['season', 'seasonal', 'when', 'available', 'time'],
      responses: [
        'Currently in season: Mango, Jackfruit, and Litchi. Coming soon: Pineapple and Dragon fruit!',
        'Right now we have fresh seasonal mangoes, litchis, and jackfruits. Summer fruits are at their peak!',
        'The best seasonal fruits available now are mangoes from Rajshahi, litchis from Dinajpur, and jackfruits from Mymensingh.'
      ]
    },
    delivery: {
      keywords: ['delivery', 'shipping', 'deliver', 'send', 'transport'],
      responses: [
        'We deliver all across Dhaka within 24 hours, and to other major cities within 48 hours. Free delivery on orders above ৳1000!',
        'Same-day delivery available in Dhaka city. Next-day delivery for other areas. We use temperature-controlled vehicles.',
        'Delivery is available 7 days a week. Order before 2 PM for same-day delivery in Dhaka.'
      ]
    },
    payment: {
      keywords: ['payment', 'pay', 'money', 'cost', 'price', 'bkash', 'nagad'],
      responses: [
        'We accept bKash, Nagad, credit cards, and cash on delivery. All payments are secure and encrypted.',
        'Payment options: Mobile banking (bKash, Nagad), Credit/Debit cards, and Cash on Delivery.',
        'You can pay using bKash, Nagad, any major credit card, or choose cash on delivery option.'
      ]
    },
    quality: {
      keywords: ['quality', 'fresh', 'good', 'check', 'scanner', 'ripe'],
      responses: [
        'All our fruits are verified for quality. Try our fruit scanner feature to check fruit freshness yourself!',
        'We have strict quality control. Each fruit is inspected before delivery. Use our AI fruit scanner to verify quality.',
        'Quality guaranteed! Our farmers are verified and all fruits undergo quality checks. 100% satisfaction or money back.'
      ]
    },
    mango: {
      keywords: ['mango', 'aam', 'আম', 'himsagar', 'langra'],
      responses: [
        'Our mangoes are from Rajshahi - the best variety including Himsagar and Langra. Currently ৳120/kg with peak season pricing.',
        'Fresh Rajshahi mangoes available! Himsagar variety is especially sweet this season. Perfect ripeness guaranteed.',
        'Mango season is at its peak! We have premium Himsagar and Langra varieties from certified Rajshahi farms.'
      ]
    },
    price: {
      keywords: ['price', 'cost', 'expensive', 'cheap', 'discount', 'offer'],
      responses: [
        'Our prices are competitive and fair to farmers. Current prices: Mango ৳120/kg, Litchi ৳150/kg, Jackfruit ৳300/piece.',
        'We offer the best prices with quality guarantee. Check our dynamic pricing page for real-time price predictions.',
        'Prices vary by season and quality. We have special discounts for bulk orders and subscription plans.'
      ]
    },
    organic: {
      keywords: ['organic', 'natural', 'pesticide', 'chemical', 'safe'],
      responses: [
        'Yes! We have certified organic fruits from verified organic farms. Look for the "Organic" label on products.',
        'Our organic fruits are grown without harmful pesticides. All organic produce is certified and clearly marked.',
        'Organic options available for most fruits. These are grown using natural methods and are completely safe.'
      ]
    },
    return: {
      keywords: ['return', 'refund', 'exchange', 'damaged', 'bad', 'spoiled'],
      responses: [
        'We have a 100% satisfaction guarantee! If you\'re not happy with your fruits, we\'ll replace or refund within 24 hours.',
        'Returns accepted within 24 hours of delivery. Damaged or spoiled fruits will be replaced immediately.',
        'Quality guaranteed! If fruits arrive damaged or not as described, we\'ll provide a full refund or replacement.'
      ]
    },
    subscription: {
      keywords: ['subscription', 'weekly', 'monthly', 'regular', 'plan'],
      responses: [
        'We offer weekly and monthly subscription plans with 15% discount. Get fresh fruits delivered regularly!',
        'Subscribe to our fruit boxes and save 15%. Choose from weekly or monthly delivery options.',
        'Subscription plans available! Weekly boxes at ৳800/month or monthly boxes at ৳1500/month with premium fruits.'
      ]
    },
    nutrition: {
      keywords: ['nutrition', 'vitamin', 'healthy', 'calories', 'benefits'],
      responses: [
        'All our fruits are rich in vitamins and minerals. Mangoes are high in Vitamin C, litchis contain antioxidants.',
        'Our fruits are packed with nutrients! Check our product pages for detailed nutrition information.',
        'Fresh fruits are excellent sources of vitamins, fiber, and antioxidants. Perfect for a healthy diet!'
      ]
    },
    gift: {
      keywords: ['gift', 'present', 'package', 'basket', 'special'],
      responses: [
        'We offer beautiful gift packages starting from ৳500. Perfect for birthdays, anniversaries, or special occasions.',
        'Gift packages available with premium fruits and elegant packaging. Prices range from ৳500 to ৳2000.',
        'Surprise your loved ones with our fruit gift baskets! Customizable packages with premium seasonal fruits.'
      ]
    },
    default: [
      'Thank you for your question! I\'m here to help with anything related to fruits, orders, delivery, or our services.',
      'I\'d be happy to help you with that! Could you please provide more details about what you\'re looking for?',
      'Great question! Let me help you find the information you need about our fresh fruits and services.',
      'I\'m here to assist you with all your fruit shopping needs. What specific information would you like?'
    ]
  };

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, show]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check each category in knowledge base
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (category === 'default') continue;
      
      const categoryData = data as { keywords: string[], responses: string[] };
      if (categoryData.keywords.some(keyword => lowerMessage.includes(keyword))) {
        const randomIndex = Math.floor(Math.random() * categoryData.responses.length);
        return categoryData.responses[randomIndex];
      }
    }
    
    // Default response
    const randomIndex = Math.floor(Math.random() * knowledgeBase.default.length);
    return knowledgeBase.default[randomIndex];
  };

  const simulateTyping = async (responseText: string) => {
    setIsTyping(true);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      text: '',
      sender: 'assistant',
      timestamp: new Date(),
      typing: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Remove typing indicator and add actual response
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.typing);
      return [...filtered, {
        id: Date.now().toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
      }];
    });
    
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Get AI response
    const responseText = getAIResponse(currentInput);
    
    // Simulate typing
    await simulateTyping(responseText);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setInput('I want to order seasonal fruits');
      }, 2000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      ></div>
      
      {/* Chat Window */}
      <div className="absolute bottom-4 right-4 w-96 md:w-[450px] h-[700px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-medium">Fruit Panda Assistant</h3>
              <p className="text-xs text-green-100">Online • Ready to help</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-green-500 text-white ml-2' 
                    : 'bg-white border-2 border-green-200 text-green-600 mr-2'
                }`}>
                  {message.sender === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-lg px-3 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-green-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {message.typing ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce\" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">typing...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Suggestions */}
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-2">Quick Questions:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col gap-3">
            {/* Text Input */}
            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                rows={3}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                style={{ minHeight: '80px', maxHeight: '120px' }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceRecording}
                  disabled={isLoading}
                  className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Voice Input"
                >
                  {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                </button>
                
                <button
                  onClick={() => setInput('')}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Clear Message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  input.trim() && !isLoading
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span className="text-sm">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span className="text-sm">Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;