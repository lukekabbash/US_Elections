import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const BorderMapVisualization = ({ borderData }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Process data for visualization
  const processedData = useMemo(() => {
    if (!borderData || !Array.isArray(borderData) || borderData.length === 0) 
      return { portData: [], stateData: [], coordinates: [] };
    
    // Count by port
    const portCount = {};
    // Count by state
    const stateCount = {};
    // Extract coordinates
    const coordinates = [];
    
    borderData.forEach(crossing => {
      if (!crossing) return;
      
      const port = crossing['Port Name'] || 'Unknown';
      portCount[port] = (portCount[port] || 0) + parseInt(crossing.Value || 0);
      
      const state = crossing.State || 'Unknown';
      stateCount[state] = (stateCount[state] || 0) + parseInt(crossing.Value || 0);
      
      // Extract coordinates
      if (crossing.Latitude && crossing.Longitude) {
        try {
          const latitude = parseFloat(crossing.Latitude);
          const longitude = parseFloat(crossing.Longitude);
          
          if (!isNaN(latitude) && !isNaN(longitude)) {
            // Check if we already have this port in coordinates
            const existingPortIndex = coordinates.findIndex(coord => 
              coord.port === port && coord.latitude === latitude && coord.longitude === longitude
            );
            
            if (existingPortIndex >= 0) {
              // Update the existing port data
              coordinates[existingPortIndex].value += parseInt(crossing.Value || 0);
              
              // Add measure if not already in the measures array
              if (!coordinates[existingPortIndex].measures.includes(crossing.Measure)) {
                coordinates[existingPortIndex].measures.push(crossing.Measure);
              }
            } else {
              // Add new port data
              coordinates.push({
                port: port,
                state: state,
                latitude: latitude,
                longitude: longitude,
                value: parseInt(crossing.Value || 0),
                measures: [crossing.Measure],
                border: crossing.Border
              });
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates:', e);
        }
      }
    });
    
    return {
      portData: Object.entries(portCount)
        .map(([port, count]) => ({ port, count }))
        .sort((a, b) => b.count - a.count),
      stateData: Object.entries(stateCount)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count),
      coordinates: coordinates.sort((a, b) => b.value - a.value)
    };
  }, [borderData]);
  
  // Handle mouse move for tooltip positioning
  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Calculate max count for the port bar chart scaling
  const maxPortCount = useMemo(() => {
    if (!processedData.portData || processedData.portData.length === 0) return 1;
    return Math.max(...processedData.portData.map(item => item.count));
  }, [processedData.portData]);
  
  // Marker size scale based on crossing volume
  const sizeScale = useMemo(() => {
    if (!processedData.coordinates || processedData.coordinates.length === 0) return () => 4;
    
    const maxValue = Math.max(...processedData.coordinates.map(c => c.value));
    return scaleLinear()
      .domain([0, maxValue])
      .range([4, 20])
      .clamp(true);
  }, [processedData.coordinates]);
  
  // Color scale for markers based on border type
  const colorScale = (border) => {
    if (border.includes('Canada')) return '#3b82f6'; // blue for Canada
    if (border.includes('Mexico')) return '#ef4444'; // red for Mexico
    return '#a3a3a3'; // gray for unknown
  };

  // US map configuration
  const usMapConfig = {
    center: [-96, 36],
    zoom: 3.5
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-xl font-bold text-white mb-4">Border Crossing Distribution</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-300 text-sm">
            Distribution of border crossings across US ports of entry
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Map */}
        <div className="md:w-1/2 h-[500px] bg-gray-900 rounded-lg overflow-hidden">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={usMapConfig}
          >
            <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1f2937"
                    stroke="#374151"
                    strokeWidth={0.5}
                  />
                ))
              }
            </Geographies>
            
            {processedData.coordinates.slice(0, 50).map((point, index) => (
              <Marker 
                key={`marker-${index}`}
                coordinates={[point.longitude, point.latitude]}
                onMouseEnter={() => {
                  setTooltipContent(`
                    <strong>${point.port}, ${point.state}</strong><br/>
                    Border: ${point.border}<br/>
                    Total Crossings: ${point.value.toLocaleString()}<br/>
                    Types: ${point.measures.join(', ')}
                  `);
                  setShowTooltip(true);
                }}
                onMouseLeave={() => {
                  setShowTooltip(false);
                }}
              >
                <circle
                  r={sizeScale(point.value)}
                  fill={colorScale(point.border)}
                  opacity={0.7}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                />
              </Marker>
            ))}
          </ComposableMap>
        </div>
        
        {/* Port Breakdown */}
        <div className="md:w-1/2 bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Top Ports of Entry</h3>
          <div className="overflow-y-auto" style={{ maxHeight: "452px" }}>
            <div className="space-y-3">
              {processedData.portData.slice(0, 20).map(({ port, count }) => (
                <div key={port} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">{port}</span>
                    <span className="text-sm text-blue-400 font-semibold">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.max(2, (count / maxPortCount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {showTooltip && (
        <div
          className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-lg border border-gray-700"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Top States</h3>
          <div className="space-y-2">
            {processedData.stateData.slice(0, 5).map(state => (
              <div key={state.state} className="flex justify-between items-center">
                <span className="text-gray-300">{state.state}</span>
                <span className="text-blue-400 font-semibold">{state.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Map Legend</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ background: '#3b82f6' }}></div>
              <span className="text-gray-300 text-sm">US-Canada Border</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ background: '#ef4444' }}></div>
              <span className="text-gray-300 text-sm">US-Mexico Border</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorderMapVisualization; 