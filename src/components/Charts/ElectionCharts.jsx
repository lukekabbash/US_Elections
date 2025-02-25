import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPartyColor } from '../../utils/dataUtils';

const ElectionCharts = ({ data, office, year, selectedState }) => {
  const { chartType: urlChartType } = useParams();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState(urlChartType || 'partyComparison');

  // Update URL when chart type changes
  useEffect(() => {
    if (chartType && chartType !== urlChartType) {
      let path = `/elections/${office.toLowerCase()}/${year}`;
      if (selectedState) {
        path += `/${selectedState.toLowerCase()}`;
      }
      path += `/charts/${chartType}`;
      navigate(path, { replace: true });
    }
  }, [chartType, urlChartType, office, year, selectedState, navigate]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group data by state or district
    const results = {};
    data.forEach(record => {
      // Skip empty or invalid records
      if (!record.state || !record.candidatevotes || record.candidate === '') return;

      const key = office === 'HOUSE' ? `${record.state}-${record.district}` : record.state;
      const displayName = office === 'HOUSE' 
        ? `${record.district === '0' ? 'At-Large' : `District ${record.district}`}`
        : record.state;

      if (!results[key]) {
        results[key] = {
          state: record.state,
          stateCode: record.state_po,
          district: record.district,
          displayName,
          totalVotes: parseInt(record.totalvotes) || 0,
          partyVotes: {
            'DEMOCRAT': 0,
            'REPUBLICAN': 0,
            'LIBERTARIAN': 0,
            'OTHER': 0
          },
          candidates: []
        };
      }

      // Only add named candidates with votes
      if (record.candidate && record.candidatevotes > 0) {
        const votes = parseInt(record.candidatevotes);
        const percentage = ((votes / parseInt(record.totalvotes)) * 100);
        
        // Add to party totals
        const party = record.party_simplified || 'OTHER';
        results[key].partyVotes[party] = (results[key].partyVotes[party] || 0) + votes;
        
        if (percentage >= 1) { // Only include candidates with >= 1%
          results[key].candidates.push({
            name: record.candidate,
            party: party,
            votes: votes,
            percentage: percentage.toFixed(1)
          });
        }
      }
    });

    // Calculate percentages and sort candidates
    Object.values(results).forEach(result => {
      result.candidates.sort((a, b) => b.votes - a.votes);
      
      // Calculate party percentages
      Object.keys(result.partyVotes).forEach(party => {
        result.partyVotes[party + '_pct'] = 
          ((result.partyVotes[party] / result.totalVotes) * 100).toFixed(1);
      });
    });

    return results;
  }, [data, office]);

  // Filter data based on selected state
  const filteredData = useMemo(() => {
    if (!chartData) return [];
    
    let filtered = Object.values(chartData);
    
    if (selectedState && office !== 'HOUSE') {
      filtered = filtered.filter(item => item.stateCode === selectedState);
    }
    
    return filtered;
  }, [chartData, selectedState, office]);

  // Render party comparison chart (horizontal bar chart)
  const renderPartyComparisonChart = () => {
    if (!filteredData || filteredData.length === 0) {
      return <div className="text-gray-400 text-center py-8">No data available</div>;
    }

    // For state-level view, show all states
    // For district-level view, show districts in the selected state
    const items = filteredData;
    
    // Sort by Democratic percentage for better visualization
    items.sort((a, b) => 
      parseFloat(b.partyVotes['DEMOCRAT_pct']) - parseFloat(a.partyVotes['DEMOCRAT_pct'])
    );

    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium text-white">
          {office === 'HOUSE' 
            ? `${year} House Results by District` 
            : `${year} ${office} Results by State`}
        </h3>
        <div className="overflow-y-auto max-h-[500px] pr-2">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{item.displayName}</span>
                  <span className="text-gray-400">{item.totalVotes.toLocaleString()} votes</span>
                </div>
                <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                  {/* Democratic portion */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-600"
                    style={{ width: `${item.partyVotes['DEMOCRAT_pct']}%` }}
                  />
                  {/* Republican portion */}
                  <div 
                    className="absolute top-0 h-full bg-red-600"
                    style={{ 
                      left: `${item.partyVotes['DEMOCRAT_pct']}%`,
                      width: `${item.partyVotes['REPUBLICAN_pct']}%` 
                    }}
                  />
                  {/* Libertarian portion */}
                  <div 
                    className="absolute top-0 h-full bg-yellow-500"
                    style={{ 
                      left: `${parseFloat(item.partyVotes['DEMOCRAT_pct']) + parseFloat(item.partyVotes['REPUBLICAN_pct'])}%`,
                      width: `${item.partyVotes['LIBERTARIAN_pct']}%` 
                    }}
                  />
                  {/* Other portion */}
                  <div 
                    className="absolute top-0 h-full bg-gray-500"
                    style={{ 
                      left: `${parseFloat(item.partyVotes['DEMOCRAT_pct']) + 
                             parseFloat(item.partyVotes['REPUBLICAN_pct']) + 
                             parseFloat(item.partyVotes['LIBERTARIAN_pct'])}%`,
                      width: `${item.partyVotes['OTHER_pct']}%` 
                    }}
                  />
                  
                  {/* Labels */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white">
                    <span>D: {item.partyVotes['DEMOCRAT_pct']}%</span>
                    <span>R: {item.partyVotes['REPUBLICAN_pct']}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>Democrat</span>
                  <span>Republican</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render turnout comparison
  const renderTurnoutComparison = () => {
    if (!filteredData || filteredData.length === 0) {
      return <div className="text-gray-400 text-center py-8">No data available</div>;
    }

    // Sort by total votes
    const sortedData = [...filteredData].sort((a, b) => b.totalVotes - a.totalVotes);
    const maxVotes = sortedData[0]?.totalVotes || 1;

    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium text-white">
          {`${year} ${office} Voter Turnout`}
        </h3>
        <div className="overflow-y-auto max-h-[500px] pr-2">
          <div className="space-y-3">
            {sortedData.map((item, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{item.displayName}</span>
                  <span className="text-gray-400">{item.totalVotes.toLocaleString()} votes</span>
                </div>
                <div className="relative h-6 bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-green-600"
                    style={{ width: `${(item.totalVotes / maxVotes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-800 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              chartType === 'partyComparison' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setChartType('partyComparison')}
          >
            Party Comparison
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              chartType === 'turnoutComparison' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setChartType('turnoutComparison')}
          >
            Turnout Comparison
          </button>
        </div>
      </div>
      
      <div className="min-h-[400px]">
        {chartType === 'partyComparison' && renderPartyComparisonChart()}
        {chartType === 'turnoutComparison' && renderTurnoutComparison()}
      </div>
    </div>
  );
};

export default ElectionCharts; 