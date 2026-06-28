import { test, expect } from '@playwright/test';

test('business core: alta paciente y cita + no happy path en formulario', async ({ page, request }) => {
  const runId = `ui-${Date.now()}`;
  const patientName = `Paciente ${runId}`;
  const rutValido = '10000001-0';
  let pacienteId = null;
  let citaId = null;

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Centro de Operaciones Clinicas' })).toBeVisible();

  // No happy path: intento de crear paciente con RUT invalido.
  await page.getByPlaceholder('Nombre completo').fill(`Invalido ${runId}`);
  await page.getByPlaceholder('RUT (12345678-9)').fill('123');
  await page.locator('section.card').filter({ hasText: 'Modulo asistencial' }).getByRole('button', { name: '➕ Crear' }).click();
  await expect(page.getByText('Hay errores en el formulario')).toBeVisible();

  // Happy path: crear paciente valido.
  await page.getByPlaceholder('Nombre completo').fill(patientName);
  await page.getByPlaceholder('RUT (12345678-9)').fill(rutValido);
  const pacientesSection = page.locator('section.card').filter({ hasText: 'Modulo asistencial' });
  await pacientesSection.getByRole('button', { name: '➕ Crear' }).click();
  await expect(pacientesSection.locator('ul.data-list li strong', { hasText: patientName })).toBeVisible();

  // Recuperar id para limpieza.
  const pacientesResp = await request.get('/api/pacientes');
  expect(pacientesResp.ok()).toBeTruthy();
  const pacientes = await pacientesResp.json();
  const paciente = pacientes.find((p) => p.nombre === patientName);
  expect(paciente).toBeTruthy();
  pacienteId = paciente.id;

  // Crear cita asociada al paciente.
  const citasSection = page.locator('section.card').filter({ hasText: 'Modulo de agenda' });
  await citasSection.locator('input[type="date"]').first().fill('2026-07-21');
  await citasSection.getByPlaceholder('Especialidad').fill(`General ${runId}`);
  await citasSection.locator('select').first().selectOption(String(pacienteId));
  await citasSection.getByRole('button', { name: '➕ Crear' }).click();
  await expect(citasSection.locator('ul.data-list li strong', { hasText: `General ${runId}` })).toBeVisible();

  const citasResp = await request.get('/api/citas');
  expect(citasResp.ok()).toBeTruthy();
  const citas = await citasResp.json();
  const cita = citas.find((c) => c.especialidad === `General ${runId}` && Number(c.idPaciente) === Number(pacienteId));
  expect(cita).toBeTruthy();
  citaId = cita.id;

  if (citaId) {
    await request.delete(`/api/citas/${citaId}`);
  }
  if (pacienteId) {
    await request.delete(`/api/pacientes/${pacienteId}`);
  }
});
