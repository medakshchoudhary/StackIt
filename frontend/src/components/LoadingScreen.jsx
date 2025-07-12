import React from 'react';
import { Brain, Sparkles, Zap } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center z-50">
      <div className="text-center p-4 sm:p-6 lg:p-8 max-w-md mx-auto">
        {/* Animated Logo */}
        <div className="relative mb-6 sm:mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 sm:p-6 lg:p-8 shadow-2xl animate-float">
              <Brain className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
          </div>
          
          {/* Floating decorative elements */}
          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3">
            <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
        
        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-4">
          StackIt
        </h1>
        
        {/* Loading Message */}
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
          {message}
        </p>
        
        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2 sm:space-x-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 sm:mt-8 w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
