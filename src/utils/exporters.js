// Exportar a CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const keys = Object.keys(data[0]);
  const header = keys.map(key => `"${key}"`).join(',');
  
  const rows = data.map(row =>
    keys.map(key => {
      const value = row[key];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Copiar al portapapeles
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    return true;
  }).catch(err => {
    console.error('Error al copiar:', err);
    return false;
  });
};

// Generar reporte
export const generateReport = (pacientes, citas) => {
  const totalPacientes = pacientes.length;
  const totalCitas = citas.length;
  const citasProximas = citas.filter(c => new Date(c.fecha) > new Date()).length;
  const especialidades = [...new Set(citas.map(c => c.especialidad))];

  const report = {
    'Fecha Generación': new Date().toLocaleString('es-CL'),
    'Total Pacientes': totalPacientes,
    'Total Citas': totalCitas,
    'Citas Próximas': citasProximas,
    'Especialidades': especialidades.join(', '),
    'Tasa Utilización': totalPacientes > 0 ? `${Math.round((totalCitas / (totalPacientes * 5)) * 100)}%` : 'N/A'
  };

  return report;
};
