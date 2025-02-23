import React, { useMemo } from 'react';

const DistrictSelector = ({ data, selectedState, selectedDistrict, onDistrictChange }) => {
  const districts = useMemo(() => {
    if (!data || !selectedState) return [];
    
    // Get unique districts for the selected state
    const stateDistricts = [...new Set(
      data
        .filter(d => d.state_po === selectedState)
        .map(d => d.district)
    )].sort((a, b) => {
      // Handle "0" district (at-large) specially
      if (a === "0") return -1;
      if (b === "0") return 1;
      return parseInt(a) - parseInt(b);
    });

    return stateDistricts;
  }, [data, selectedState]);

  if (!districts.length) return null;

  return (
    <div className={`transition-all duration-300 ease-in-out transform ${
      districts.length ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      <select
        className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 ml-4"
        value={selectedDistrict}
        onChange={(e) => onDistrictChange(e.target.value)}
      >
        {districts.map((district) => (
          <option key={district} value={district}>
            {district === "0" ? "At-Large" : `District ${district}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DistrictSelector; 