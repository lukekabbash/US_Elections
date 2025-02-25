import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarIcon from '../components/StarIcon';
import { parseCSV } from '../utils/dataUtils';
import BorderMapVisualization from '../components/BorderMapVisualization';
import BorderMeasureAnalysis from '../components/BorderMeasureAnalysis';
import BorderTrendsAnalysis from '../components/BorderTrendsAnalysis';

const BorderCrossingsApp = () => {
  const { view } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(view || 'overview');
  const [borderData, setBorderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set the document title for this section
  useEffect(() => {
    document.title = "US Data Explorer | Border Crossings";
  }, []);

  // Update URL when view changes
  useEffect(() => {
    if (activeView && activeView !== view) {
      navigate(`/bordercrossings/${activeView}`, { replace: true });
    }
  }, [activeView, view, navigate]);

  // Load border crossings data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Border_Crossing_Entry_Data.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        // Parse CSV data
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const records = [];
        // Process all records
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
        
        setBorderData(records);
        setLoading(false);
      } catch (error) {
        console.error('Error loading border crossings data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process summary data for overview
  const processedData = useMemo(() => {
    if (!borderData) return { measures: [], borders: [], states: [] };
    
    // Counts by measure
    const measureCounts = {};
    borderData.forEach(item => {
      const measure = item.Measure || 'Unknown';
      measureCounts[measure] = (measureCounts[measure] || 0) + parseInt(item.Value || 0);
    });
    
    const byMeasure = Object.entries(measureCounts)
      .map(([measure, count]) => [measure, count])
      .sort((a, b) => b[1] - a[1]);
    
    // Counts by border
    const borderCounts = {};
    borderData.forEach(item => {
      const border = item.Border || 'Unknown';
      borderCounts[border] = (borderCounts[border] || 0) + parseInt(item.Value || 0);
    });
    
    const byBorder = Object.entries(borderCounts)
      .map(([border, count]) => [border, count])
      .sort((a, b) => b[1] - a[1]);
    
    // Counts by state
    const stateCounts = {};
    borderData.forEach(item => {
      const state = item.State || 'Unknown';
      stateCounts[state] = (stateCounts[state] || 0) + parseInt(item.Value || 0);
    });
    
    const byState = Object.entries(stateCounts)
      .map(([state, count]) => [state, count])
      .sort((a, b) => b[1] - a[1]);
    
    // Total crossings
    const totalCrossings = Object.values(measureCounts).reduce((sum, count) => sum + count, 0);
    
    return {
      byMeasure,
      byBorder,
      byState,
      totalCrossings
    };
  }, [borderData]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-white">Loading Border Crossings Data...</h2>
        <p className="text-gray-400 mt-2">This may take a moment as we're processing a large dataset.</p>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="bg-red-900/30 p-6 rounded-lg max-w-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="flex items-center justify-center text-4xl font-bold text-white mb-2 space-x-4">
          <StarIcon className="text-yellow-500" size={32} />
          <span>Border Crossings Data</span>
          <StarIcon className="text-yellow-500" size={32} />
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Explore border crossing data from the Bureau of Transportation Statistics.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Data sourced from Data.gov
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'overview' 
              ? 'text-yellow-500 border-b-2 border-yellow-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'map-view' 
              ? 'text-yellow-500 border-b-2 border-yellow-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('map-view')}
        >
          Geographic Map
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'measure-analysis' 
              ? 'text-yellow-500 border-b-2 border-yellow-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('measure-analysis')}
        >
          Measure Analysis
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeView === 'trends-analysis' 
              ? 'text-yellow-500 border-b-2 border-yellow-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveView('trends-analysis')}
        >
          Trends Over Time
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Overview */}
        {activeView === 'overview' && (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Border Crossings Data Overview</h2>
              <p className="text-gray-300 mb-6">
                This dataset contains information on {borderData.length.toLocaleString()} border crossing records,
                including details on ports of entry, crossing types, and volumes across US borders.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Total Crossings</h3>
                  <p className="text-3xl font-bold text-white">{processedData.totalCrossings.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-2">Border crossings recorded</p>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Top Measure</h3>
                  <p className="text-3xl font-bold text-white">{processedData.byMeasure[0][0]}</p>
                  <p className="text-gray-400 text-sm mt-2">{processedData.byMeasure[0][1].toLocaleString()} crossings</p>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Top Border</h3>
                  <p className="text-3xl font-bold text-white">{processedData.byBorder[0][0]}</p>
                  <p className="text-gray-400 text-sm mt-2">{processedData.byBorder[0][1].toLocaleString()} crossings</p>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Top State</h3>
                  <p className="text-3xl font-bold text-white">{processedData.byState[0][0]}</p>
                  <p className="text-gray-400 text-sm mt-2">{processedData.byState[0][1].toLocaleString()} crossings</p>
                </div>
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">Available Visualizations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('map-view')}
                  >
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">Geographic Map</h4>
                    <p className="text-gray-300 text-sm">Explore the distribution of border crossings across US ports of entry on an interactive map.</p>
                  </div>
                  
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('measure-analysis')}
                  >
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">Measure Analysis</h4>
                    <p className="text-gray-300 text-sm">Analyze border crossings by different measure types such as vehicles, pedestrians, and more.</p>
                  </div>
                  
                  <div 
                    className="bg-gray-700 p-5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setActiveView('trends-analysis')}
                  >
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">Trends Analysis</h4>
                    <p className="text-gray-300 text-sm">Track border crossing volume trends over time with interactive filters and visualizations.</p>
                  </div>
                </div>
              </div>
              
              {/* Basic Bar Chart for Crossing Measures */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">Border Crossings by Measure</h3>
                <div className="mt-6 space-y-3">
                  {processedData.byMeasure.map(([measure, count]) => (
                    <div key={measure} className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-gray-300">{measure}</div>
                        <div className="text-sm text-yellow-400">
                          {count.toLocaleString()} ({Math.round((count / processedData.totalCrossings) * 100)}%)
                        </div>
                      </div>
                      <div className="h-5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full flex items-center pl-3"
                          style={{ width: `${Math.max(2, (count / processedData.byMeasure[0][1]) * 100)}%` }}
                        >
                          {count > processedData.byMeasure[0][1] / 10 && (
                            <span className="text-xs text-gray-900 font-medium">
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
          </div>
        )}
        
        {/* Map View */}
        {activeView === 'map-view' && (
          <BorderMapVisualization borderData={borderData} />
        )}
        
        {/* Measure Analysis */}
        {activeView === 'measure-analysis' && (
          <BorderMeasureAnalysis borderData={borderData} />
        )}
        
        {/* Trends Analysis */}
        {activeView === 'trends-analysis' && (
          <BorderTrendsAnalysis borderData={borderData} />
        )}
      </div>
    </div>
  );
};

export default BorderCrossingsApp; 