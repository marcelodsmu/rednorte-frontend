# RedNorte Frontend

Aplicacion web React para gestion de pacientes y citas.

## Responsabilidad

- Interfaz de usuario para operaciones de negocio.
- Consumo del BFF en puerto 8080.
- Validaciones y feedback visual al usuario.

## Requisitos

- Node.js 20+
- npm 10+
- BFF en ejecucion

## Instalacion

```powershell
npm install
```

## Ejecucion local

```powershell
npm run dev
```

Puerto esperado: 5173

## Build de produccion

```powershell
npm run build
npm run preview
```

## Flujos criticos a validar

1. Alta de paciente.
2. Alta de cita asociada a paciente.
3. Busqueda y filtrado.
4. Edicion y eliminacion.

## Validaciones para Parcial 3

- Evidencia unitaria (componentes y utilidades clave).
- Evidencia de integracion con BFF.
- Evidencia end-to-end de flujos completos.

## Flujo de colaboracion

1. Crear rama feature.
2. Implementar y probar localmente.
3. Adjuntar evidencia visual de cambios.
4. Abrir PR para revision de equipo.

Este es el proyecto frontend modificado por Marcelo y Andres para RedNorte.