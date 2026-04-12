import React from 'react';
import SoftAurora from '../components/SoftAurora.jsx';
import './Home.css';

export default function Home({ onNavigateTo }) {
  return (
    <div className="home-container">
      <SoftAurora
        speed={0.6}
        scale={1.5}
        brightness={1}
        color1="#f7f7f7"
        color2="#e100ff"
        noiseFrequency={2.5}
        noiseAmplitude={1}
        bandHeight={0.5}
        bandSpread={1}
        octaveDecay={0.1}
        layerOffset={0}
        colorSpeed={1}
        enableMouseInteraction
        mouseInfluence={0.25}
      />
      
      <div className="home-content">
        <h1>Grimlock</h1>
        <p className="tagline">Plant Research & JSX Art</p>
        
        <nav className="home-nav">
          <button 
            className="nav-button"
            onClick={() => onNavigateTo('plants')}
          >
            Cultivars
          </button>
          <button
            className="nav-button"
            onClick={() => onNavigateTo('observations')}
          >
            Observations
          </button>
          <button
            className="nav-button"
            onClick={() => onNavigateTo('flower-products')}
          >
            Flower Products
          </button>
          <button 
            className="nav-button"
            onClick={() => onNavigateTo('concentrates')}
          >
            Vapes & Concentrates
          </button>
        </nav>
      </div>
    </div>
  );
}
