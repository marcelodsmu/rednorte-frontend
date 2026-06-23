import React from 'react';
import PacientesContainer from './PacientesContainer';
import './App.css';

function App() {
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
        <div className="header-badge">
          <span className="badge-dot" />
          Servicios conectados
        </div>
      </header>
      <PacientesContainer />
    </div>
  );
}

export default App;