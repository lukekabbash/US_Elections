import React, { useState, useMemo } from 'react';

const EVTypeBreakdown = ({ evData }) => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedRange, setSelectedRange] = useState('all');
  
  // Process data for visualization
  const processedData = useMemo(() => {
    if (!evData) return { 
      types: [], 
      makes: [], 
      years: [], 
      ranges: [],
      filteredVehicles: [] 
    };
    
    // Get unique vehicle types
    const types = [...new Set(evData.map(v => v['Electric Vehicle Type']).filter(Boolean))];
    
    // Get unique makes
    const makes = [...new Set(evData.map(v => v.Make).filter(Boolean))];
    
    // Get unique years
    const years = [...new Set(evData.map(v => v['Model Year']).filter(Boolean))]
      .filter(year => !isNaN(parseInt(year)))
      .map(year => parseInt(year))
      .sort((a, b) => b - a); // newest first
    
    // Create range buckets
    const rangeBuckets = [
      { label: 'Under 100 miles', min: 0, max: 100 },
      { label: '100-200 miles', min: 100, max: 200 },
      { label: '200-300 miles', min: 200, max: 300 },
      { label: 'Over 300 miles', min: 300, max: Infinity }
    ];
    
    // Filter vehicles based on selected criteria
    const filteredVehicles = evData.filter(vehicle => {
      if (selectedType !== 'all' && vehicle['Electric Vehicle Type'] !== selectedType) return false;
      if (selectedMake !== 'all' && vehicle.Make !== selectedMake) return false;
      if (selectedYear !== 'all' && vehicle['Model Year'] !== selectedYear.toString()) return false;
      
      if (selectedRange !== 'all') {
        const range = parseFloat(vehicle['Electric Range']);
        const rangeBucket = rangeBuckets.find(b => b.label === selectedRange);
        if (isNaN(range) || range < rangeBucket.min || range >= rangeBucket.max) return false;
      }
      
      return true;
    });
    
    return {
      types,
      makes,
      years,
      ranges: rangeBuckets.map(b => b.label),
      filteredVehicles
    };
  }, [evData, selectedType, selectedMake, selectedYear, selectedRange]);
  
  // Calculate statistics for filtered vehicles
  const stats = useMemo(() => {
    if (!processedData.filteredVehicles.length) return {};
    
    // Average electric range (only for vehicles with range data)
    const vehiclesWithRange = processedData.filteredVehicles.filter(v => {
      const range = parseFloat(v['Electric Range']);
      return !isNaN(range) && range > 0;
    });
    
    const totalRange = vehiclesWithRange.reduce((sum, v) => sum + parseFloat(v['Electric Range']), 0);
    const avgRange = vehiclesWithRange.length ? (totalRange / vehiclesWithRange.length).toFixed(1) : 'N/A';
    
    // Count by model year
    const yearCounts = {};
    processedData.filteredVehicles.forEach(v => {
      const year = v['Model Year'];
      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    
    const yearData = Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year))
      .slice(0, 10);
      
    // Count by eligibility status  
    const eligibilityCount = {};
    processedData.filteredVehicles.forEach(v => {
      const status = v['Clean Alternative Fuel Vehicle (CAFV) Eligibility'];
      const simpleStatus = status?.includes('Eligible') ? 'Eligible' : 
                           status?.includes('Not eligible') ? 'Not Eligible' : 'Unknown';
      eligibilityCount[simpleStatus] = (eligibilityCount[simpleStatus] || 0) + 1;
    });
    
    return {
      totalVehicles: processedData.filteredVehicles.length,
      avgRange,
      yearData,
      eligibilityCount
    };
  }, [processedData.filteredVehicles]);
  
  // Determine max count for year chart scaling
  const maxYearCount = useMemo(() => {
    if (!stats.yearData || stats.yearData.length === 0) return 1;
    const max = Math.max(...stats.yearData.map(d => d.count || 0));
    return Math.max(max, 1); // Ensure we don't divide by zero
  }, [stats.yearData]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Vehicle Type Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Type Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            {processedData.types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Make Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Make</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
          >
            <option value="all">All Makes</option>
            {processedData.makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
        
        {/* Year Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Model Year</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          >
            <option value="all">All Years</option>
            {processedData.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Range Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Electric Range</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="all">All Ranges</option>
            {processedData.ranges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Vehicles</h3>
          <p className="text-2xl font-bold text-green-400">{stats.totalVehicles?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Matching your filters</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Average Range</h3>
          <p className="text-2xl font-bold text-green-400">{stats.avgRange || 'N/A'} <span className="text-sm">miles</span></p>
          <p className="text-xs text-gray-500 mt-1">Electric driving range</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">CAFV Eligibility</h3>
          <div className="flex space-x-3 mt-2">
            {stats.eligibilityCount && Object.entries(stats.eligibilityCount).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-1 ${
                  status === 'Eligible' ? 'bg-green-500' : 
                  status === 'Not Eligible' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-xs text-gray-300">{status} ({Math.round(count / stats.totalVehicles * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Year distribution chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Model Year Distribution</h3>
        {stats.yearData && stats.yearData.length > 0 ? (
          <div className="h-60 flex items-end space-x-1">
            {stats.yearData.map(({ year, count }) => (
              <div key={year} className="flex flex-col items-center" style={{ width: `${100 / (stats.yearData?.length || 1)}%`, minWidth: '30px' }}>
                <div 
                  className="w-full bg-green-500 hover:bg-green-400 transition-all rounded-t"
                  style={{ 
                    height: `${Math.max(4, (count / maxYearCount) * 100)}%`,
                    minHeight: '4px'
                  }}
                >
                  <div className="h-full w-full flex items-end justify-center">
                    <span className="text-xs text-white font-medium p-1">
                      {count > maxYearCount / 10 ? count.toLocaleString() : ''}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-1">{year}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-60 bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">No year data available for the selected filters</p>
          </div>
        )}
      </div>
      
      {/* Vehicle list */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Vehicle List</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Make</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {processedData.filteredVehicles.slice(0, 10).map((vehicle, idx) => (
                  <tr key={idx} className="hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{vehicle['Model Year']}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{vehicle.Make}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{vehicle.Model}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{vehicle['Electric Vehicle Type']}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {vehicle['Electric Range'] ? `${vehicle['Electric Range']} mi` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{vehicle.City}, {vehicle.County}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {processedData.filteredVehicles.length > 10 && (
            <div className="px-4 py-3 bg-gray-800 text-xs text-gray-400">
              Showing 10 of {processedData.filteredVehicles.length.toLocaleString()} vehicles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EVTypeBreakdown; 