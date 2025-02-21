import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { getPartyColor } from '../../utils/dataUtils';

// Use direct URL to ensure map data loads
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// FIPS to Postal Code mapping
const FIPS_TO_STATE = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY'
};

// Debug helper
const debugColor = (stateCode, result) => {
  console.log(`Color debug for ${stateCode}:`, {
    hasResult: !!result,
    rawColor: result?.color,
    winner: result?.winner?.name,
    demPercent: result?.demPercent,
    repPercent: result?.repPercent,
    computedFill: result?.color || '#808080'
  });
  return result?.color || '#808080';
};

const ElectionMap = ({ data, year }) => {
  const [selectedState, setSelectedState] = useState(null);

  const stateResults = useMemo(() => {
    console.log('Starting data processing with:', {
      dataLength: data?.length,
      year,
      sampleRecord: data?.[0]
    });

    if (!data?.length) {
      console.warn('No data provided to ElectionMap');
      return {};
    }

    const results = {};
    data.forEach(record => {
      const stateCode = record.state_po;
      if (!stateCode) return;

      if (!results[stateCode]) {
        results[stateCode] = {
          state: record.state,
          totalVotes: parseInt(record.totalvotes) || 0,
          demVotes: 0,
          repVotes: 0,
          candidates: []
        };
      }

      const votes = parseInt(record.candidatevotes) || 0;
      
      if (record.party_simplified === 'DEMOCRAT') {
        results[stateCode].demVotes += votes;
        console.log(`Adding ${votes} Democratic votes to ${stateCode}. Total now: ${results[stateCode].demVotes}`);
      } else if (record.party_simplified === 'REPUBLICAN') {
        results[stateCode].repVotes += votes;
        console.log(`Adding ${votes} Republican votes to ${stateCode}. Total now: ${results[stateCode].repVotes}`);
      }

      if (votes > 0) {
        const percentage = ((votes / results[stateCode].totalVotes) * 100).toFixed(1);
        results[stateCode].candidates.push({
          name: record.candidate,
          party: record.party_simplified,
          votes: votes,
          percentage: percentage
        });
        console.log(`Added candidate to ${stateCode}:`, {
          name: record.candidate,
          party: record.party_simplified,
          votes,
          percentage
        });
      }
    });

    console.log('After first pass - state vote totals:', 
      Object.entries(results).map(([code, data]) => ({
        state: code,
        demVotes: data.demVotes,
        repVotes: data.repVotes,
        total: data.totalVotes
      }))
    );

    // Second pass: Calculate percentages and colors
    Object.entries(results).forEach(([stateCode, state]) => {
      const totalMajorVotes = state.demVotes + state.repVotes;
      console.log(`Processing ${stateCode}:`, {
        demVotes: state.demVotes,
        repVotes: state.repVotes,
        totalMajorVotes
      });

      if (totalMajorVotes > 0) {
        const demPercent = (state.demVotes / totalMajorVotes * 100);
        const repPercent = (state.repVotes / totalMajorVotes * 100);
        
        state.demPercent = demPercent.toFixed(1);
        state.repPercent = repPercent.toFixed(1);

        console.log(`${stateCode} percentages:`, {
          demPercent: state.demPercent,
          repPercent: state.repPercent
        });

        // Sort candidates by votes
        state.candidates.sort((a, b) => b.votes - a.votes);
        
        if (demPercent > repPercent) {
          // Democrat win
          const margin = demPercent - repPercent;
          state.color = margin > 20 ? '#0000FF' : '#4169E1';
          state.winner = state.candidates.find(c => c.party === 'DEMOCRAT');
          console.log(`${stateCode} Democratic win:`, {
            margin,
            color: state.color,
            winner: state.winner?.name
          });
        } else {
          // Republican win
          const margin = repPercent - demPercent;
          state.color = margin > 20 ? '#FF0000' : '#CD5C5C';
          state.winner = state.candidates.find(c => c.party === 'REPUBLICAN');
          console.log(`${stateCode} Republican win:`, {
            margin,
            color: state.color,
            winner: state.winner?.name
          });
        }
      } else {
        console.warn(`${stateCode} has no major party votes!`);
        state.color = '#808080';
        state.winner = state.candidates[0];
      }
    });

    // Final validation
    console.log('Final state colors:', 
      Object.entries(results).map(([code, data]) => ({
        state: code,
        color: data.color,
        winner: data.winner?.name,
        demPercent: data.demPercent,
        repPercent: data.repPercent
      }))
    );

    // Add final debug log for all state colors
    const finalResults = Object.entries(results).reduce((acc, [code, data]) => {
      acc[code] = {
        color: data.color,
        winner: data.winner?.name,
        margin: data.demPercent > data.repPercent 
          ? data.demPercent - data.repPercent 
          : data.repPercent - data.demPercent
      };
      return acc;
    }, {});
    
    console.log('Final processed results:', finalResults);
    return results;
  }, [data, year]);

  // Log when rendering map
  console.log('Rendering map with state results:', stateResults);

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg p-4 overflow-hidden">
      {/* Map container with transition and scaling */}
      <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
        selectedState ? 'right-80 left-4' : 'right-4 left-4'
      }`}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 800,
          }}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#111827"
          }}
        >
          <ZoomableGroup center={[-96, 38]} zoom={0.9}>
            <Geographies geography={geoUrl}>
              {({ geographies }) => {
                // Debug: Log the first few geographies to see their structure
                console.log('Geography data sample:', 
                  geographies.slice(0, 3).map(geo => ({
                    id: geo.id,
                    properties: geo.properties,
                    rsmKey: geo.rsmKey
                  }))
                );

                return geographies.map(geo => {
                  // Convert FIPS code to state postal code
                  const fipsCode = geo.id;
                  const stateCode = FIPS_TO_STATE[fipsCode];
                  const result = stateResults[stateCode];

                  // Debug state matching
                  console.log(`Mapping state: FIPS=${fipsCode}, Postal=${stateCode}, hasData=${!!result}`, {
                    color: result?.color,
                    winner: result?.winner?.name
                  });

                  const fill = result?.color || '#808080';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#000"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                          cursor: "pointer"
                        },
                        hover: {
                          outline: "none",
                          opacity: 0.8
                        },
                        pressed: {
                          outline: "none"
                        },
                      }}
                      onClick={() => {
                        if (result) {
                          console.log(`Clicked ${stateCode}:`, {
                            color: fill,
                            result
                          });
                          setSelectedState({
                            ...result,
                            stateCode
                          });
                        }
                      }}
                    />
                  );
                });
              }}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Sliding Sidebar */}
      <div 
        className={`absolute top-0 right-0 h-full w-80 bg-black bg-opacity-90 transition-all duration-300 ${
          selectedState ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedState && (
          <div className="h-full p-4 text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {selectedState.state}
                <span className="block text-sm text-gray-400 mt-1">
                  {year} Election Results
                </span>
              </h3>
              <button 
                className="text-gray-400 hover:text-white text-xl p-1"
                onClick={() => setSelectedState(null)}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="font-medium">
                  Total Votes: {selectedState.totalVotes.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-3">Candidates</div>
                <div className="space-y-3">
                  {selectedState.candidates
                    .filter(c => parseFloat(c.percentage) >= 1)
                    .map((candidate, idx) => (
                      <div key={idx} className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{candidate.name}</span>
                          <span className="text-gray-400">{candidate.percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${candidate.percentage}%`,
                              backgroundColor: getPartyColor(candidate.party)
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {candidate.votes.toLocaleString()} votes
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionMap; 