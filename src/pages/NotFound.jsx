import React from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '../components/StarIcon';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 px-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <StarIcon className="text-blue-500" size={32} />
          <h1 className="text-6xl font-bold text-white mx-4">404</h1>
          <StarIcon className="text-red-500" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link 
            to="/elections" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Election Data
          </Link>
          
          <div className="flex justify-center space-x-4 mt-4">
            <Link 
              to="/evpropulsion" 
              className="text-blue-400 hover:text-blue-300"
            >
              EV Propulsion Data
            </Link>
            <Link 
              to="/bordercrossings" 
              className="text-blue-400 hover:text-blue-300"
            >
              Border Crossings Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 