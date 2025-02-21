# US Presidential Election Map (1976-2020)

An interactive visualization of US presidential election results from 1976 to 2020. The application displays election results by state, with an interactive map and year selection functionality.

## Features

- Interactive US map showing election results by state
- Color-coded states based on winning party
- Year selector with previous/next navigation
- Hover tooltips showing detailed state results
- Zoomable and pannable map
- Legend showing party colors

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Data Source

The election data is sourced from the 1976-2020 US Presidential Elections dataset, which includes:
- Vote counts by state
- Party information
- Total votes
- Year-by-year results

## Technologies Used

- React
- react-simple-maps (for US map visualization)
- d3-scale (for data scaling)
- CSV parsing
- TailwindCSS (for styling)

## License

MIT 