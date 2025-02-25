import React, { useState } from 'react';
import { getPartyColor } from '../../utils/dataUtils';

const ResultsTable = ({ data, office, year }) => {
  const [sortConfig, setSortConfig] = useState({ key: office === 'HOUSE' ? 'district' : 'state', direction: 'asc' });
  const [activeDetail, setActiveDetail] = useState(null);

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
        district: record.district,
        displayName,
        totalVotes: parseInt(record.totalvotes) || 0,
        candidates: []
      };
    }

    // Only add named candidates with votes
    if (record.candidate && record.candidatevotes > 0) {
      const percentage = ((parseInt(record.candidatevotes) / parseInt(record.totalvotes)) * 100);
      if (percentage >= 1) { // Only include candidates with >= 1%
        results[key].candidates.push({
          name: record.candidate,
          party: record.party_simplified,
          votes: parseInt(record.candidatevotes),
          percentage: percentage.toFixed(1)
        });
      }
    }
  });

  // Sort results based on current sort config
  const sortedResults = Object.values(results)
    .map(result => ({
      ...result,
      candidates: result.candidates.sort((a, b) => b.votes - a.votes),
      winner: result.candidates.reduce((prev, current) => 
        (prev && prev.votes > current.votes) ? prev : current, null
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
      if (sortConfig.key === 'district') {
        // Handle at-large districts (0) specially
        if (a.district === '0' && b.district !== '0') return -1;
        if (a.district !== '0' && b.district === '0') return 1;
        return sortConfig.direction === 'asc'
          ? parseInt(a.district) - parseInt(b.district)
          : parseInt(b.district) - parseInt(a.district);
      }
      if (sortConfig.key === 'winner') {
        if (!a.winner || !b.winner) return 0;
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

  const sortedAndFilteredResults = sortData(sortedResults, sortConfig);

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

  const toggleDetail = (key) => {
    if (activeDetail === key) {
      setActiveDetail(null);
    } else {
      setActiveDetail(key);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="p-4 bg-black bg-opacity-50 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">
          {office === 'HOUSE' 
            ? `${year} House Election Results${data[0]?.state ? ` - ${data[0].state}` : ''}`
            : `${year} ${office} Election Results`
          }
        </h2>
      </div>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-black">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-900"
              onClick={() => requestSort(office === 'HOUSE' ? 'district' : 'state')}
            >
              {office === 'HOUSE' ? 'District' : 'State'} {getSortIndicator(office === 'HOUSE' ? 'district' : 'state')}
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
              Top Candidates
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {sortedAndFilteredResults.map((result) => {
            const winner = result.winner;
            if (!winner) return null;
            
            const resultKey = office === 'HOUSE' ? `${result.state}-${result.district}` : result.state;
            const isDetailActive = activeDetail === resultKey;
            
            // Get top 2 candidates for compact display
            const topCandidates = result.candidates.slice(0, 2);

            return (
              <React.Fragment key={resultKey}>
                <tr className={`hover:bg-gray-800 ${isDetailActive ? 'bg-gray-800' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {result.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getPartyColor(winner.party) }}
                    />
                    {winner.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
                    {result.totalVotes.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    <div className="flex flex-col space-y-1">
                      {topCandidates.map((candidate, idx) => (
                        <div key={idx} className="flex items-center">
                          <span 
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: getPartyColor(candidate.party) }}
                          />
                          <span className="truncate max-w-[200px]">
                            {candidate.name} ({candidate.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => toggleDetail(resultKey)}
                    >
                      {isDetailActive ? 'Hide details' : 'Show details'}
                    </button>
                  </td>
                </tr>
                {isDetailActive && (
                  <tr className="bg-gray-800">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-3">
                          {office === 'HOUSE' 
                            ? `${year} House Election - ${result.state} ${result.displayName}`
                            : `${year} ${office} Election - ${result.state}`
                          }
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-800 p-3 rounded">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Vote Breakdown</h4>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                  <th className="text-left py-2">Candidate</th>
                                  <th className="text-right py-2">Votes</th>
                                  <th className="text-right py-2">Percentage</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.candidates.map((candidate, idx) => (
                                  <tr key={idx} className="border-b border-gray-700">
                                    <td className="py-2 flex items-center">
                                      <span 
                                        className="inline-block w-2 h-2 rounded-full mr-2"
                                        style={{ backgroundColor: getPartyColor(candidate.party) }}
                                      />
                                      <span className="truncate max-w-[150px]">{candidate.name}</span>
                                    </td>
                                    <td className="py-2 text-right">{candidate.votes.toLocaleString()}</td>
                                    <td className="py-2 text-right">{candidate.percentage}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-gray-800 p-3 rounded">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Party Distribution</h4>
                            <div className="space-y-3">
                              {['DEMOCRAT', 'REPUBLICAN', 'LIBERTARIAN', 'OTHER'].map(party => {
                                const partyVotes = result.candidates
                                  .filter(c => c.party === party)
                                  .reduce((sum, c) => sum + c.votes, 0);
                                
                                const partyPercentage = ((partyVotes / result.totalVotes) * 100).toFixed(1);
                                
                                if (partyVotes === 0) return null;
                                
                                return (
                                  <div key={party} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>{party.charAt(0) + party.slice(1).toLowerCase()}</span>
                                      <span>{partyPercentage}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded">
                                      <div
                                        className="h-2 rounded"
                                        style={{
                                          width: `${partyPercentage}%`,
                                          backgroundColor: getPartyColor(party)
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable; 