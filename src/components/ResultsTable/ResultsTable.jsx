import React, { useState } from 'react';
import { getPartyColor } from '../../utils/dataUtils';

const ResultsTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'state', direction: 'asc' });

  if (!data || data.length === 0) return null;

  // Group data by state and calculate percentages
  const stateResults = {};
  data.forEach(record => {
    // Skip empty or invalid records
    if (!record.state || !record.candidatevotes || record.candidate === '') return;

    if (!stateResults[record.state]) {
      stateResults[record.state] = {
        state: record.state,
        totalVotes: parseInt(record.totalvotes) || 0,
        candidates: []
      };
    }

    // Only add named candidates with votes
    if (record.candidate && record.candidatevotes > 0) {
      const percentage = ((parseInt(record.candidatevotes) / parseInt(record.totalvotes)) * 100);
      if (percentage >= 1) { // Only include candidates with >= 1%
        stateResults[record.state].candidates.push({
          name: record.candidate,
          party: record.party_simplified,
          votes: parseInt(record.candidatevotes),
          percentage: percentage.toFixed(1)
        });
      }
    }
  });

  // Sort states based on current sort config
  const sortedStates = Object.values(stateResults)
    .map(state => ({
      ...state,
      candidates: state.candidates.sort((a, b) => b.votes - a.votes),
      winner: state.candidates.reduce((prev, current) => 
        (prev.votes > current.votes) ? prev : current
      )
    }));

  // Apply sorting
  const sortData = (data, sortConfig) => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      if (sortConfig.key === 'state') {
        return sortConfig.direction === 'asc' 
          ? a.state.localeCompare(b.state)
          : b.state.localeCompare(a.state);
      }
      if (sortConfig.key === 'winner') {
        return sortConfig.direction === 'asc'
          ? a.winner.name.localeCompare(b.winner.name)
          : b.winner.name.localeCompare(a.winner.name);
      }
      if (sortConfig.key === 'totalVotes') {
        return sortConfig.direction === 'asc'
          ? a.totalVotes - b.totalVotes
          : b.totalVotes - a.totalVotes;
      }
      return 0;
    });
    return sorted;
  };

  const sortedAndFilteredStates = sortData(sortedStates, sortConfig);

  const requestSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-black">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-900"
              onClick={() => requestSort('state')}
            >
              State {getSortIndicator('state')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-900"
              onClick={() => requestSort('winner')}
            >
              Winner {getSortIndicator('winner')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-900"
              onClick={() => requestSort('totalVotes')}
            >
              Total Votes {getSortIndicator('totalVotes')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Results
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {sortedAndFilteredStates.map((stateResult) => {
            const winner = stateResult.winner;

            return (
              <tr key={stateResult.state} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {stateResult.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getPartyColor(winner.party) }}
                  />
                  {winner.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
                  {stateResult.totalVotes.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  <div className="flex flex-col space-y-1">
                    {stateResult.candidates.map((candidate, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="flex-grow">
                          <div className="h-2 bg-gray-700 rounded">
                            <div
                              className="h-2 rounded"
                              style={{
                                width: `${candidate.percentage}%`,
                                backgroundColor: getPartyColor(candidate.party)
                              }}
                            />
                          </div>
                        </div>
                        <span className="ml-2 whitespace-nowrap">
                          {candidate.name} ({candidate.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable; 