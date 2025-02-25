import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '../components/StarIcon';

const HomePage = () => {
  // Set specific title for the homepage
  useEffect(() => {
    document.title = "US Data Explorer | Interactive Data Visualizations";
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-gray-400 text-sm">data.lukekabbash.com</span>
            </div>
            <div>
              <a 
                href="https://lukekabbash.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                By Luke Kabbash
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="py-8 max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <StarIcon className="text-blue-500" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold text-white mx-6">US Data Explorer</h1>
            <StarIcon className="text-red-500" size={48} />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            An interactive platform for exploring and visualizing various US government datasets
          </p>
          <div className="mt-4 inline-block bg-yellow-600/20 border border-yellow-500/30 rounded-lg px-4 py-2">
            <span className="text-yellow-500 font-medium">
              🚧 Work in Progress - Development Preview 🚧
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-12">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
            <p className="text-gray-300 mb-4">
              US Data Explorer is my passion project to transform fascinating but often inaccessible government data into interactive, 
              engaging visualizations that anyone can explore and understand. I'm creating this platform because I believe that public 
              data should be truly public – not just available, but accessible, meaningful, and actually interesting to engage with!
            </p>
            <p className="text-gray-300 mb-6">
              This project serves multiple purposes: it showcases my coding and data visualization skills while building something genuinely 
              useful for the public. My vision is to eventually expand this into a comprehensive dashboard that brings together diverse datasets 
              in ways that reveal insights that might otherwise remain hidden in endless spreadsheets and database tables.
            </p>
            
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6">
              <div className="flex items-center text-yellow-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Development Status</span>
              </div>
              <p className="text-gray-300">
                This application is currently under active development as a proof of concept. 
                Features may be incomplete, data processing might be limited, and the UI is still evolving. 
                I'm constantly adding new datasets and visualization tools to make this an ever more valuable resource.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Available Data Explorations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Elections Data */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-colors">
            <div className="p-6 h-full flex flex-col items-center text-center">
              <div className="flex flex-col items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Elections Data</h3>
              </div>
              <p className="text-gray-300 mb-6 flex-grow">
                Explore historical US election data with interactive visualizations, including geographic maps, 
                trend analysis, and comparative studies of electoral outcomes across different races.
              </p>
              <div className="mt-auto">
                <Link 
                  to="/elections" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Explore Elections Data
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* EV Propulsion */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-green-500/50 transition-colors">
            <div className="p-6 h-full flex flex-col items-center text-center">
              <div className="flex flex-col items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">EV Propulsion</h3>
              </div>
              <p className="text-gray-300 mb-6 flex-grow">
                Visualize electric vehicle data (across Washington State only,) including geographic distribution, 
                vehicle type analysis, model comparisons, and trends in battery range evolution over time.
              </p>
              <div className="mt-auto">
                <Link 
                  to="/evpropulsion" 
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Explore WA EV Data
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Border Crossings - with new icon */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-colors">
            <div className="p-6 h-full flex flex-col items-center text-center">
              <div className="flex flex-col items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Border Crossings</h3>
              </div>
              <p className="text-gray-300 mb-6 flex-grow">
                Analyze US legal border crossing data with interactive tools for geographic visualization, 
                breakdown by transportation mode, and trends over time at ports of entry along 
                both the Canadian and Mexican borders.
              </p>
              <div className="mt-auto">
                <Link 
                  to="/bordercrossings" 
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Explore Border Data
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 flex items-start">
              <div className="rounded-full bg-purple-500/20 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Census Data Explorer</h3>
                <p className="text-gray-400 text-sm">Demographic insights from the US Census Bureau.</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 flex items-start">
              <div className="rounded-full bg-pink-500/20 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Economic Indicators</h3>
                <p className="text-gray-400 text-sm">Visualizations of US economic data and trends.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-800 pt-6">
          <p className="text-gray-500 text-sm">
            Developed by <a href="https://lukekabbash.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Luke Kabbash </a> 
              as a coding and data visualization portfolio project
          </p>
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            <span className="text-gray-600 text-xs">Using React + TailwindCSS</span>
            <span className="text-gray-600 text-xs">Data from public US government sources</span>
            <a href="https://lukekabbash.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 text-xs">
              Visit lukekabbash.com
            </a>
            <a href="https://www.eveos.space" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 text-xs">
              Check out eveos.space
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 