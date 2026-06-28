import React, { useEffect, useState } from 'react';
import { AdvancedFilters, ExportActions } from './components/Filters';
import { EspecialidadChart, PacientesChart, ActivityChart } from './components/Charts';
import { validateRUT, validateEmail, formatRUT, formatDate } from './utils/validators';
import { exportToCSV, generateReport } from './utils/exporters';

const emptyPaciente = { nombre: '', rut: '', email: '' };
const emptyCita = { fecha: '', especialidad: '', idPaciente: '' };

async function httpJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, visible }) => {
  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
};

export const PacientesContainer = ({ isDark }) => {
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [pacienteForm, setPacienteForm] = useState(emptyPaciente);
  const [citaForm, setCitaForm] = useState(emptyCita);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [searchCita, setSearchCita] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [editingCita, setEditingCita] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const showToastMsg = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pacientesData, citasData] = await Promise.all([
        httpJson('/api/pacientes'),
        httpJson('/api/citas'),
      ]);
      setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
      setCitas(Array.isArray(citasData) ? citasData : []);
      setFilteredCitas(Array.isArray(citasData) ? citasData : []);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = `No se pudo cargar la información: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Validar paciente
  const validatePaciente = (paciente) => {
    const errors = {};
    if (!paciente.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!paciente.rut.trim()) errors.rut = 'RUT requerido';
    if (paciente.rut && !validateRUT(paciente.rut)) errors.rut = 'RUT inválido';
    if (paciente.email && !validateEmail(paciente.email)) errors.email = 'Email inválido';
    return errors;
  };

  const handleCreatePaciente = async (event) => {
    event.preventDefault();
    const errors = validatePaciente(pacienteForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToastMsg('Hay errores en el formulario', 'error');
      return;
    }
    setValidationErrors({});
    setError('');
    try {
      await httpJson('/api/pacientes', {
        method: 'POST',
        body: JSON.stringify(pacienteForm),
      });
      setPacienteForm(emptyPaciente);
      await loadData();
      showToastMsg('Paciente creado exitosamente', 'success');
    } catch (err) {
      const msg = `No se pudo crear paciente: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    }
  };

  const handleUpdatePaciente = async (event) => {
    event.preventDefault();
    const errors = validatePaciente(editingPaciente);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToastMsg('Hay errores en el formulario', 'error');
      return;
    }
    setValidationErrors({});
    setError('');
    try {
      await httpJson(`/api/pacientes/${editingPaciente.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingPaciente),
      });
      setEditingPaciente(null);
      await loadData();
      showToastMsg('Paciente actualizado exitosamente', 'success');
    } catch (err) {
      const msg = `No se pudo actualizar paciente: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    }
  };

  const handleCreateCita = async (event) => {
    event.preventDefault();
    if (!citaForm.fecha || !citaForm.especialidad.trim() || !citaForm.idPaciente) {
      showToastMsg('Todos los campos son requeridos', 'error');
      return;
    }
    setError('');
    try {
      await httpJson('/api/citas', {
        method: 'POST',
        body: JSON.stringify({
          ...citaForm,
          idPaciente: Number(citaForm.idPaciente),
        }),
      });
      setCitaForm(emptyCita);
      await loadData();
      showToastMsg('Cita creada exitosamente', 'success');
    } catch (err) {
      const msg = `No se pudo crear cita: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    }
  };

  const handleUpdateCita = async (event) => {
    event.preventDefault();
    if (!editingCita.fecha || !editingCita.especialidad.trim() || !editingCita.idPaciente) {
      showToastMsg('Todos los campos son requeridos', 'error');
      return;
    }
    setError('');
    try {
      await httpJson(`/api/citas/${editingCita.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingCita),
      });
      setEditingCita(null);
      await loadData();
      showToastMsg('Cita actualizada exitosamente', 'success');
    } catch (err) {
      const msg = `No se pudo actualizar cita: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    }
  };

  const handleDeletePaciente = async (id) => {
    if (!window.confirm('¿Eliminar este paciente?')) return;
    setError('');
    try {
      await httpJson(`/api/pacientes/${id}`, { method: 'DELETE' });
      setPacientes((currentPacientes) => currentPacientes.filter((paciente) => paciente.id !== id));
      setCitas((currentCitas) => currentCitas.filter((cita) => Number(cita.idPaciente) !== id));
      void loadData();
      showToastMsg('Paciente eliminado', 'success');
    } catch (err) {
      if (err.message.includes('Paciente no encontrado')) {
        setPacientes((currentPacientes) => currentPacientes.filter((paciente) => paciente.id !== id));
        setCitas((currentCitas) => currentCitas.filter((cita) => Number(cita.idPaciente) !== id));
        void loadData();
        showToastMsg('El paciente ya no existe. La lista fue actualizada.', 'error');
        return;
      }
      const msg = `No se pudo eliminar paciente: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    }
  };

  const handleDeleteCita = async (id) => {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    setError('');
    try {
      await httpJson(`/api/citas/${id}`, { method: 'DELETE' });
      setCitas((currentCitas) => currentCitas.filter((cita) => cita.id !== id));
      void loadData();
      showToastMsg('Cita eliminada', 'success');
    } catch (err) {
      if (err.message.includes('Cita no encontrada')) {
        setCitas((currentCitas) => currentCitas.filter((cita) => cita.id !== id));
        void loadData();
        showToastMsg('La cita ya no existe. La lista fue actualizada.', 'error');
        return;
      }
      const msg = `No se pudo eliminar cita: ${err.message}`;
      setError(msg);
      showToastMsg(msg, 'error');
    }
  };

  const handleExport = (type) => {
    try {
      if (type === 'pacientes') {
        exportToCSV(pacientes, 'pacientes.csv');
        showToastMsg('Pacientes exportados', 'success');
      } else if (type === 'citas') {
        exportToCSV(filteredCitas, 'citas.csv');
        showToastMsg('Citas exportadas', 'success');
      } else if (type === 'reporte') {
        const report = generateReport(pacientes, citas);
        exportToCSV([report], 'reporte.csv');
        showToastMsg('Reporte generado', 'success');
      }
    } catch (err) {
      showToastMsg(`Error al exportar: ${err.message}`, 'error');
    }
  };

  const filteredPacientes = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(searchPaciente.toLowerCase()) ||
    p.rut.toLowerCase().includes(searchPaciente.toLowerCase())
  );

  const defaultFilteredCitas = citas.filter((c) =>
    c.especialidad.toLowerCase().includes(searchCita.toLowerCase()) ||
    c.fecha.includes(searchCita)
  );

  const totalPacientes = pacientes.length;
  const totalCitas = citas.length;
  const citasProximas = citas.filter((cita) => new Date(cita.fecha) > new Date()).length;
  const formattedLastUpdated = lastUpdated
    ? new Intl.DateTimeFormat('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }).format(lastUpdated)
    : 'Sin sincronizar';

  return (
    <main className="dashboard-grid">
      <section className="summary-strip">
        <article className="summary-card summary-card-primary">
          <p className="summary-label">Pacientes activos</p>
          <strong>{totalPacientes}</strong>
          <span>Registros visibles en el padron clinico</span>
        </article>
        <article className="summary-card">
          <p className="summary-label">Citas registradas</p>
          <strong>{totalCitas}</strong>
          <span>Agenda operativa consolidada</span>
        </article>
        <article className="summary-card">
          <p className="summary-label">Citas proximas</p>
          <strong>{citasProximas}</strong>
          <span>Agendadas para el futuro</span>
        </article>
        <article className="summary-card summary-card-soft">
          <p className="summary-label">Ultima sincronizacion</p>
          <strong>{formattedLastUpdated}</strong>
          <span>{loading ? 'Actualizando informacion...' : 'Datos listos para operar'}</span>
        </article>
      </section>

      <section className="card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Herramientas</p>
            <h2>Exportacion & Graficos</h2>
          </div>
        </div>
        <div className="tools-section">
          <ExportActions pacientes={pacientes} citas={citas} onExport={handleExport} />
          <button className="btn-charts" onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? '📊 Ocultar graficos' : '📈 Mostrar graficos'}
          </button>
        </div>
      </section>

      {showCharts && (
        <>
          <section className="charts-section">
            <EspecialidadChart citas={citas} />
            <PacientesChart pacientes={pacientes} citas={citas} />
          </section>
          <section className="charts-section">
            <ActivityChart lastUpdated={lastUpdated} />
          </section>
        </>
      )}

      <section className="card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Filtros avanzados</p>
            <h2>Citas</h2>
          </div>
        </div>
        <AdvancedFilters
          citas={citas}
          onFilter={setFilteredCitas}
          especialidadFilter={especialidadFilter}
          setEspecialidadFilter={setEspecialidadFilter}
          fechaDesde={fechaDesde}
          setFechaDesde={setFechaDesde}
          fechaHasta={fechaHasta}
          setFechaHasta={setFechaHasta}
        />
      </section>

      <section className="card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Modulo asistencial</p>
            <h2>Pacientes</h2>
            <p className="section-copy">Consulta, registra y actualiza fichas basicas de atencion.</p>
          </div>
          <span className="count-pill">{filteredPacientes.length}</span>
        </div>

        <form className="inline-form" onSubmit={handleCreatePaciente}>
          <div className="form-field">
            <input
              value={pacienteForm.nombre}
              onChange={(e) => setPacienteForm({ ...pacienteForm, nombre: e.target.value })}
              placeholder="Nombre completo"
              className={validationErrors.nombre ? 'error' : ''}
              required
            />
            {validationErrors.nombre && <span className="error-text">{validationErrors.nombre}</span>}
          </div>
          <div className="form-field">
            <input
              value={pacienteForm.rut}
              onChange={(e) => setPacienteForm({ ...pacienteForm, rut: e.target.value })}
              placeholder="RUT (12345678-9)"
              className={validationErrors.rut ? 'error' : ''}
              required
            />
            {validationErrors.rut && <span className="error-text">{validationErrors.rut}</span>}
          </div>
          <button type="submit">➕ Crear</button>
        </form>

        <input
          type="search"
          value={searchPaciente}
          onChange={(e) => setSearchPaciente(e.target.value)}
          placeholder="🔍 Buscar paciente..."
          className="search-input"
        />

        <ul className="data-list">
          {filteredPacientes.map((paciente) => (
            <li key={paciente.id}>
              <div className="list-copy">
                <strong>{paciente.nombre}</strong>
                <span>RUT: {formatRUT(paciente.rut)}</span>
              </div>
              <div className="actions">
                <button className="edit-btn" onClick={() => setEditingPaciente(paciente)}>
                  ✏️
                </button>
                <button className="danger" onClick={() => handleDeletePaciente(paciente.id)}>
                  🗑️
                </button>
              </div>
            </li>
          ))}
          {!filteredPacientes.length && (
            <li className="empty empty-rich">
              <strong>No hay pacientes visibles</strong>
              <span>Crea el primer registro o limpia el filtro de busqueda para continuar.</span>
            </li>
          )}
        </ul>
      </section>

      <section className="card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Modulo de agenda</p>
            <h2>Citas</h2>
            <p className="section-copy">Organiza la agenda medica y relaciona cada cita con su paciente.</p>
          </div>
          <span className="count-pill count-pill-alt">{(showCharts ? filteredCitas : defaultFilteredCitas).length}</span>
        </div>

        <form className="inline-form" onSubmit={handleCreateCita}>
          <input
            type="date"
            value={citaForm.fecha}
            onChange={(e) => setCitaForm({ ...citaForm, fecha: e.target.value })}
            required
          />
          <input
            value={citaForm.especialidad}
            onChange={(e) => setCitaForm({ ...citaForm, especialidad: e.target.value })}
            placeholder="Especialidad"
            required
          />
          <select
            value={citaForm.idPaciente}
            onChange={(e) => setCitaForm({ ...citaForm, idPaciente: e.target.value })}
            required
          >
            <option value="">Selecciona paciente</option>
            {pacientes.map((paciente) => (
              <option key={paciente.id} value={paciente.id}>
                {paciente.nombre}
              </option>
            ))}
          </select>
          <button type="submit">➕ Crear</button>
        </form>

        <input
          type="search"
          value={searchCita}
          onChange={(e) => setSearchCita(e.target.value)}
          placeholder="🔍 Buscar cita..."
          className="search-input"
        />

        <ul className="data-list">
          {(showCharts ? filteredCitas : defaultFilteredCitas).map((cita) => (
            <li key={cita.id}>
              <div className="list-copy">
                <strong>{cita.especialidad}</strong>
                <span>{formatDate(cita.fecha)}</span>
              </div>
              <div className="actions">
                <button className="edit-btn" onClick={() => setEditingCita(cita)}>
                  ✏️
                </button>
                <button className="danger" onClick={() => handleDeleteCita(cita.id)}>
                  🗑️
                </button>
              </div>
            </li>
          ))}
          {!(showCharts ? filteredCitas : defaultFilteredCitas).length && (
            <li className="empty empty-rich">
              <strong>No hay citas agendadas</strong>
              <span>Programa una nueva cita o revisa el criterio de busqueda actual.</span>
            </li>
          )}
        </ul>
      </section>

      <section className="status-bar">
        <div className="status-copy">
          <span className={`live-chip ${loading ? 'live-chip-loading' : ''}`}>{loading ? 'Sincronizando' : 'Panel operativo'}</span>
          <p>Usa este panel para validar el flujo completo entre frontend, BFF y microservicios.</p>
        </div>
        <button onClick={loadData} disabled={loading}>
          {loading ? '⏳ Actualizando...' : '🔄 Refrescar'}
        </button>
        {error && <p className="error">❌ {error}</p>}
      </section>

      <Modal
        isOpen={!!editingPaciente}
        title={`Editar Paciente`}
        onClose={() => setEditingPaciente(null)}
      >
        <form onSubmit={handleUpdatePaciente}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={editingPaciente?.nombre || ''}
              onChange={(e) => setEditingPaciente({ ...editingPaciente, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>RUT</label>
            <input
              value={editingPaciente?.rut || ''}
              onChange={(e) => setEditingPaciente({ ...editingPaciente, rut: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="primary">Guardar</button>
            <button type="button" onClick={() => setEditingPaciente(null)}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingCita}
        title={`Editar Cita`}
        onClose={() => setEditingCita(null)}
      >
        <form onSubmit={handleUpdateCita}>
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={editingCita?.fecha || ''}
              onChange={(e) => setEditingCita({ ...editingCita, fecha: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <input
              value={editingCita?.especialidad || ''}
              onChange={(e) => setEditingCita({ ...editingCita, especialidad: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Paciente</label>
            <select
              value={editingCita?.idPaciente || ''}
              onChange={(e) => setEditingCita({ ...editingCita, idPaciente: Number(e.target.value) })}
              required
            >
              <option value="">Selecciona paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="primary">Guardar</button>
            <button type="button" onClick={() => setEditingCita(null)}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <Toast message={toastMessage} type={toastType} visible={showToast} />
    </main>
  );
};

export default PacientesContainer;
