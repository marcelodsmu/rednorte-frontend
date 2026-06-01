import React, { useState, useEffect } from 'react';

// PATRÓN: PRESENTATIONAL (Solo muestra datos visuales)
const PacientesList = ({ pacientes }) => (
  <div>
    <h2>Lista de Pacientes RedNorte</h2>
    <ul>
      {pacientes.map(paciente => (
        <li key={paciente.id}>{paciente.nombre}</li>
      ))}
    </ul>
  </div>
);

// PATRÓN: CONTAINER (Se encarga de la lógica)
export const PacientesContainer = () => {
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    setPacientes([
      { id: 1, nombre: 'Marcelo San Martin' },
      { id: 2, nombre: 'Andres Duran' },
      { id: 3, nombre: 'Alejandro Gonzalez' }
    ]);
  }, []);

  return <PacientesList pacientes={pacientes} />;
};

export default PacientesContainer;