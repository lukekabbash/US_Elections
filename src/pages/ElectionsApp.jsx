import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionMap from '../components/Map/ElectionMap';
import YearSelector from '../components/YearSelector/YearSelector';
import OfficeSelector from '../components/OfficeSelector/OfficeSelector';
import StateSelector from '../components/StateSelector/StateSelector';
import Legend from '../components/Legend/Legend';
import ResultsTable from '../components/ResultsTable/ResultsTable';
import ElectionCharts from '../components/Charts/ElectionCharts';
import HistoricalTrends from '../components/Charts/HistoricalTrends';
import StarIcon from '../components/StarIcon';
import { parseCSV } from '../utils/dataUtils';

const ElectionsApp = () => {
  const { office, year, state, chartType, trendType, entity } = useParams();
  const navigate = useNavigate();
  
  const [selectedYear, setSelectedYear] = useState(year ? parseInt(year) : 2020);
  const [selectedOffice, setSelectedOffice] = useState(office ? office.toUpperCase() : 'PRESIDENT');
  const [selectedState, setSelectedState] = useState(state || null);
  const [electionData, setElectionData] = useState(null);
  const [allYearsData, setAllYearsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(
    chartType ? 'charts' : 
    trendType ? 'trends' : 
    'map'
  );

  // Set the document title for this section
  useEffect(() => {
    document.title = "US Data Explorer | Elections";
  }, []);

  // Update URL when selections change
  useEffect(() => {
    // Skip URL update if we're on a specific chart or trend view
    if (chartType || trendType) return;
    
    let path = '/elections';
    
    if (selectedOffice) {
      path += `/${selectedOffice.toLowerCase()}`;
      
      if (selectedYear) {
        path += `/${selectedYear}`;
        
        if (selectedState && selectedOffice === 'HOUSE') {
          path += `/${selectedState.toLowerCase()}`;
        }
      }
    }
    
    navigate(path, { replace: true });
  }, [selectedYear, selectedOffice, selectedState, navigate, chartType, trendType]);

  // Reset state when office changes
  useEffect(() => {
    if (selectedOffice !== 'HOUSE') {
      setSelectedState(null);
    }
  }, [selectedOffice]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const filename = selectedOffice === 'PRESIDENT' 
          ? '1976-2020-president.csv'
          : selectedOffice === 'SENATE'
          ? '1976-2020-senate.csv'
          : '1976-2022-house.csv';

        const response = await fetch(`/${filename}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const data = await parseCSV(csvText);
        setElectionData(data);
        setAllYearsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading election data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();
  }, [selectedOffice]);

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
  let yearData = electionData.filter(d => d.year === selectedYear);
  
  // Filter data based on selected office and state for House elections
  if (selectedOffice === 'HOUSE' && selectedState) {
    yearData = yearData.filter(d => d.state_po === selectedState);
  }

  // Handle share button click
  const handleShareClick = () => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          prompt('Copy this link to share:', url);
        });
    } else {
      prompt('Copy this link to share:', url);
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="flex items-center justify-center text-4xl font-bold text-white mb-2 space-x-4">
          <StarIcon className="text-blue-500" size={32} />
          <span>US Election Results Explorer</span>
          <StarIcon className="text-red-500" size={32} />
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Interactive visualization of {selectedOffice.toLowerCase()} election results from 1976 to {
            selectedOffice === 'HOUSE' ? '2022' : '2020'
          }. 
          {selectedOffice === 'HOUSE' ? (
            <>
              <span className="text-yellow-500 font-semibold"> [Work in Progress] </span>
              Select a state to view its congressional districts.
            </>
          ) : ' Click on states to view detailed results.'}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Data sourced from MIT Election Data and Science Lab and Data.gov
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2 flex-wrap mb-6">
        <YearSelector 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear} 
          availableYears={availableYears}
        />
        <OfficeSelector
          selectedOffice={selectedOffice}
          onOfficeChange={setSelectedOffice}
        />
        {selectedOffice === 'HOUSE' && (
          <StateSelector
            selectedState={selectedState}
            onStateChange={setSelectedState}
          />
        )}
        
        <button
          onClick={handleShareClick}
          className="ml-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'map' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'charts' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('charts')}
        >
          Interactive Charts
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'trends' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          Historical Trends
        </button>
      </div>
      
      {selectedOffice === 'HOUSE' && !selectedState && (
        <div className="mt-6 mb-6 bg-yellow-800 bg-opacity-30 border border-yellow-700 rounded-lg p-4 text-center">
          <p className="text-yellow-300 font-medium">
            Please select a state to view House election results.
          </p>
          <p className="text-gray-300 text-sm mt-2">
            House election data is displayed by state and district. First select a state from the dropdown above, 
            then you can click on individual districts on the map to see detailed results.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Map View */}
        {activeTab === 'map' && (selectedOffice !== 'HOUSE' || selectedState) && (
          <>
            <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
              <ElectionMap 
                data={yearData} 
                year={selectedYear}
                office={selectedOffice}
                onStateSelect={setSelectedState}
                focusedState={selectedOffice === 'HOUSE' ? selectedState : null}
              />
              <Legend />
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
              <ResultsTable 
                data={yearData}
                office={selectedOffice}
                year={selectedYear}
              />
            </div>
          </>
        )}
        
        {/* Charts View */}
        {activeTab === 'charts' && (selectedOffice !== 'HOUSE' || selectedState) && (
          <ElectionCharts 
            data={yearData}
            office={selectedOffice}
            year={selectedYear}
            selectedState={selectedState}
          />
        )}
        
        {/* Historical Trends View */}
        {activeTab === 'trends' && (
          <HistoricalTrends 
            allData={allYearsData}
            office={selectedOffice}
            selectedState={selectedState}
          />
        )}
      </div>
    </div>
  );
};

export default ElectionsApp; 