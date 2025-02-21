import React from 'react';

const YearSelector = ({ selectedYear, onYearChange, availableYears = [] }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        className="p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        onClick={() => {
          const currentIndex = availableYears.indexOf(selectedYear);
          if (currentIndex > 0) {
            onYearChange(availableYears[currentIndex - 1]);
          }
        }}
        disabled={availableYears.indexOf(selectedYear) === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <select
        className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <button
        className="p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        onClick={() => {
          const currentIndex = availableYears.indexOf(selectedYear);
          if (currentIndex < availableYears.length - 1) {
            onYearChange(availableYears[currentIndex + 1]);
          }
        }}
        disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default YearSelector; 