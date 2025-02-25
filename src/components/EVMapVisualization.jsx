import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const EVMapVisualization = ({ evData }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Process data for visualization
  const processedData = useMemo(() => {
    if (!evData || !Array.isArray(evData) || evData.length === 0) 
      return { countyData: [], cityData: [], coordinates: [] };
    
    // Count by county
    const countyCount = {};
    // Count by city
    const cityCount = {};
    // Extract coordinates
    const coordinates = [];
    
    evData.forEach(vehicle => {
      if (!vehicle) return;
      
      const county = vehicle.County || 'Unknown';
      countyCount[county] = (countyCount[county] || 0) + 1;
      
      const city = vehicle.City || 'Unknown';
      cityCount[city] = (cityCount[city] || 0) + 1;
      
      // Extract coordinates from the POINT format (longitude, latitude)
      if (vehicle.VehicleLocation) {
        try {
          const match = vehicle.VehicleLocation.match(/POINT \(([^ ]+) ([^)]+)\)/);
          if (match && match.length === 3) {
            const longitude = parseFloat(match[1]);
            const latitude = parseFloat(match[2]);
            if (!isNaN(longitude) && !isNaN(latitude)) {
              coordinates.push({ 
                longitude, 
                latitude, 
                make: vehicle.Make || 'Unknown',
                model: vehicle.Model || 'Unknown',
                year: vehicle['Model Year'] || 'Unknown',
                city: city
              });
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates:', e);
        }
      }
    });
    
    return {
      countyData: Object.entries(countyCount)
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count),
      cityData: Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count),
      coordinates: coordinates
    };
  }, [evData]);
  
  // Sample of coordinates for display (to avoid overwhelming the map)
  const sampleCoordinates = useMemo(() => {
    if (!processedData.coordinates || processedData.coordinates.length === 0) return [];
    
    // Take a larger random sample of coordinates - increase from 200 to 1000
    const sampleSize = Math.min(1000, processedData.coordinates.length);
    const shuffled = [...processedData.coordinates].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, sampleSize);
  }, [processedData.coordinates]);
  
  // Color scale for markers based on vehicle year
  const colorScale = scaleLinear()
    .domain([2010, 2025])
    .range(['#00cc88', '#00aaff'])
    .clamp(true);
  
  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Calculate max count for the county bar chart scaling
  const maxCountyCount = useMemo(() => {
    if (!processedData.countyData || processedData.countyData.length === 0) return 1;
    return Math.max(...processedData.countyData.map(item => item.count));
  }, [processedData.countyData]);
  
  // WA state bounding box for map focus - adjusted coordinates
  const washingtonBounds = {
    center: [-120.7, 47.3],
    zoom: 5.5
  };

  return (
    <div className="relative bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-xl font-bold text-white mb-4">EV Geographic Distribution</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-300 text-sm">
            Distribution of {evData?.length.toLocaleString() || 0} electric vehicles across Washington
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Map */}
        <div className="md:w-1/2 h-[500px] bg-gray-900 rounded-lg overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={washingtonBounds}
          >
            <Geographies geography="/washington-counties.json">
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
            
            {sampleCoordinates.map((point, index) => (
              <Marker 
                key={`marker-${index}`}
                coordinates={[point.longitude, point.latitude]}
                onMouseEnter={() => {
                  setTooltipContent(`${point.year} ${point.make} ${point.model}`);
                  setShowTooltip(true);
                }}
                onMouseLeave={() => {
                  setShowTooltip(false);
                }}
              >
                <circle
                  r={4}
                  fill={point.year && !isNaN(parseInt(point.year)) ? colorScale(parseInt(point.year)) : '#888888'}
                  opacity={0.7}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                />
              </Marker>
            ))}
          </ComposableMap>
        </div>
        
        {/* County Breakdown */}
        <div className="md:w-1/2 bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">EV Distribution by County</h3>
          <div className="overflow-y-auto" style={{ maxHeight: "452px" }}>
            <div className="space-y-3">
              {processedData.countyData.slice(0, 20).map(({ county, count }) => (
                <div key={county} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">{county}</span>
                    <span className="text-sm text-green-400 font-semibold">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.max(2, (count / maxCountyCount) * 100)}%` }}
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
        >
          {tooltipContent}
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Top Cities</h3>
          <div className="space-y-2">
            {processedData.cityData.slice(0, 5).map(city => (
              <div key={city.city} className="flex justify-between items-center">
                <span className="text-gray-300">{city.city}</span>
                <span className="text-green-400 font-semibold">{city.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Map Legend</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ background: colorScale(2010) }}></div>
              <span className="text-gray-300 text-sm">2010-2014</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ background: colorScale(2015) }}></div>
              <span className="text-gray-300 text-sm">2015-2019</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ background: colorScale(2020) }}></div>
              <span className="text-gray-300 text-sm">2020+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVMapVisualization; 