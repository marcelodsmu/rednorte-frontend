import React, { useEffect, useState } from 'react';
import PacientesContainer from './PacientesContainer';
import { ThemeToggle } from './components/Filters';
import './App.css';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDark]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">RedNorte Platform</p>
          <h1>Centro de Operaciones Clinicas</h1>
          <p className="header-copy">
            Administra pacientes y coordina citas medicas desde un panel unificado,
            rapido y preparado para demostraciones operativas.
          </p>
        </div>
        <div className="header-actions">
          <div className="header-badge">
            <span className="badge-dot" />
            Servicios conectados
          </div>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>
      </header>
      <PacientesContainer isDark={isDark} />
    </div>
  );
}

export default App;