// Validadores de RUT chileno
export const validateRUT = (rut) => {
  if (!rut) return false;
  rut = rut.toUpperCase().replace(/[^0-9K]/g, '');
  if (rut.length < 8) return false;
  
  let T = parseInt(rut.substring(0, rut.length - 1), 10);
  let M = 0;
  let S = 0;
  
  while (T > 0) {
    S = (T % 10 + M) % 11;
    if (S !== 0) M = 11 - S;
    else M = 0;
    T = Math.floor(T / 10);
  }
  
  const V = M === 0 ? '0' : M === 1 ? 'K' : 11 - M;
  return String(V) === rut.charAt(rut.length - 1);
};

// Validar email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validar fecha
export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d) && d > new Date();
};

// Formatos
export const formatRUT = (rut) => {
  rut = rut.replace(/[^0-9K]/g, '').toUpperCase();
  if (rut.length < 2) return rut;
  const dv = rut.slice(-1);
  const num = rut.slice(0, -1);
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatCurrency = (num) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(num);
};
