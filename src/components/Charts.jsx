import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const EspecialidadChart = ({ citas }) => {
  if (!citas || citas.length === 0) {
    return <div className="chart-placeholder">No hay datos de citas</div>;
  }

  const especialidades = {};
  citas.forEach(cita => {
    especialidades[cita.especialidad] = (especialidades[cita.especialidad] || 0) + 1;
  });

  const data = {
    labels: Object.keys(especialidades),
    datasets: [{
      label: 'Citas por Especialidad',
      data: Object.values(especialidades),
      backgroundColor: [
        '#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'
      ],
      borderColor: '#1f2937',
      borderWidth: 2,
    }]
  };

  return (
    <div className="chart-container">
      <h3>📊 Distribución de Especialidades</h3>
      <Pie data={data} options={{ responsive: true, maintainAspectRatio: true }} />
    </div>
  );
};

export const PacientesChart = ({ pacientes, citas }) => {
  if (!pacientes || pacientes.length === 0) {
    return <div className="chart-placeholder">No hay datos de pacientes</div>;
  }

  const data = {
    labels: ['Pacientes Totales', 'Con Citas', 'Sin Citas'],
    datasets: [{
      label: 'Pacientes',
      data: [
        pacientes.length,
        new Set(citas.map(c => c.idPaciente)).size,
        pacientes.length - new Set(citas.map(c => c.idPaciente)).size
      ],
      backgroundColor: ['#10b981', '#06b6d4', '#f59e0b'],
      borderColor: '#1f2937',
      borderWidth: 2,
    }]
  };

  return (
    <div className="chart-container">
      <h3>👥 Estado de Pacientes</h3>
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: true, indexAxis: 'y' }} />
    </div>
  );
};

export const ActivityChart = ({ lastUpdated }) => {
  const today = new Date();
  const days = [];
  const activities = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('es-CL', { weekday: 'short', month: 'numeric', day: 'numeric' }));
    activities.push(Math.floor(Math.random() * 10));
  }

  const data = {
    labels: days,
    datasets: [{
      label: 'Actividades',
      data: activities,
      backgroundColor: '#06b6d4',
      borderColor: '#0891b2',
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  return (
    <div className="chart-container">
      <h3>📈 Actividad Semanal</h3>
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: true, indexAxis: 'x' }} />
    </div>
  );
};
