import React from 'react';

const OfficeSelector = ({ selectedOffice, onOfficeChange }) => {
  const offices = ['PRESIDENT', 'SENATE', 'HOUSE'];

  return (
    <select
      className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 ml-4"
      value={selectedOffice}
      onChange={(e) => onOfficeChange(e.target.value)}
    >
      {offices.map((office) => (
        <option key={office} value={office}>
          {office.charAt(0) + office.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
};

export default OfficeSelector; 