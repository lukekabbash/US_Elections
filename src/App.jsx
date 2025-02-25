import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ElectionsApp from './pages/ElectionsApp';
import EVPropulsionApp from './pages/EVPropulsionApp';
import BorderCrossingsApp from './pages/BorderCrossingsApp';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';

function App() {
  // Set document title for the browser tab
  useEffect(() => {
    document.title = "US Data Explorer";
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Elections Routes */}
        <Route path="/elections" element={<ElectionsApp />} />
        <Route path="/elections/:office" element={<ElectionsApp />} />
        <Route path="/elections/:office/:year" element={<ElectionsApp />} />
        <Route path="/elections/:office/:year/:state" element={<ElectionsApp />} />
        
        {/* Chart and Trend Routes for Sharing */}
        <Route path="/elections/:office/:year/charts/:chartType" element={<ElectionsApp />} />
        <Route path="/elections/:office/:year/:state/charts/:chartType" element={<ElectionsApp />} />
        <Route path="/elections/:office/trends/:trendType" element={<ElectionsApp />} />
        <Route path="/elections/:office/trends/:trendType/:entity" element={<ElectionsApp />} />
        
        {/* EV Propulsion Routes */}
        <Route path="/evpropulsion" element={<EVPropulsionApp />} />
        <Route path="/evpropulsion/:view" element={<EVPropulsionApp />} />
        
        {/* Border Crossings Routes */}
        <Route path="/bordercrossings" element={<BorderCrossingsApp />} />
        <Route path="/bordercrossings/:view" element={<BorderCrossingsApp />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App; 