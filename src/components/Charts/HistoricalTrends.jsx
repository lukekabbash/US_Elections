import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPartyColor } from '../../utils/dataUtils';

const HistoricalTrends = ({ allData, office, selectedState }) => {
  const { trendType: urlTrendType, entity: urlEntity } = useParams();
  const navigate = useNavigate();
  const [trendType, setTrendType] = useState(urlTrendType || 'partyShare');
  const [selectedEntity, setSelectedEntity] = useState(urlEntity || selectedState || null);

  // Update URL when selections change
  useEffect(() => {
    if ((trendType && trendType !== urlTrendType) || (selectedEntity !== urlEntity)) {
      let path = `/elections/${office.toLowerCase()}/trends/${trendType}`;
      if (selectedEntity) {
        path += `/${selectedEntity}`;
      }
      navigate(path, { replace: true });
    }
  }, [trendType, urlTrendType, selectedEntity, urlEntity, office, navigate]);

  // Process data for historical trends
  const trendData = useMemo(() => {
    if (!allData || !allData.length) return null;

    // Group data by year and state/district
    const yearlyData = {};
    
    allData.forEach(record => {
      // Skip empty or invalid records
      if (!record.year || !record.state || !record.candidatevotes) return;
      
      const year = parseInt(record.year);
      const stateCode = record.state_po;
      const district = office === 'HOUSE' ? record.district : null;
      const key = district ? `${stateCode}-${district}` : stateCode;
      
      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      
      if (!yearlyData[year][key]) {
        yearlyData[year][key] = {
          state: record.state,
          stateCode,
          district,
          displayName: district 
            ? `${record.state} ${district === '0' ? 'At-Large' : `District ${district}`}`
            : record.state,
          totalVotes: parseInt(record.totalvotes) || 0,
          partyVotes: {
            'DEMOCRAT': 0,
            'REPUBLICAN': 0,
            'LIBERTARIAN': 0,
            'OTHER': 0
          }
        };
      }
      
      // Add votes to party totals
      const party = record.party_simplified || 'OTHER';
      const votes = parseInt(record.candidatevotes) || 0;
      yearlyData[year][key].partyVotes[party] = 
        (yearlyData[year][key].partyVotes[party] || 0) + votes;
    });
    
    // Calculate percentages
    Object.keys(yearlyData).forEach(year => {
      Object.keys(yearlyData[year]).forEach(key => {
        const entity = yearlyData[year][key];
        
        // Calculate party percentages
        Object.keys(entity.partyVotes).forEach(party => {
          entity.partyVotes[party + '_pct'] = 
            ((entity.partyVotes[party] / entity.totalVotes) * 100).toFixed(1);
        });
      });
    });
    
    return yearlyData;
  }, [allData, office]);

  // Get available years
  const years = useMemo(() => {
    if (!trendData) return [];
    return Object.keys(trendData)
      .map(year => parseInt(year))
      .sort((a, b) => a - b);
  }, [trendData]);

  // Get available entities (states or districts)
  const entities = useMemo(() => {
    if (!trendData || !years.length) return [];
    
    const entityMap = new Map();
    
    // Collect all entities across all years
    years.forEach(year => {
      Object.entries(trendData[year]).forEach(([key, data]) => {
        if (!entityMap.has(key)) {
          entityMap.set(key, {
            key,
            displayName: data.displayName,
            stateCode: data.stateCode,
            district: data.district
          });
        }
      });
    });
    
    return Array.from(entityMap.values());
  }, [trendData, years]);

  // Filter entities based on selected state
  const filteredEntities = useMemo(() => {
    if (!entities.length) return [];
    
    if (selectedState) {
      return entities.filter(entity => entity.stateCode === selectedState);
    }
    
    return entities;
  }, [entities, selectedState]);

  // Get trend data for selected entity
  const entityTrendData = useMemo(() => {
    if (!trendData || !selectedEntity) return null;
    
    const data = [];
    
    years.forEach(year => {
      if (trendData[year] && trendData[year][selectedEntity]) {
        data.push({
          year,
          ...trendData[year][selectedEntity]
        });
      }
    });
    
    return data;
  }, [trendData, selectedEntity, years]);

  // Get national trend data (average across all entities)
  const nationalTrendData = useMemo(() => {
    if (!trendData || !years.length) return null;
    
    const data = [];
    
    years.forEach(year => {
      if (!trendData[year]) return;
      
      const yearData = {
        year,
        totalVotes: 0,
        partyVotes: {
          'DEMOCRAT': 0,
          'REPUBLICAN': 0,
          'LIBERTARIAN': 0,
          'OTHER': 0
        }
      };
      
      // Sum votes across all entities
      Object.values(trendData[year]).forEach(entity => {
        yearData.totalVotes += entity.totalVotes;
        
        Object.keys(entity.partyVotes).forEach(party => {
          if (typeof entity.partyVotes[party] === 'number') {
            yearData.partyVotes[party] += entity.partyVotes[party];
          }
        });
      });
      
      // Calculate percentages
      Object.keys(yearData.partyVotes).forEach(party => {
        if (party.includes('_pct')) return;
        
        yearData.partyVotes[party + '_pct'] = 
          ((yearData.partyVotes[party] / yearData.totalVotes) * 100).toFixed(1);
      });
      
      data.push(yearData);
    });
    
    return data;
  }, [trendData, years]);

  // Render party share trend chart
  const renderPartyShareTrend = () => {
    const data = selectedEntity ? entityTrendData : nationalTrendData;
    
    if (!data || !data.length) {
      return (
        <div className="text-gray-400 text-center py-8">
          {selectedEntity 
            ? "No historical data available for the selected entity" 
            : "No historical data available"}
        </div>
      );
    }
    
    const chartHeight = 300;
    const chartWidth = data.length * 60;
    
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium text-white">
          {selectedEntity 
            ? `Party Vote Share Trend for ${filteredEntities.find(e => e.key === selectedEntity)?.displayName || selectedEntity}`
            : `National Party Vote Share Trend for ${office}`}
        </h3>
        
        <div className="overflow-x-auto">
          <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
            <div className="relative" style={{ height: `${chartHeight}px` }}>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400">
                <div>100%</div>
                <div>75%</div>
                <div>50%</div>
                <div>25%</div>
                <div>0%</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-0">
                {[0, 25, 50, 75, 100].map(percent => (
                  <div 
                    key={percent} 
                    className="absolute left-0 right-0 border-t border-gray-800"
                    style={{ top: `${100 - percent}%` }}
                  />
                ))}
              </div>
              
              {/* Bars */}
              <div className="absolute left-10 right-0 top-0 bottom-0 flex justify-around">
                {data.map((yearData, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="relative w-20 h-full">
                      {/* Democratic portion */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-600"
                        style={{ 
                          height: `${yearData.partyVotes['DEMOCRAT_pct']}%`,
                        }}
                      />
                      {/* Republican portion */}
                      <div 
                        className="absolute left-0 right-0 bg-red-600"
                        style={{ 
                          bottom: `${yearData.partyVotes['DEMOCRAT_pct']}%`,
                          height: `${yearData.partyVotes['REPUBLICAN_pct']}%` 
                        }}
                      />
                      {/* Libertarian portion */}
                      <div 
                        className="absolute left-0 right-0 bg-yellow-500"
                        style={{ 
                          bottom: `${parseFloat(yearData.partyVotes['DEMOCRAT_pct']) + 
                                   parseFloat(yearData.partyVotes['REPUBLICAN_pct'])}%`,
                          height: `${yearData.partyVotes['LIBERTARIAN_pct']}%` 
                        }}
                      />
                      {/* Other portion */}
                      <div 
                        className="absolute left-0 right-0 bg-gray-500"
                        style={{ 
                          bottom: `${parseFloat(yearData.partyVotes['DEMOCRAT_pct']) + 
                                   parseFloat(yearData.partyVotes['REPUBLICAN_pct']) + 
                                   parseFloat(yearData.partyVotes['LIBERTARIAN_pct'])}%`,
                          height: `${yearData.partyVotes['OTHER_pct']}%` 
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{yearData.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 mr-1"></div>
            <span className="text-xs text-gray-300">Democrat</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 mr-1"></div>
            <span className="text-xs text-gray-300">Republican</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 mr-1"></div>
            <span className="text-xs text-gray-300">Libertarian</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 mr-1"></div>
            <span className="text-xs text-gray-300">Other</span>
          </div>
        </div>
      </div>
    );
  };

  // Render party margin trend chart
  const renderPartyMarginTrend = () => {
    const data = selectedEntity ? entityTrendData : nationalTrendData;
    
    if (!data || !data.length) {
      return (
        <div className="text-gray-400 text-center py-8">
          {selectedEntity 
            ? "No historical data available for the selected entity" 
            : "No historical data available"}
        </div>
      );
    }
    
    // Calculate margins (Dem - Rep)
    const marginData = data.map(yearData => ({
      year: yearData.year,
      margin: parseFloat(yearData.partyVotes['DEMOCRAT_pct']) - parseFloat(yearData.partyVotes['REPUBLICAN_pct'])
    }));
    
    const maxMargin = Math.max(50, ...marginData.map(d => Math.abs(d.margin)));
    const chartHeight = 300;
    const chartWidth = data.length * 60;
    
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium text-white">
          {selectedEntity 
            ? `Party Margin Trend for ${filteredEntities.find(e => e.key === selectedEntity)?.displayName || selectedEntity}`
            : `National Party Margin Trend for ${office}`}
        </h3>
        
        <div className="overflow-x-auto">
          <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
            <div className="relative" style={{ height: `${chartHeight}px` }}>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-400">
                <div>+{maxMargin}%</div>
                <div>+25%</div>
                <div>0%</div>
                <div>-25%</div>
                <div>-{maxMargin}%</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-0">
                {[-maxMargin, -25, 0, 25, maxMargin].map(margin => (
                  <div 
                    key={margin} 
                    className={`absolute left-0 right-0 border-t ${margin === 0 ? 'border-gray-600' : 'border-gray-800'}`}
                    style={{ top: `${((maxMargin - margin) / (2 * maxMargin)) * 100}%` }}
                  />
                ))}
              </div>
              
              {/* Bars */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex justify-around">
                {marginData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="relative w-12 h-full">
                      <div 
                        className={`absolute w-8 ${item.margin >= 0 ? 'bg-blue-600 bottom-1/2' : 'bg-red-600 top-1/2'}`}
                        style={{ 
                          height: `${(Math.abs(item.margin) / (2 * maxMargin)) * 100}%`,
                          left: '2px'
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{item.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 mr-1"></div>
            <span className="text-xs text-gray-300">Democratic Advantage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 mr-1"></div>
            <span className="text-xs text-gray-300">Republican Advantage</span>
          </div>
        </div>
      </div>
    );
  };

  // Render turnout trend chart
  const renderTurnoutTrend = () => {
    const data = selectedEntity ? entityTrendData : nationalTrendData;
    
    if (!data || !data.length) {
      return (
        <div className="text-gray-400 text-center py-8">
          {selectedEntity 
            ? "No historical data available for the selected entity" 
            : "No historical data available"}
        </div>
      );
    }
    
    const maxTurnout = Math.max(...data.map(d => d.totalVotes));
    const chartHeight = 300;
    const chartWidth = data.length * 60;
    
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium text-white">
          {selectedEntity 
            ? `Voter Turnout Trend for ${filteredEntities.find(e => e.key === selectedEntity)?.displayName || selectedEntity}`
            : `National Voter Turnout Trend for ${office}`}
        </h3>
        
        <div className="overflow-x-auto">
          <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
            <div className="relative" style={{ height: `${chartHeight}px` }}>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-gray-400">
                <div>{(maxTurnout).toLocaleString()}</div>
                <div>{(maxTurnout * 0.75).toLocaleString()}</div>
                <div>{(maxTurnout * 0.5).toLocaleString()}</div>
                <div>{(maxTurnout * 0.25).toLocaleString()}</div>
                <div>0</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-20 right-0 top-0 bottom-0">
                {[0, 0.25, 0.5, 0.75, 1].map(percent => (
                  <div 
                    key={percent} 
                    className="absolute left-0 right-0 border-t border-gray-800"
                    style={{ top: `${(1 - percent) * 100}%` }}
                  />
                ))}
              </div>
              
              {/* Line chart */}
              <div className="absolute left-20 right-0 top-0 bottom-0">
                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth - 20} ${chartHeight}`} preserveAspectRatio="none">
                  <polyline
                    points={data.map((d, i) => `${(i * 60) + 30},${chartHeight - (d.totalVotes / maxTurnout) * chartHeight}`).join(' ')}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  {data.map((d, i) => (
                    <circle
                      key={i}
                      cx={(i * 60) + 30}
                      cy={chartHeight - (d.totalVotes / maxTurnout) * chartHeight}
                      r="4"
                      fill="#10B981"
                    />
                  ))}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute left-20 right-0 bottom-0 flex justify-around">
                {data.map((d, idx) => (
                  <div key={idx} className="text-xs text-gray-400 mt-2">{d.year}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-800 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              trendType === 'partyShare' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setTrendType('partyShare')}
          >
            Party Share
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              trendType === 'partyMargin' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setTrendType('partyMargin')}
          >
            Party Margin
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              trendType === 'turnout' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setTrendType('turnout')}
          >
            Voter Turnout
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">View:</span>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedEntity
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedEntity(null)}
          >
            National
          </button>
          
          {filteredEntities.length > 0 && (
            <select
              className="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 text-sm border border-gray-700"
              value={selectedEntity || ''}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              <option value="">Select {office === 'HOUSE' ? 'District' : 'State'}</option>
              {filteredEntities.map((entity) => (
                <option key={entity.key} value={entity.key}>
                  {entity.displayName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="min-h-[400px]">
        {trendType === 'partyShare' && renderPartyShareTrend()}
        {trendType === 'partyMargin' && renderPartyMarginTrend()}
        {trendType === 'turnout' && renderTurnoutTrend()}
      </div>
    </div>
  );
};

export default HistoricalTrends; 