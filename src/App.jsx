import React, { useState, useEffect } from 'react';
import ElectionMap from './components/Map/ElectionMap';
import YearSelector from './components/YearSelector/YearSelector';
import Legend from './components/Legend/Legend';
import ResultsTable from './components/ResultsTable/ResultsTable';
import StarIcon from './components/StarIcon';
import { parseCSV } from './utils/dataUtils';

function App() {
  const [selectedYear, setSelectedYear] = useState(2020);
  const [electionData, setElectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/1976-2020-president.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const data = await parseCSV(csvText);
        setElectionData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading election data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!electionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-gray-400">No election data available</div>
      </div>
    );
  }

  const availableYears = [...new Set(electionData.map(d => d.year))].sort();
  const yearData = electionData.filter(d => d.year === selectedYear);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="flex items-center justify-center text-4xl font-bold text-white mb-2 space-x-4">
            <StarIcon className="text-blue-500" size={32} />
            <span>US Election Results Map</span>
            <StarIcon className="text-red-500" size={32} />
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Interactive visualization of presidential election results from 1976 to 2020. 
            Click on states to view detailed results, including vote counts and percentages. 
            States are colored based on party victory margin.
          </p>
        </div>
        
        <YearSelector 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear} 
          availableYears={availableYears}
        />
        
        <div className="mt-6 space-y-6">
          <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            <ElectionMap 
              data={yearData} 
              year={selectedYear}
            />
            <Legend />
          </div>
          
          <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            <ResultsTable data={yearData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 