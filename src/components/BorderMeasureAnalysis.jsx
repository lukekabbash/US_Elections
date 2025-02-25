import React, { useState, useMemo } from 'react';

const BorderMeasureAnalysis = ({ borderData }) => {
  const [selectedBorder, setSelectedBorder] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  
  // Process the data for analysis
  const processedData = useMemo(() => {
    if (!borderData || !Array.isArray(borderData) || borderData.length === 0)
      return { measures: [], borders: [], years: [], states: [], filteredData: [] };
    
    // Extract unique borders, years, states, and measures
    const borders = [...new Set(borderData.map(item => item.Border))].filter(Boolean).sort();
    
    const years = [...new Set(borderData.map(item => {
      if (!item.Date) return null;
      const match = item.Date.match(/\d{4}$/);
      return match ? match[0] : null;
    }))].filter(Boolean).sort((a, b) => b.localeCompare(a)); // Most recent first
    
    const states = [...new Set(borderData.map(item => item.State))].filter(Boolean).sort();
    const measures = [...new Set(borderData.map(item => item.Measure))].filter(Boolean).sort();
    
    // Filter data based on selections
    let filteredData = [...borderData];
    
    if (selectedBorder !== 'all') {
      filteredData = filteredData.filter(item => item.Border === selectedBorder);
    }
    
    if (selectedYear !== 'all') {
      filteredData = filteredData.filter(item => {
        if (!item.Date) return false;
        return item.Date.endsWith(selectedYear);
      });
    }
    
    if (selectedState !== 'all') {
      filteredData = filteredData.filter(item => item.State === selectedState);
    }
    
    // Calculate totals by measure
    const measureTotals = {};
    filteredData.forEach(item => {
      const measure = item.Measure;
      if (measure) {
        measureTotals[measure] = (measureTotals[measure] || 0) + parseInt(item.Value || 0);
      }
    });
    
    // Convert to array and sort by total value
    const measureData = Object.entries(measureTotals)
      .map(([measure, total]) => ({ measure, total }))
      .sort((a, b) => b.total - a.total);
    
    return {
      measures,
      borders,
      years,
      states,
      filteredData,
      measureData
    };
  }, [borderData, selectedBorder, selectedYear, selectedState]);
  
  // Calculate max value for chart scaling
  const maxValue = useMemo(() => {
    if (!processedData.measureData || processedData.measureData.length === 0) return 1;
    const max = Math.max(...processedData.measureData.map(d => d.total || 0));
    return Math.max(max, 1); // Ensure we don't divide by zero
  }, [processedData.measureData]);
  
  // Total crossings
  const totalCrossings = useMemo(() => {
    if (!processedData.measureData || processedData.measureData.length === 0) return 0;
    return processedData.measureData.reduce((sum, item) => sum + item.total, 0);
  }, [processedData.measureData]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Border Crossing Measures Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Border Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Border</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedBorder}
            onChange={(e) => setSelectedBorder(e.target.value)}
          >
            <option value="all">All Borders</option>
            {processedData.borders.map(border => (
              <option key={border} value={border}>{border}</option>
            ))}
          </select>
        </div>
        
        {/* Year Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Year</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {processedData.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* State Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">State</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="all">All States</option>
            {processedData.states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stats card */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Total Crossings</h3>
        <p className="text-2xl font-bold text-blue-400">{totalCrossings.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">
          {selectedBorder !== 'all' ? `${selectedBorder} - ` : ''}
          {selectedState !== 'all' ? `${selectedState} - ` : ''}
          {selectedYear !== 'all' ? `${selectedYear}` : 'All Years'}
        </p>
      </div>
      
      {/* Measure distribution chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Border Crossings by Measure</h3>
        {processedData.measureData && processedData.measureData.length > 0 ? (
          <div className="h-60 flex items-end space-x-2 px-4">
            {processedData.measureData.map(({ measure, total }) => (
              <div key={measure} className="flex flex-col items-center flex-1" style={{ minWidth: '60px' }}>
                <div 
                  className="w-full bg-blue-500 hover:bg-blue-400 transition-all rounded-t flex items-end justify-center"
                  style={{ 
                    height: `${Math.max(4, (total / maxValue) * 100)}%`,
                    minHeight: '4px' 
                  }}
                >
                  <span className="text-xs text-white font-medium p-1 text-center">
                    {total > maxValue / 10 ? total.toLocaleString() : ''}
                  </span>
                </div>
                <span className="text-xs text-gray-400 mt-2 text-center" style={{ wordBreak: 'break-word' }}>
                  {measure}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-60 bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">No data available for the selected filters</p>
          </div>
        )}
      </div>
      
      {/* Measure percentage breakdown */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Measure Percentage Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedData.measureData.map(({ measure, total }) => {
            const percentage = totalCrossings ? ((total / totalCrossings) * 100).toFixed(1) : 0;
            return (
              <div key={measure} className="bg-gray-900 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">{measure}</span>
                  <span className="text-sm font-bold text-blue-400">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.max(2, percentage)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {total.toLocaleString()} crossings
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BorderMeasureAnalysis; 