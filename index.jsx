import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Home from './src/pages/Home.jsx';
import Plants from './src/pages/Plants.jsx';
import Concentrates from './src/pages/Concentrates.jsx';
import Observations from './src/pages/Observations.jsx';
import FlowerProducts from './src/pages/FlowerProducts.jsx';

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
      {currentPage === 'concentrates' && (
        <Concentrates onNavigateTo={setCurrentPage} />
      )}
      {currentPage === 'observations' && (
        <Observations onNavigateTo={setCurrentPage} />
      )}
      {currentPage === 'flower-products' && (
        <FlowerProducts onNavigateTo={setCurrentPage} />
      )}
    </div>
  );
}

const rootElement = ReactDOM.createRoot(document.getElementById('root'));
rootElement.render(<App />);
