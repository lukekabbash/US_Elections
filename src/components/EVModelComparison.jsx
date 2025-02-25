import React, { useState, useMemo } from 'react';

const EVModelComparison = ({ evData }) => {
  const [selectedModels, setSelectedModels] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [comparisonMetric, setComparisonMetric] = useState('count');
  
  // Process data for model comparison
  const processedData = useMemo(() => {
    if (!evData) return { modelData: [], allModels: [] };
    
    // Get unique makes
    const makes = [...new Set(evData.map(v => v.Make).filter(Boolean))];
    
    // Get all models by make
    const allModels = [];
    makes.forEach(make => {
      const makeVehicles = evData.filter(v => v.Make === make);
      const models = [...new Set(makeVehicles.map(v => v.Model).filter(Boolean))];
      
      models.forEach(model => {
        const modelVehicles = makeVehicles.filter(v => v.Model === model);
        
        // Only include models with at least 5 vehicles
        if (modelVehicles.length >= 5) {
          allModels.push({
            id: `${make} ${model}`,
            make,
            model,
            count: modelVehicles.length
          });
        }
      });
    });
    
    // Sort by popularity
    allModels.sort((a, b) => b.count - a.count);
    
    // Calculate data for selected models
    const modelData = selectedModels.map(modelId => {
      const [make, ...modelParts] = modelId.split(' ');
      const model = modelParts.join(' ');
      const modelVehicles = evData.filter(v => v.Make === make && v.Model === model);
      
      // Calculate average range
      const vehiclesWithRange = modelVehicles.filter(v => {
        const range = parseFloat(v['Electric Range']);
        return !isNaN(range) && range > 0;
      });
      
      const totalRange = vehiclesWithRange.reduce((sum, v) => sum + parseFloat(v['Electric Range']), 0);
      const avgRange = vehiclesWithRange.length ? Math.round(totalRange / vehiclesWithRange.length) : 0;
      
      // Calculate years available
      const years = [...new Set(modelVehicles.map(v => v['Model Year']).filter(Boolean))]
        .filter(year => !isNaN(parseInt(year)))
        .map(year => parseInt(year))
        .sort((a, b) => a - b);
      
      // Calculate type breakdown
      const typeCount = {};
      modelVehicles.forEach(v => {
        const type = v['Electric Vehicle Type'] || 'Unknown';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      // Calculate county distribution (top 5)
      const countyCount = {};
      modelVehicles.forEach(v => {
        const county = v.County || 'Unknown';
        countyCount[county] = (countyCount[county] || 0) + 1;
      });
      
      const countyData = Object.entries(countyCount)
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      return {
        id: modelId,
        make,
        model,
        count: modelVehicles.length,
        avgRange,
        years,
        typeBreakdown: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
        countyData
      };
    });
    
    return { modelData, allModels };
  }, [evData, selectedModels]);
  
  // Update available models when the data changes
  React.useEffect(() => {
    if (processedData.allModels) {
      setAvailableModels(processedData.allModels);
    }
  }, [processedData.allModels]);
  
  // Handle model select change
  const handleModelSelect = (e) => {
    const modelId = e.target.value;
    if (modelId && !selectedModels.includes(modelId)) {
      setSelectedModels([...selectedModels, modelId]);
    }
  };
  
  // Handle model remove
  const handleRemoveModel = (modelId) => {
    setSelectedModels(selectedModels.filter(id => id !== modelId));
  };
  
  // Determine max value for chart scaling
  const maxValue = useMemo(() => {
    if (!processedData.modelData || processedData.modelData.length === 0) return 1;
    
    let values = [];
    if (comparisonMetric === 'count') {
      values = processedData.modelData.map(d => d.count || 0);
    } else if (comparisonMetric === 'range') {
      values = processedData.modelData.map(d => d.avgRange || 0);
    } else if (comparisonMetric === 'years') {
      values = processedData.modelData.map(d => (d.years ? d.years.length : 0));
    }
    
    const max = Math.max(...values);
    return Math.max(max, 1); // Ensure we don't divide by zero
  }, [processedData.modelData, comparisonMetric]);
  
  // Model colors for consistent display
  const modelColors = [
    'rgb(52, 211, 153)', // emerald-400
    'rgb(99, 102, 241)', // indigo-500
    'rgb(239, 68, 68)',  // red-500
    'rgb(245, 158, 11)', // amber-500
    'rgb(6, 182, 212)',  // cyan-500
  ];
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">EV Model Comparison</h2>
      
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <label className="block text-gray-400 text-sm mb-2">Add Vehicle Model to Compare</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value=""
            onChange={handleModelSelect}
          >
            <option value="">Select a model...</option>
            {availableModels.map(model => (
              <option 
                key={model.id} 
                value={model.id}
                disabled={selectedModels.includes(model.id)}
              >
                {model.make} {model.model} ({model.count} vehicles)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-2">Comparison Metric</label>
          <select 
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            value={comparisonMetric}
            onChange={(e) => setComparisonMetric(e.target.value)}
          >
            <option value="count">Total Count</option>
            <option value="range">Average Range</option>
            <option value="years">Years Available</option>
          </select>
        </div>
      </div>
      
      {/* Selected models */}
      <div className="flex flex-wrap gap-2 mb-6">
        {selectedModels.map((modelId, index) => (
          <div 
            key={modelId}
            className="flex items-center bg-gray-700 rounded-full px-3 py-1"
            style={{ borderLeft: `4px solid ${modelColors[index % modelColors.length]}` }}
          >
            <span className="text-white text-sm">{modelId}</span>
            <button 
              className="ml-2 text-gray-400 hover:text-gray-200"
              onClick={() => handleRemoveModel(modelId)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        {selectedModels.length === 0 && (
          <div className="text-gray-400 text-sm italic">Select models to compare</div>
        )}
      </div>
      
      {/* Comparison Chart */}
      {selectedModels.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-3">
            {comparisonMetric === 'count' ? 'Total Vehicles' : 
             comparisonMetric === 'range' ? 'Average Electric Range (miles)' : 
             'Number of Model Years Available'}
          </h3>
          {processedData.modelData && processedData.modelData.length > 0 ? (
            <div className="h-60 flex items-end space-x-6 px-4">
              {processedData.modelData.map((model, index) => {
                const value = comparisonMetric === 'count' ? (model.count || 0) : 
                             comparisonMetric === 'range' ? (model.avgRange || 0) : 
                             (model.years ? model.years.length : 0);
                
                return (
                  <div key={model.id} className="flex flex-col items-center flex-1" style={{ minWidth: '50px' }}>
                    <div 
                      className="w-full rounded-t transition-all relative group"
                      style={{ 
                        height: `${Math.max(4, (value / maxValue) * 100)}%`,
                        minHeight: '4px',
                        backgroundColor: modelColors[index % modelColors.length]
                      }}
                    >
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {value.toLocaleString()} {comparisonMetric === 'range' ? 'miles' : ''}
                      </div>
                      <div className="h-full w-full flex items-end justify-center">
                        <span className="text-xs text-white font-medium p-1">
                          {value > maxValue / 10 ? value.toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-2 text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {model.make} {model.model}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-60 bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">No data available for selected models</p>
            </div>
          )}
        </div>
      )}
      
      {/* Detailed Comparison Table */}
      {selectedModels.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Detailed Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Years Available</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Top County</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {processedData.modelData.map((model, index) => (
                  <tr key={model.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: modelColors[index % modelColors.length] }}></div>
                        <span className="text-sm font-medium text-white">{model.make} {model.model}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{model.count.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{model.avgRange} miles</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {model.years.length > 0 ? `${Math.min(...model.years)} - ${Math.max(...model.years)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {model.typeBreakdown.length > 0 ? model.typeBreakdown[0].type : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {model.countyData.length > 0 ? 
                        `${model.countyData[0].county} (${model.countyData[0].count})` : 
                        'N/A'}
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

export default EVModelComparison; 