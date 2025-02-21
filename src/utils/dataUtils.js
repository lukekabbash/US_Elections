const parseCSVLine = (line) => {
  const values = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
};

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]).map(header => header.replace(/"/g, ''));
  
  const records = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index]?.replace(/"/g, '') || '';
    });
    return record;
  }).filter(record => record.year && record.candidatevotes !== '');

  return records.map(record => ({
    ...record,
    year: parseInt(record.year),
    candidatevotes: parseInt(record.candidatevotes) || 0,
    totalvotes: parseInt(record.totalvotes) || 0,
    party_simplified: record.party_simplified || 'OTHER'
  }));
};

export const getWinningPartyByState = (stateData) => {
  const partyVotes = {};
  
  stateData.forEach(record => {
    const party = record.party_simplified;
    partyVotes[party] = (partyVotes[party] || 0) + record.candidatevotes;
  });

  let winningParty = null;
  let maxVotes = -1;

  Object.entries(partyVotes).forEach(([party, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      winningParty = party;
    }
  });

  return winningParty;
};

export const getPartyColor = (party) => {
  // Normalize party name to handle case variations
  const normalizedParty = party?.toUpperCase() || 'OTHER';
  
  const colors = {
    'DEMOCRAT': '#2166ac', // Strong blue
    'DEMOCRATIC': '#2166ac', // Alternative name
    'REPUBLICAN': '#b2182b', // Strong red
    'LIBERTARIAN': '#ffd700', // Yellow
    'GREEN': '#92c5de', // Light blue
    'OTHER': '#666666', // Dark gray
  };
  
  return colors[normalizedParty] || colors.OTHER;
}; 