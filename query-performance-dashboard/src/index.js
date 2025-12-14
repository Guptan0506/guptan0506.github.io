import React from 'react';
import ReactDOM from 'react-dom/client'; // or 'react-dom' for older React versions
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom'; // Import HashRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      {' '}
      {/* Use HashRouter here */}
      <App />
    </HashRouter>
  </React.StrictMode>
);
