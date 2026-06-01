import React from 'react';
import PacientesContainer from './PacientesContainer';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Servicio de Salud RedNorte</h1>
      <hr />
      {/* Aquí estamos inyectando tu patrón Container */}
      <PacientesContainer />
    </div>
  );
}

export default App;