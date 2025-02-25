import React, { useState, useMemo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Annotation,
} from 'react-simple-maps';
import { getPartyColor } from '../../utils/dataUtils';

// Use direct URL to ensure map data loads
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const districtUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/districts-10m.json";

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

// State name to postal code mapping
const STATE_NAMES = {
  'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA',
  'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'FLORIDA': 'FL', 'GEORGIA': 'GA',
  'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA',
  'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
  'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS', 'MISSOURI': 'MO',
  'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
  'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH',
  'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
  'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT',
  'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV', 'WISCONSIN': 'WI', 'WYOMING': 'WY'
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

const STATE_CENTERS = {
  'AL': [-86.79113, 32.806671], 'AK': [-152.404419, 61.370716], 'AZ': [-111.431221, 33.729759],
  'AR': [-92.373123, 34.969704], 'CA': [-119.681564, 36.116203], 'CO': [-105.311104, 39.059811],
  'CT': [-72.755371, 41.597782], 'DE': [-75.507141, 39.318523], 'FL': [-81.686783, 27.664827],
  'GA': [-83.643074, 32.157435], 'HI': [-155.665857, 19.898682], 'ID': [-114.478828, 44.240459],
  'IL': [-88.986137, 40.349457], 'IN': [-86.258278, 39.849426], 'IA': [-93.210526, 42.011539],
  'KS': [-96.726486, 38.526600], 'KY': [-84.670067, 37.668140], 'LA': [-91.867805, 31.169546],
  'ME': [-69.381927, 44.693947], 'MD': [-76.802101, 39.063946], 'MA': [-71.530106, 42.230171],
  'MI': [-84.536095, 43.326618], 'MN': [-93.900192, 45.694454], 'MS': [-89.678696, 32.741646],
  'MO': [-92.288368, 38.456085], 'MT': [-110.454353, 46.921925], 'NE': [-98.268082, 41.125370],
  'NV': [-117.055374, 38.313515], 'NH': [-71.563896, 43.452492], 'NJ': [-74.521011, 40.298904],
  'NM': [-106.248482, 34.840515], 'NY': [-74.948051, 42.165726], 'NC': [-79.806419, 35.630066],
  'ND': [-99.784012, 47.528912], 'OH': [-82.764915, 40.388783], 'OK': [-96.928917, 35.565342],
  'OR': [-122.070938, 44.572021], 'PA': [-77.209755, 40.590752], 'RI': [-71.477429, 41.680893],
  'SC': [-80.945007, 33.856892], 'SD': [-99.438828, 44.299782], 'TN': [-86.692345, 35.747845],
  'TX': [-97.563461, 31.054487], 'UT': [-111.862434, 40.150032], 'VT': [-72.710686, 44.045876],
  'VA': [-78.169968, 37.769337], 'WA': [-121.490494, 47.400902], 'WV': [-80.954453, 38.491226],
  'WI': [-89.616508, 44.268543], 'WY': [-107.290284, 42.755966]
};

const STATE_SCALES = {
  'AK': 0.35, 'HI': 0.7, 'CA': 0.8, 'TX': 0.8, 'MT': 0.7, 'NM': 0.7,
  'AZ': 0.7, 'NV': 0.7, 'CO': 0.7, 'OR': 0.7, 'WY': 0.7, 'MI': 0.7,
  'MN': 0.7, 'UT': 0.7, 'ID': 0.7, 'KS': 0.7, 'NE': 0.7, 'SD': 0.7,
  'ND': 0.7, 'OK': 0.7, 'MO': 0.7, 'WA': 0.7, 'AR': 0.8, 'IA': 0.8,
  'LA': 0.8, 'WI': 0.8, 'IL': 0.8, 'IN': 0.8, 'OH': 0.8, 'KY': 0.8,
  'TN': 0.8, 'MS': 0.8, 'AL': 0.8, 'GA': 0.8, 'SC': 0.8, 'NC': 0.8,
  'VA': 0.8, 'WV': 0.9, 'PA': 0.9, 'NY': 0.9, 'ME': 0.9, 'VT': 1,
  'NH': 1, 'MA': 1, 'RI': 1.2, 'CT': 1, 'NJ': 1, 'DE': 1.2, 'MD': 1,
  'DC': 1.2, 'FL': 0.8
};

const ElectionMap = ({ data, year, office, onStateSelect, focusedState }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const mapRef = useRef(null);

  const stateResults = useMemo(() => {
    console.log('Starting data processing with:', {
      dataLength: data?.length,
      year,
      office,
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
      } else if (record.party_simplified === 'REPUBLICAN') {
        results[stateCode].repVotes += votes;
      }

      if (votes > 0) {
        const percentage = ((votes / results[stateCode].totalVotes) * 100).toFixed(1);
        results[stateCode].candidates.push({
          name: record.candidate,
          party: record.party_simplified,
          votes: votes,
          percentage: percentage,
          district: office === 'HOUSE' ? record.district : null
        });
      }
    });

    // Calculate percentages and colors
    Object.entries(results).forEach(([stateCode, state]) => {
      const totalMajorVotes = state.demVotes + state.repVotes;

      if (totalMajorVotes > 0) {
        const demPercent = (state.demVotes / totalMajorVotes * 100);
        const repPercent = (state.repVotes / totalMajorVotes * 100);
        
        state.demPercent = demPercent.toFixed(1);
        state.repPercent = repPercent.toFixed(1);

        // Sort candidates by votes
        state.candidates.sort((a, b) => b.votes - a.votes);
        
        if (demPercent > repPercent) {
          const margin = demPercent - repPercent;
          state.color = margin > 20 ? '#0000FF' : '#4169E1';
          state.winner = state.candidates.find(c => c.party === 'DEMOCRAT');
        } else {
          const margin = repPercent - demPercent;
          state.color = margin > 20 ? '#FF0000' : '#CD5C5C';
          state.winner = state.candidates.find(c => c.party === 'REPUBLICAN');
        }
      } else {
        state.color = '#808080';
        state.winner = state.candidates[0];
      }
    });

    return results;
  }, [data, year, office]);

  // Process district results
  const districtResults = useMemo(() => {
    if (office !== 'HOUSE' || !data?.length) return {};

    const results = {};
    data.forEach(record => {
      const stateCode = record.state_po;
      const district = record.district;
      if (!stateCode || !district) return;

      const key = `${stateCode}-${district}`;
      if (!results[key]) {
        results[key] = {
          state: record.state,
          district: district,
          totalVotes: parseInt(record.totalvotes) || 0,
          demVotes: 0,
          repVotes: 0,
          candidates: []
        };
      }

      const votes = parseInt(record.candidatevotes) || 0;
      
      if (record.party_simplified === 'DEMOCRAT') {
        results[key].demVotes += votes;
      } else if (record.party_simplified === 'REPUBLICAN') {
        results[key].repVotes += votes;
      }

      if (votes > 0) {
        const percentage = ((votes / results[key].totalVotes) * 100).toFixed(1);
        results[key].candidates.push({
          name: record.candidate,
          party: record.party_simplified,
          votes: votes,
          percentage: percentage
        });
      }
    });

    // Calculate colors for districts
    Object.entries(results).forEach(([key, district]) => {
      const totalMajorVotes = district.demVotes + district.repVotes;
      if (totalMajorVotes > 0) {
        const demPercent = (district.demVotes / totalMajorVotes * 100);
        const repPercent = (district.repVotes / totalMajorVotes * 100);
        
        district.candidates.sort((a, b) => b.votes - a.votes);
        district.demPercent = demPercent.toFixed(1);
        district.repPercent = repPercent.toFixed(1);
        
        if (demPercent > repPercent) {
          const margin = demPercent - repPercent;
          district.color = margin > 20 ? '#0000FF' : '#4169E1';
          district.winner = district.candidates.find(c => c.party === 'DEMOCRAT');
        } else {
          const margin = repPercent - demPercent;
          district.color = margin > 20 ? '#FF0000' : '#CD5C5C';
          district.winner = district.candidates.find(c => c.party === 'REPUBLICAN');
        }
      } else {
        district.color = '#808080';
        district.winner = district.candidates[0];
      }
    });

    return results;
  }, [data, office]);

  // Calculate district centers for labels
  const districtCenters = useMemo(() => {
    const centers = {};
    if (office === 'HOUSE' && focusedState) {
      // We'll populate this when processing the geographies
    }
    return centers;
  }, [office, focusedState]);

  const handleStateClick = (stateCode, result) => {
    if (office === 'HOUSE') {
      onStateSelect?.(stateCode);
    } else if (result) {
      setSelectedState({
        ...result,
        stateCode
      });
    }
  };

  const handleDistrictClick = (stateCode, districtNum, result) => {
    if (result) {
      setSelectedDistrict({
        ...result,
        stateCode,
        districtNum
      });
    }
  };

  const mapConfig = useMemo(() => {
    if (office === 'HOUSE' && focusedState && STATE_CENTERS[focusedState]) {
      return {
        center: STATE_CENTERS[focusedState],
        zoom: STATE_SCALES[focusedState] ? 1 / STATE_SCALES[focusedState] * 5 : 5,
      };
    }
    return {
      center: [-96, 38],
      zoom: 0.9,
    };
  }, [office, focusedState]);

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg p-4 overflow-hidden" ref={mapRef}>
      {/* Map container with transition and scaling */}
      <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
        (selectedState || selectedDistrict) ? 'right-80 left-4' : 'right-4 left-4'
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
          <ZoomableGroup 
            center={mapConfig.center} 
            zoom={mapConfig.zoom}
            translateExtent={[[-200, -200], [1000, 600]]}
          >
            {/* Base state layer */}
            <Geographies geography={geoUrl}>
              {({ geographies }) => 
                geographies.map(geo => {
                  const fipsCode = geo.id;
                  const stateCode = FIPS_TO_STATE[fipsCode];
                  
                  // For House elections, only show the selected state
                  if (office === 'HOUSE') {
                    if (focusedState && stateCode !== focusedState) return null;
                    // Show state outline in House view
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="none"
                        stroke="#666"
                        strokeWidth={1}
                        style={{
                          default: {
                            cursor: focusedState ? "default" : "pointer"
                          }
                        }}
                        onClick={() => !focusedState && handleStateClick(stateCode, stateResults[stateCode])}
                      />
                    );
                  }

                  // Normal state view for President/Senate
                  const result = stateResults[stateCode];
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
                      onClick={() => handleStateClick(stateCode, result)}
                      onMouseEnter={() => {
                        if (result) {
                          setHoverInfo({
                            stateCode,
                            stateName: result.state,
                            winner: result.winner,
                            demPercent: result.demPercent,
                            repPercent: result.repPercent
                          });
                        }
                      }}
                      onMouseLeave={() => setHoverInfo(null)}
                    />
                  );
                })
              }
            </Geographies>

            {/* Congressional districts layer */}
            {office === 'HOUSE' && focusedState && (
              <Geographies geography={districtUrl}>
                {({ geographies }) => {
                  // Calculate district centers for labels
                  const districtCenters = {};
                  
                  return geographies.map(geo => {
                    const stateName = geo.properties.STATENAME;
                    const stateCode = STATE_NAMES[stateName?.toUpperCase()];
                    // Convert CD116FP to simple district number by removing leading zeros
                    const districtNum = parseInt(geo.properties.CD116FP || '0', 10).toString();
                    
                    // Only show districts for the selected state
                    if (!stateCode || stateCode !== focusedState) return null;

                    // Calculate district center for label
                    if (!districtCenters[`${stateCode}-${districtNum}`]) {
                      try {
                        const bounds = geo.geometry.coordinates[0].reduce(
                          (acc, coord) => {
                            return {
                              minX: Math.min(acc.minX, coord[0]),
                              minY: Math.min(acc.minY, coord[1]),
                              maxX: Math.max(acc.maxX, coord[0]),
                              maxY: Math.max(acc.maxY, coord[1])
                            };
                          },
                          { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
                        );
                        
                        districtCenters[`${stateCode}-${districtNum}`] = [
                          (bounds.minX + bounds.maxX) / 2,
                          (bounds.minY + bounds.maxY) / 2
                        ];
                      } catch (e) {
                        // Fallback if we can't calculate center
                        districtCenters[`${stateCode}-${districtNum}`] = [0, 0];
                      }
                    }

                    const key = `${stateCode}-${districtNum}`;
                    const result = districtResults[key];
                    const fill = result?.color || '#808080';
                    const isSelected = selectedDistrict?.stateCode === stateCode && 
                                     selectedDistrict?.districtNum === districtNum;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#FFF"
                        strokeWidth={isSelected ? 2 : 0.5}
                        style={{
                          default: {
                            outline: "none",
                            cursor: "pointer",
                            opacity: isSelected ? 1 : 0.9
                          },
                          hover: {
                            outline: "none",
                            opacity: 1
                          },
                          pressed: {
                            outline: "none"
                          },
                        }}
                        onClick={() => handleDistrictClick(stateCode, districtNum, result)}
                        onMouseEnter={() => {
                          if (result) {
                            setHoverInfo({
                              stateCode,
                              stateName: result.state,
                              district: districtNum,
                              winner: result.winner,
                              demPercent: result.demPercent,
                              repPercent: result.repPercent
                            });
                          }
                        }}
                        onMouseLeave={() => setHoverInfo(null)}
                      />
                    );
                  });
                }}
              </Geographies>
            )}

            {/* District labels */}
            {office === 'HOUSE' && focusedState && (
              <Geographies geography={districtUrl}>
                {({ geographies }) => {
                  // Get unique districts and their centers
                  const districtCenters = {};
                  
                  geographies.forEach(geo => {
                    const stateName = geo.properties.STATENAME;
                    const stateCode = STATE_NAMES[stateName?.toUpperCase()];
                    const districtNum = parseInt(geo.properties.CD116FP || '0', 10).toString();
                    
                    if (stateCode !== focusedState) return;
                    
                    const key = `${stateCode}-${districtNum}`;
                    if (districtCenters[key]) return;
                    
                    try {
                      // Simple centroid calculation
                      if (geo.geometry.type === "Polygon") {
                        const coords = geo.geometry.coordinates[0];
                        const centroid = coords.reduce(
                          (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
                          [0, 0]
                        );
                        districtCenters[key] = [
                          centroid[0] / coords.length,
                          centroid[1] / coords.length
                        ];
                      }
                    } catch (e) {
                      console.error("Error calculating district center", e);
                    }
                  });
                  
                  return Object.entries(districtCenters).map(([key, center]) => {
                    const [stateCode, districtNum] = key.split('-');
                    if (!center[0] || !center[1]) return null;
                    
                    return (
                      <Annotation
                        key={key}
                        subject={center}
                        dx={0}
                        dy={0}
                        connectorProps={{}}
                      >
                        <text
                          x={0}
                          y={0}
                          fontSize={10}
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fill="#fff"
                          stroke="#000"
                          strokeWidth={0.5}
                          style={{ pointerEvents: "none" }}
                        >
                          {districtNum === "0" ? "AL" : districtNum}
                        </text>
                      </Annotation>
                    );
                  });
                }}
              </Geographies>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Hover tooltip - fixed position */}
      {hoverInfo && (
        <div 
          className="absolute bg-black bg-opacity-80 text-white p-3 rounded pointer-events-none z-10 shadow-lg border border-gray-700"
          style={{ 
            top: "20px",
            right: selectedState || selectedDistrict ? "340px" : "20px",
            width: "220px"
          }}
        >
          <div className="font-bold">
            {hoverInfo.stateName}
            {hoverInfo.district && (
              <span className="ml-1">
                {hoverInfo.district === "0" ? " (At-Large)" : ` - District ${hoverInfo.district}`}
              </span>
            )}
          </div>
          {hoverInfo.winner && (
            <>
              <div className="text-sm mt-1">
                Winner: <span className="font-medium">{hoverInfo.winner.name}</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {hoverInfo.winner.party}: {hoverInfo.winner.percentage}%
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-blue-400">Dem: {hoverInfo.demPercent}%</span>
                <span className="text-red-400">Rep: {hoverInfo.repPercent}%</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Sliding Sidebar */}
      <div 
        className={`absolute top-0 right-0 h-full w-80 bg-black bg-opacity-90 transition-all duration-300 ${
          (selectedState || selectedDistrict) ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {(selectedState || selectedDistrict) && (
          <div className="h-full p-4 text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {selectedDistrict ? (
                  <>
                    {selectedDistrict.state}
                    <span className="block text-sm text-gray-400 mt-1">
                      {selectedDistrict.district === "0" ? "At-Large District" : `District ${selectedDistrict.district}`}
                    </span>
                  </>
                ) : (
                  <>
                    {selectedState.state}
                    <span className="block text-sm text-gray-400 mt-1">
                      {year} {office} Election Results
                    </span>
                  </>
                )}
              </h3>
              <button 
                className="text-gray-400 hover:text-white text-xl p-1"
                onClick={() => {
                  if (selectedDistrict) {
                    setSelectedDistrict(null);
                  } else {
                    setSelectedState(null);
                    if (onStateSelect) {
                      onStateSelect(null);
                    }
                  }
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="font-medium">
                  Total Votes: {(selectedDistrict || selectedState).totalVotes.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-3">Candidates</div>
                <div className="space-y-3">
                  {(selectedDistrict || selectedState).candidates
                    .filter(c => parseFloat(c.percentage) >= 1)
                    .map((candidate, idx) => (
                      <div key={idx} className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium truncate max-w-[70%]">
                            {candidate.name}
                          </span>
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