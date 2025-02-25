import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarIcon from '../components/StarIcon';
import { parseCSV } from '../utils/dataUtils';
import EVMapVisualization from '../components/EVMapVisualization';
import EVTypeBreakdown from '../components/EVTypeBreakdown';
import EVModelComparison from '../components/EVModelComparison';
import EVRangeByYear from '../components/EVRangeByYear';

const EVPropulsionApp = () => {
  const { view } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(view || 'overview');
  const [evData, setEvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update URL when view changes
  useEffect(() => {
    if (activeView && activeView !== view) {
      navigate(`/evpropulsion/${activeView}`, { replace: true });
    }
  }, [activeView, view, navigate]);

  // Load EV data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Electric_Vehicle_Population_Data.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        // Custom parsing for EV data
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const records = [];
        // Process all records instead of just 10,000
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length === headers.length) {
            const record = {};
            headers.forEach((header, index) => {
              record[header] = values[index]?.trim() || '';
            });
            records.push(record);
          }
        }
        
        setEvData(records);
        setLoading(false);
      } catch (error) {
        console.error('Error loading EV data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process data for charts
  const processedData = useMemo(() => {
    if (!evData) return null;

    // Count vehicles by make
    const makeCount = {};
    evData.forEach(vehicle => {
      const make = vehicle.Make || 'Unknown';
      makeCount[make] = (makeCount[make] || 0) + 1;
    });

    // Count vehicles by type
    const typeCount = {};
    evData.forEach(vehicle => {
      const type = vehicle['Electric Vehicle Type'] || 'Unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Count vehicles by model year
    const yearCount = {};
    evData.forEach(vehicle => {
      const year = vehicle['Model Year'] || 'Unknown';
      if (year && year !== 'Unknown' && !isNaN(parseInt(year))) {
        yearCount[year] = (yearCount[year] || 0) + 1;
      }
    });

    // Count vehicles by location (county)
    const countyCount = {};
    evData.forEach(vehicle => {
      const county = vehicle.County || 'Unknown';
      countyCount[county] = (countyCount[county] || 0) + 1;
    });

    return {
      byMake: Object.entries(makeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15),
      byType: Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1]),
      byYear: Object.entries(yearCount)
        .sort((a, b) => a[0].localeCompare(b[0])),
      byCounty: Object.entries(countyCount)
        .sort((a, b) => b[1] - a[1])
    };
  }, [evData]);

  // Handle share button click
  const handleShareClick = () => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          prompt('Copy this link to share:', url);
        });
    } else {
      prompt('Copy this link to share:', url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!evData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-gray-400">No EV data available</div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="flex items-center justify-center text-4xl font-bold text-white mb-2 space-x-4">
          <StarIcon className="text-green-500" size={32} />
          <span>EV Propulsion Data Explorer</span>
          <StarIcon className="text-green-500" size={32} />
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Explore electric vehicle propulsion data from Washington State.
          This dataset includes information on electric vehicles registered in Washington State.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Data sourced from the Washington State Department of Licensing
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2 flex-wrap mb-6">
        <button
          onClick={handleShareClick}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'overview' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'map-view' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('map-view')}
        >
          Geographic Map
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'type-breakdown' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('type-breakdown')}
        >
          Type Analysis
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'model-comparison' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('model-comparison')}
        >
          Model Comparison
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'range-by-year' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('range-by-year')}
        >
          Range Evolution
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'by-manufacturer' 
              ? 'text-green-500 border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('by-manufacturer')}
        >
          By Manufacturer
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Overview */}
        {activeView === 'overview' && (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Electric Vehicle Data Overview</h2>
              <p className="text-gray-300 mb-6">
                This dataset contains information on {evData.length.toLocaleString()} electric vehicles registered in Washington State.
                The data includes details on vehicle make, model, type, range, and location.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Total Vehicles</h3>
                  <p className="text-3xl font-bold text-white">{evData.length.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-2">Electric vehicles in dataset</p>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Top Manufacturer</h3>
                  <p className="text-3xl font-bold text-white">{processedData.byMake[0][0]}</p>
                  <p className="text-gray-400 text-sm mt-2">{processedData.byMake[0][1].toLocaleString()} vehicles</p>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Vehicle Types</h3>
                  <p className="text-3xl font-bold text-white">{processedData.byType.length}</p>
                  <p className="text-gray-400 text-sm mt-2">Different propulsion types</p>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Top County</h3>
                  <p className="text-3xl font-bold text-white">{processedData.byCounty[0][0]}</p>
                  <p className="text-gray-400 text-sm mt-2">{processedData.byCounty[0][1].toLocaleString()} vehicles</p>
                </div>
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">Available Visualizations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('map-view')}
                  >
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Geographic Map</h4>
                    <p className="text-gray-300 text-sm">Explore the distribution of electric vehicles across Washington state on an interactive map.</p>
                  </div>
                  
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('type-breakdown')}
                  >
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Vehicle Type Analysis</h4>
                    <p className="text-gray-300 text-sm">Filter and analyze electric vehicles by type, make, model year, and electric range.</p>
                  </div>
                  
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('model-comparison')}
                  >
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Model Comparison</h4>
                    <p className="text-gray-300 text-sm">Compare multiple electric vehicle models by popularity, range, and other metrics.</p>
                  </div>
                  
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('range-by-year')}
                  >
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Range Evolution</h4>
                    <p className="text-gray-300 text-sm">Analyze how electric vehicle range has evolved over time, with year-by-year comparisons.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Map View */}
        {activeView === 'map-view' && (
          <EVMapVisualization evData={evData} />
        )}
        
        {/* Type Breakdown */}
        {activeView === 'type-breakdown' && (
          <EVTypeBreakdown evData={evData} />
        )}
        
        {/* Model Comparison */}
        {activeView === 'model-comparison' && (
          <EVModelComparison evData={evData} />
        )}
        
        {/* Range By Year */}
        {activeView === 'range-by-year' && (
          <EVRangeByYear evData={evData} />
        )}
        
        {/* Manufacturer Breakdown */}
        {activeView === 'by-manufacturer' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">EV Distribution by Manufacturer</h2>
            <div className="overflow-hidden">
              <div className="mt-6 space-y-3">
                {processedData.byMake.map(([make, count]) => (
                  <div key={make} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm text-gray-300">{make}</div>
                      <div className="text-sm text-green-400">
                        {count.toLocaleString()} ({Math.round((count / evData.length) * 100)}%)
                      </div>
                    </div>
                    <div className="h-5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full flex items-center pl-3"
                        style={{ width: `${Math.max(2, (count / processedData.byMake[0][1]) * 100)}%` }}
                      >
                        {count > processedData.byMake[0][1] / 10 && (
                          <span className="text-xs text-white font-medium">
                            {count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EVPropulsionApp; 