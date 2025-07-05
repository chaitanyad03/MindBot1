import React from 'react';
import './Header.css';

function Header({ mode, onModeChange }) {
  return (
    <header className="header">
      <img src={`${process.env.PUBLIC_URL}/logo1.jpeg`} alt="MindBot Logo" className="logo" />
      
      <div className="mode-buttons">
        <button
          className={`mode-btn ${mode === 'home' ? 'active' : ''}`}
          onClick={() => onModeChange('home')}
        >
          Home
        </button>
        <button
          className={`mode-btn ${mode === 'office' ? 'active' : ''}`}
          onClick={() => onModeChange('office')}
        >
          Office
        </button>
      </div>
    </header>
  );
}

export default Header;
