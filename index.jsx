import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Home from './src/pages/Home.jsx';
import Plants from './src/pages/Plants.jsx';
import MLPage from './src/pages/MLPage.jsx';
import Observations from './src/pages/Observations.jsx';


function App() {
  const [currentPage, setCurrentPage] = useState('home');


  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', margin: 0, padding: 0 }}>
      {currentPage === 'home' && (
        <Home onNavigateTo={setCurrentPage} />
      )}
      {currentPage === 'plants' && (
        <Plants onNavigateTo={setCurrentPage} />
      )}
      {currentPage === 'ml-page' && (
        <MLPage onNavigateTo={setCurrentPage} />
      )}
      {currentPage === 'observations' && (
        <Observations onNavigateTo={setCurrentPage} />
      )}
    </div>
  );
}

const rootElement = ReactDOM.createRoot(document.getElementById('root'));
rootElement.render(<App />);
