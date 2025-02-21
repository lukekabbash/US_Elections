import React from 'react';
import { getPartyColor } from '../../utils/dataUtils';

const Legend = () => {
  const parties = ['DEMOCRAT', 'REPUBLICAN', 'LIBERTARIAN', 'OTHER'];

  return (
    <div className="flex justify-center items-center py-4 px-6 bg-black bg-opacity-50">
      {parties.map(party => (
        <div key={party} className="flex items-center space-x-2 mx-3">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getPartyColor(party) }}
          />
          <span className="text-sm text-white font-medium">
            {party.charAt(0) + party.slice(1).toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend; 