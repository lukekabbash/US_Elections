import React, { useState, useMemo } from 'react';

const BorderTrendsAnalysis = ({ borderData }) => {
  const [selectedMeasure, setSelectedMeasure] = useState('all');
  const [selectedBorder, setSelectedBorder] = useState('all');
  const [selectedPort, setSelectedPort] = useState('all');
  
  // Process the data for analysis
  const processedData = useMemo(() => {
    if (!borderData || !Array.isArray(borderData) || borderData.length === 0)
      return { measures: [], borders: [], ports: [], timeData: [] };
    
    // Extract unique measures, borders, and ports
    const measures = [...new Set(borderData.map(item => item.Measure))].filter(Boolean).sort();
    const borders = [...new Set(borderData.map(item => item.Border))].filter(Boolean).sort();
    
    // Get ports, but only include those with significant data (more than 10 entries)
    const portCounts = {};
    borderData.forEach(item => {
      if (item['Port Name']) {
        portCounts[item['Port Name']] = (portCounts[item['Port Name']] || 0) + 1;
      }
    });
    
    const ports = Object.entries(portCounts)
      .filter(([_, count]) => count > 10)
      .map(([port]) => port)
      .sort();
    
    // Parse date and create time series data
    let filteredData = [...borderData];
    
    if (selectedMeasure !== 'all') {
      filteredData = filteredData.filter(item => item.Measure === selectedMeasure);
    }
    
    if (selectedBorder !== 'all') {
      filteredData = filteredData.filter(item => item.Border === selectedBorder);
    }
    
    if (selectedPort !== 'all') {
      filteredData = filteredData.filter(item => item['Port Name'] === selectedPort);
    }
    
    console.log("Filtered data sample:", filteredData.slice(0, 3));
    console.log("Date format example:", filteredData[0]?.Date);
    
    // Group by year-month
    const timeSeriesData = {};
    
    filteredData.forEach(item => {
      if (!item.Date) return;
      
      // Parse date in format "03/01/2023 12:00:00 AM"
      // Extract just the month/year part
      let yearMonth = '';
      try {
        if (item.Date.includes('/')) {
          // Parse date like "03/01/2023 12:00:00 AM" to "Mar 2023"
          const dateParts = item.Date.split(' ')[0].split('/');
          if (dateParts.length >= 3) {
            const month = parseInt(dateParts[0]);
            const year = dateParts[2];
            
            // Convert month number to name
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            if (month >= 1 && month <= 12) {
              yearMonth = `${monthNames[month-1]} ${year}`;
            }
          }
        } else {
          // Handle if already in "Apr 2023" format
          yearMonth = item.Date.trim();
        }
      } catch (e) {
        console.error("Error parsing date:", item.Date, e);
        return; // Skip this item
      }
      
      if (!yearMonth) return;
      
      // Extract or calculate value
      const value = parseInt(item.Value || 0);
      if (isNaN(value)) return; // Skip invalid values
      
      if (timeSeriesData[yearMonth]) {
        timeSeriesData[yearMonth] += value;
      } else {
        timeSeriesData[yearMonth] = value;
      }
    });
    
    // Convert to array for chart
    const monthOrder = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const timeData = Object.entries(timeSeriesData)
      .map(([date, value]) => {
        // Split into month and year
        const [month, year] = date.split(' ');
        return { 
          date,
          month,
          year: parseInt(year || 0), 
          value 
        };
      })
      .filter(item => !isNaN(item.year) && item.year > 0 && item.value > 0) // Only keep valid entries
      .sort((a, b) => {
        // Sort by year and then by month
        if (a.year !== b.year) return a.year - b.year;
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
    
    console.log("Processed time data:", timeData.slice(0, 10));
    console.log("Time data length:", timeData.length);
    
    // Calculate period-over-period changes
    const dataWithChanges = timeData.map((item, index) => {
      if (index === 0) return { ...item, change: 0, percentChange: 0 };
      
      const prevValue = timeData[index - 1].value;
      const change = item.value - prevValue;
      const percentChange = prevValue ? (change / prevValue) * 100 : 0;
      
      return {
        ...item,
        change,
        percentChange
      };
    });
    
    return {
      measures,
      borders,
      ports,
      timeData: dataWithChanges
    };
  }, [borderData, selectedMeasure, selectedBorder, selectedPort]);
  
  // Calculate max value for chart scaling
  const maxValue = useMemo(() => {
    if (!processedData.timeData || processedData.timeData.length === 0) return 1;
    
    const values = processedData.timeData.map(d => d.value || 0);
    if (values.length === 0 || Math.max(...values) === 0) return 1; // Ensure non-zero
    
    const max = Math.max(...values);
    console.log("Max value for scaling:", max, "Values:", values);
    return max;
  }, [processedData.timeData]);
  
  // Calculate min value for better scaling
  const minValue = useMemo(() => {
    if (!processedData.timeData || processedData.timeData.length === 0) return 0;
    
    const values = processedData.timeData.map(d => d.value || 0);
    if (values.length === 0) return 0;
    
    return Math.min(...values);
  }, [processedData.timeData]);
  
  // Calculate insights
  const insights = useMemo(() => {
    if (!processedData.timeData || processedData.timeData.length < 2) return null;
    
    const timeData = processedData.timeData;
    const lastValue = timeData[timeData.length - 1].value;
    const lastDate = timeData[timeData.length - 1].date;
    
    // Find max and min
    const maxEntry = [...timeData].sort((a, b) => b.value - a.value)[0];
    const minEntry = [...timeData].sort((a, b) => a.value - b.value)[0];
    
    // Calculate average
    const sum = timeData.reduce((acc, item) => acc + item.value, 0);
    const avg = Math.round(sum / timeData.length);
    
    // Recent trend (last 3 periods if available)
    const recentTrend = timeData.length >= 3 
      ? timeData.slice(-3).every(item => item.change > 0) ? 'increasing'
        : timeData.slice(-3).every(item => item.change < 0) ? 'decreasing'
        : 'fluctuating'
      : 'insufficient data';
      
    return {
      lastValue,
      lastDate,
      maxEntry,
      minEntry,
      avg,
      recentTrend
    };
  }, [processedData.timeData]);
  
  // This component should show a debug panel in development
  const showDebug = process.env.NODE_ENV === 'development';

  const handleResetAndDebug = () => {
    setSelectedMeasure('all');
    setSelectedBorder('all');
    setSelectedPort('all');
    console.log('DATA DEBUGGING INFORMATION:');
    console.log('Full borderData sample:', borderData?.slice(0, 5));
    console.log('Current timeData:', processedData.timeData);
    console.log('Min value:', minValue, 'Max value:', maxValue);
    
    // Alert when no data is found
    if (!processedData.timeData || processedData.timeData.length === 0) {
      alert('No time data available. Check console for debugging info.');
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Border Crossing Trends Over Time</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Measure Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Measure Type</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedMeasure}
            onChange={(e) => setSelectedMeasure(e.target.value)}
          >
            <option value="all">All Measures</option>
            {processedData.measures.map(measure => (
              <option key={measure} value={measure}>{measure}</option>
            ))}
          </select>
        </div>
        
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
        
        {/* Port Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Port of Entry</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
          >
            <option value="all">All Ports</option>
            {processedData.ports.map(port => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Reset Filters Button */}
      <div className="mb-6">
        <button
          onClick={handleResetAndDebug}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filters
        </button>
      </div>
      
      {/* Insights cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Latest Data Point</h3>
            <p className="text-2xl font-bold text-blue-400">{insights.lastValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{insights.lastDate}</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Peak Volume</h3>
            <p className="text-2xl font-bold text-blue-400">{insights.maxEntry.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{insights.maxEntry.date}</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Recent Trend</h3>
            <p className="text-2xl font-bold text-blue-400 capitalize">{insights.recentTrend}</p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {insights.avg.toLocaleString()} per period
            </p>
          </div>
        </div>
      )}
      
      {/* Time series chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Volume Over Time</h3>
        {processedData.timeData && processedData.timeData.length > 0 ? (
          <div className="h-80 flex items-end space-x-1 relative">
            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 px-2">
              <span>{maxValue.toLocaleString()}</span>
              <span>{Math.round((maxValue + minValue) / 2).toLocaleString()}</span>
              <span>{minValue.toLocaleString()}</span>
            </div>
            
            {/* Chart bars */}
            <div className="ml-12 h-full w-full flex items-end space-x-1 overflow-x-auto pb-2">
              {processedData.timeData.length > 0 ? (
                processedData.timeData.map((entry, index) => {
                  // Calculate height percentage with improved scaling
                  // Use a range from 5% to 95% to ensure visibility differences
                  const range = maxValue - minValue;
                  const scale = range > 0 ? (entry.value - minValue) / range : 0;
                  
                  // Make sure we have visual differences even with similar values
                  // Using a logarithmic scale for better visualization when values are close
                  let heightPercent;
                  if (range === 0) {
                    heightPercent = 50; // All values are the same, show at 50%
                  } else if (range < 100 && maxValue > 1000) {
                    // For large values with small differences, enhance the scale
                    heightPercent = 10 + (Math.log(1 + scale * 9) / Math.log(10)) * 80;
                  } else {
                    // Linear scale from 10% to 95%
                    heightPercent = 10 + (scale * 85);
                  }
                  
                  return (
                  <div 
                    key={entry.date} 
                    className="flex flex-col items-center group"
                    style={{ minWidth: '40px', flex: '1' }}
                  >
                    <div 
                      className={`w-full rounded-t transition-all relative ${
                        entry.change > 0 ? 'bg-blue-500' : 
                        entry.change < 0 ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }`}
                      style={{ 
                        height: `${Math.max(4, heightPercent)}%`,
                        minHeight: '4px'
                      }}
                      title={`${entry.date}: ${entry.value.toLocaleString()}`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {entry.value.toLocaleString()}
                        {entry.change !== 0 && (
                          <span className={entry.change > 0 ? 'text-green-400' : 'text-red-400'}>
                            {' '}({entry.change > 0 ? '+' : ''}{entry.percentChange.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col items-center">
                      <span className="text-xs text-gray-400">
                        {entry.month}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.year}
                      </span>
                    </div>
                  </div>
                );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">No data points available for the selected filters</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">No time-series data available for the selected filters</p>
          </div>
        )}
      </div>
      
      {/* Recent data table */}
      {processedData.timeData && processedData.timeData.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Recent Data Points</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">% Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {processedData.timeData.slice(-10).reverse().map((entry) => (
                  <tr key={entry.date}>
                    <td className="px-4 py-3 text-sm text-white">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-white">{entry.value.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-sm ${
                      entry.change > 0 ? 'text-green-400' : 
                      entry.change < 0 ? 'text-red-400' : 
                      'text-gray-400'
                    }`}>
                      {entry.change !== 0 ? (entry.change > 0 ? '+' : '') + entry.change.toLocaleString() : '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      entry.change > 0 ? 'text-green-400' : 
                      entry.change < 0 ? 'text-red-400' : 
                      'text-gray-400'
                    }`}>
                      {entry.change !== 0 ? (entry.change > 0 ? '+' : '') + entry.percentChange.toFixed(1) + '%' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorderTrendsAnalysis; 