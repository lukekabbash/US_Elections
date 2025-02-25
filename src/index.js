import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { inject } from '@vercel/analytics';
import { track } from '@vercel/analytics/react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Initialize Vercel Analytics
inject();

// Web Vitals reporting using Vercel Analytics
const reportWebVitals = (metric) => {
  // Send the metric to Vercel Analytics
  track('web-vital', {
    id: metric.id,
    name: metric.name,
    value: metric.value.toString(),
    label: metric.label
  });
  
  // Also log to console for development
  console.log(metric);
};

// Report all the important metrics
const reportAllVitals = () => {
  onCLS(reportWebVitals);
  onFID(reportWebVitals);
  onFCP(reportWebVitals);
  onLCP(reportWebVitals);
  onTTFB(reportWebVitals);
};

// Call the function to start reporting
reportAllVitals(); 