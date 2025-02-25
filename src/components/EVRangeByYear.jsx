import React, { useMemo } from 'react';

const EVRangeByYear = ({ evData }) => {
  // Process data to calculate average range by year
  const processedData = useMemo(() => {
    if (!evData || !Array.isArray(evData) || evData.length === 0) return [];
    
    // Group vehicles by year and calculate average range
    const yearGroups = {};
    
    evData.forEach(vehicle => {
      if (!vehicle) return;
      
      const year = vehicle['Model Year'];
      const range = parseFloat(vehicle['Electric Range']);
      
      if (year && !isNaN(parseInt(year)) && !isNaN(range) && range > 0) {
        if (!yearGroups[year]) {
          yearGroups[year] = { 
            sum: 0, 
            count: 0, 
            vehicles: [] 
          };
        }
        yearGroups[year].sum += range;
        yearGroups[year].count++;
        yearGroups[year].vehicles.push({
          make: vehicle.Make || 'Unknown',
          model: vehicle.Model || 'Unknown',
          range
        });
      }
    });
    
    // Calculate average and prepare data for chart
    const chartData = Object.entries(yearGroups)
      .map(([year, data]) => ({
        year: parseInt(year),
        avgRange: Math.round(data.sum / data.count),
        count: data.count,
        vehicles: data.vehicles.sort((a, b) => b.range - a.range).slice(0, 5) // Top 5 vehicles by range
      }))
      .filter(item => item.year >= 2010 && !isNaN(item.year)) // Filter to modern EVs and valid years
      .sort((a, b) => a.year - b.year); // Sort by year ascending
    
    return chartData;
  }, [evData]);
  
  // Find max average range for scaling
  const maxAvgRange = useMemo(() => {
    if (!processedData || processedData.length === 0) return 300; // Default max if no data
    const max = Math.max(...processedData.map(d => d.avgRange || 0));
    return Math.max(max * 1.1, 100); // Add 10% headroom, minimum 100 miles
  }, [processedData]);

  // If no processed data, show a message
  if (!processedData || processedData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Electric Vehicle Range Evolution</h2>
        <div className="flex items-center justify-center h-60 bg-gray-900 rounded-lg">
          <p className="text-gray-400">No range data available for analysis</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Electric Vehicle Range Evolution</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Average Range by Model Year</h3>
          <div className="text-sm text-gray-400">
            {processedData.reduce((sum, d) => sum + d.count, 0).toLocaleString()} vehicles with range data
          </div>
        </div>
        
        {/* Chart */}
        <div className="mt-4 relative h-80">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-gray-400 text-xs pb-6">
            <div>{Math.round(maxAvgRange)} mi</div>
            <div>{Math.round(maxAvgRange * 0.75)} mi</div>
            <div>{Math.round(maxAvgRange * 0.5)} mi</div>
            <div>{Math.round(maxAvgRange * 0.25)} mi</div>
            <div>0 mi</div>
          </div>
          
          {/* Grid lines */}
          <div className="absolute left-16 right-0 top-0 bottom-0 flex flex-col justify-between pb-6">
            <div className="border-t border-gray-700 w-full h-0"></div>
            <div className="border-t border-gray-700 w-full h-0"></div>
            <div className="border-t border-gray-700 w-full h-0"></div>
            <div className="border-t border-gray-700 w-full h-0"></div>
            <div className="border-t border-gray-700 w-full h-0"></div>
          </div>
          
          {/* Chart area */}
          <div className="absolute left-16 right-0 top-0 bottom-6 flex items-end">
            {processedData.map((item, index) => (
              <div 
                key={item.year} 
                className="flex-1 flex flex-col items-center group relative"
                style={{ marginLeft: index === 0 ? '0' : '2px', minWidth: '30px' }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 z-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="font-semibold">{item.year}: {item.avgRange} miles</div>
                  <div className="text-gray-300 mt-1">Based on {item.count} vehicles</div>
                  {item.vehicles && item.vehicles.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-gray-700">
                      <div className="text-gray-300 font-semibold">Top models by range:</div>
                      {item.vehicles.map((v, i) => (
                        <div key={i} className="text-gray-400">{v.make} {v.model}: {v.range} mi</div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full bg-green-500 hover:bg-green-400 transition-all rounded-t cursor-pointer"
                  style={{ 
                    height: `${Math.max(4, (item.avgRange / maxAvgRange) * 100)}%`,
                    minHeight: '4px'
                  }}
                >
                  <div className="h-full w-full flex items-end justify-center">
                    <span className="text-xs text-white font-medium p-1">
                      {item.avgRange}
                    </span>
                  </div>
                </div>
                
                {/* X-axis label */}
                <div className="text-xs text-gray-400 mt-1">{item.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {processedData.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-3">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-1">Overall Trend</h4>
              <p className="text-gray-300 text-sm">
                From {processedData[0].year} to {processedData[processedData.length - 1].year}, 
                average EV range increased by {" "}
                {Math.round((processedData[processedData.length - 1].avgRange - processedData[0].avgRange) / Math.max(1, processedData[0].avgRange) * 100)}%.
              </p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-1">Highest Range</h4>
              <p className="text-gray-300 text-sm">
                The highest average range is {Math.max(...processedData.map(d => d.avgRange))} miles 
                in {processedData.find(d => d.avgRange === Math.max(...processedData.map(d => d.avgRange)))?.year || 'recent years'}.
              </p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-1">Recent Progress</h4>
              <p className="text-gray-300 text-sm">
                {processedData.length > 5 ? (
                  <>
                    In the last 5 years, average EV range
                    {processedData[processedData.length - 1].avgRange > processedData[Math.max(0, processedData.length - 6)].avgRange ? 
                      ` increased by ${Math.round((processedData[processedData.length - 1].avgRange - processedData[Math.max(0, processedData.length - 6)].avgRange))} miles.` : 
                      ` changed by ${Math.round((processedData[processedData.length - 1].avgRange - processedData[Math.max(0, processedData.length - 6)].avgRange))} miles.`
                    }
                  </>
                ) : (
                  <>EV range data shows continuous improvement in technology and battery efficiency.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVRangeByYear; 