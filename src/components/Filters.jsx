import React from 'react';

export const AdvancedFilters = ({ 
  citas, 
  onFilter, 
  especialidadFilter, 
  setEspecialidadFilter,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta 
}) => {
  const especialidades = [...new Set(citas.map(c => c.especialidad))];

  const handleFilter = () => {
    const filtrados = citas.filter(c => {
      const cumpleEspecialidad = !especialidadFilter || c.especialidad === especialidadFilter;
      const cumpleFechaDesde = !fechaDesde || new Date(c.fecha) >= new Date(fechaDesde);
      const cumpleFechaHasta = !fechaHasta || new Date(c.fecha) <= new Date(fechaHasta);
      return cumpleEspecialidad && cumpleFechaDesde && cumpleFechaHasta;
    });
    onFilter(filtrados);
  };

  const handleClear = () => {
    setEspecialidadFilter('');
    setFechaDesde('');
    setFechaHasta('');
    onFilter(citas);
  };

  return (
    <div className="filters-panel">
      <div className="filter-group">
        <label>🔍 Especialidad</label>
        <select 
          value={especialidadFilter} 
          onChange={(e) => setEspecialidadFilter(e.target.value)}
        >
          <option value="">Todas</option>
          {especialidades.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>📅 Desde</label>
        <input 
          type="date" 
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>📅 Hasta</label>
        <input 
          type="date" 
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button className="btn-primary" onClick={handleFilter}>🔎 Filtrar</button>
        <button className="btn-secondary" onClick={handleClear}>✕ Limpiar</button>
      </div>
    </div>
  );
};

export const ThemeToggle = ({ isDark, setIsDark }) => {
  return (
    <button 
      className="theme-toggle"
      onClick={() => {
        setIsDark(!isDark);
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
      }}
      title={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export const ExportActions = ({ pacientes, citas, onExport }) => {
  return (
    <div className="export-actions">
      <button className="btn-export" onClick={() => onExport('pacientes')}>
        💾 Pacientes CSV
      </button>
      <button className="btn-export" onClick={() => onExport('citas')}>
        💾 Citas CSV
      </button>
      <button className="btn-export" onClick={() => onExport('reporte')}>
        📄 Reporte
      </button>
    </div>
  );
};
