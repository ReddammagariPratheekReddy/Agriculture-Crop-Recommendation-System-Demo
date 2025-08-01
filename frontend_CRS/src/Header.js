import React from 'react';
import logo from './assets/logo.png'; // Adjust the path if needed
import './Header.css';

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Agribot Logo" className="logo-animated" style={{ height: "50px", marginRight: "15px" }} />
      <h1 className="title">🌿 Agribot-Crop Recommendation</h1>
    </header>
  );
}

export default Header;
