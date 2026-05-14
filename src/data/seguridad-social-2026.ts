/**
 * Seguridad Social 2026 — Contribution rates (Régimen General).
 * Source: BOE Orden PJC/297/2026, seg-social.es, sage.com
 *
 * Employee contributions deducted from gross salary each month.
 */

export const seguridadSocial2026 = {
  // Base de cotización limits (monthly)
  baseMaximaMensual: 5_101.20,
  baseMinimaMensual: 1_381.20,  // Linked to SMI, may adjust

  // Employee contribution rates (% of base de cotización)
  empleado: {
    contingenciasComunes: 0.047,       // 4.70%
    desempleoIndefinido: 0.0155,       // 1.55% (contrato indefinido)
    desempleoTemporal: 0.016,          // 1.60% (contrato temporal)
    formacionProfesional: 0.001,       // 0.10%
    mei: 0.0015,                       // 0.15% (Mecanismo de Equidad Intergeneracional)
  },

  // Employer contribution rates (for reference / coste empresa calculator)
  empresa: {
    contingenciasComunes: 0.236,       // 23.60%
    desempleoIndefinido: 0.055,        // 5.50%
    desempleoTemporal: 0.067,          // 6.70%
    formacionProfesional: 0.006,       // 0.60%
    fogasa: 0.002,                     // 0.20%
    mei: 0.0075,                       // 0.75%
  },

  // SMI (Salario Mínimo Interprofesional) 2026
  smiMensual: 1_221,
  smiAnual14Pagas: 17_094,
};

/**
 * Total employee SS contribution rate for indefinido contracts.
 * 4.70% + 1.55% + 0.10% + 0.15% = 6.50%
 */
export const tipoEmpleadoIndefinido =
  seguridadSocial2026.empleado.contingenciasComunes +
  seguridadSocial2026.empleado.desempleoIndefinido +
  seguridadSocial2026.empleado.formacionProfesional +
  seguridadSocial2026.empleado.mei;

/**
 * Total employee SS contribution rate for temporal contracts.
 * 4.70% + 1.60% + 0.10% + 0.15% = 6.55%
 */
export const tipoEmpleadoTemporal =
  seguridadSocial2026.empleado.contingenciasComunes +
  seguridadSocial2026.empleado.desempleoTemporal +
  seguridadSocial2026.empleado.formacionProfesional +
  seguridadSocial2026.empleado.mei;

/**
 * Total employer SS contribution rate for indefinido contracts.
 */
export const tipoEmpresaIndefinido =
  seguridadSocial2026.empresa.contingenciasComunes +
  seguridadSocial2026.empresa.desempleoIndefinido +
  seguridadSocial2026.empresa.formacionProfesional +
  seguridadSocial2026.empresa.fogasa +
  seguridadSocial2026.empresa.mei;

// RETA (Régimen Especial de Trabajadores Autónomos) — simplified
// The 2026 RETA uses income-based tranches for contributions
export const retaTramos2026 = [
  { hastaIngresos: 670, cuotaMinima: 200, cuotaMaxima: 200 },
  { hastaIngresos: 900, cuotaMinima: 220, cuotaMaxima: 220 },
  { hastaIngresos: 1_166.70, cuotaMinima: 260, cuotaMaxima: 260 },
  { hastaIngresos: 1_300, cuotaMinima: 291, cuotaMaxima: 291 },
  { hastaIngresos: 1_500, cuotaMinima: 294, cuotaMaxima: 294 },
  { hastaIngresos: 1_700, cuotaMinima: 294, cuotaMaxima: 294 },
  { hastaIngresos: 1_850, cuotaMinima: 310, cuotaMaxima: 310 },
  { hastaIngresos: 2_030, cuotaMinima: 315, cuotaMaxima: 315 },
  { hastaIngresos: 2_330, cuotaMinima: 320, cuotaMaxima: 320 },
  { hastaIngresos: 2_760, cuotaMinima: 340, cuotaMaxima: 340 },
  { hastaIngresos: 3_190, cuotaMinima: 350, cuotaMaxima: 350 },
  { hastaIngresos: 3_620, cuotaMinima: 370, cuotaMaxima: 370 },
  { hastaIngresos: 4_050, cuotaMinima: 390, cuotaMaxima: 390 },
  { hastaIngresos: 6_000, cuotaMinima: 400, cuotaMaxima: 400 },
  { hastaIngresos: Infinity, cuotaMinima: 530, cuotaMaxima: 530 },
];
