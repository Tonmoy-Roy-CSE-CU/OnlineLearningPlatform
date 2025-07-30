import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/assets/styles/global.css';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);