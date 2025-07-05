import React from 'react';
import './ModeToggle.css';

function ModeToggle({ theme, toggleTheme }) {
  return (
    <div className="toggle-container">
      <label className="switch">
        <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default ModeToggle;
