/**
 * Seguridad Social 2026 — Contribution rates (Régimen General).
 * Source: BOE Orden PJC/297/2026, seg-social.es, sage.com
 *
 * Employee contributions deducted from gross salary each month.
 */

export const seguridadSocial2026 = {
  // Base de cotización limits (monthly)
  baseMaximaMensual: 5_101.20,
  baseMinimaMensual: 1_424.40,  // SMI + 1/6 (Orden PJC/297/2026, art. 2)

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

  // Cuota de solidaridad 2026 : parte de la retribución que supera la base máxima (cuota del trabajador).
  // Total 1,15 % / 1,25 % / 1,46 % ; a cargo de la empresa 0,96 % / 1,04 % / 1,22 %.
  solidaridad: [
    { hastaMensual: 5_611.32, empleado: 0.0019, empresa: 0.0096 },
    { hastaMensual: 7_651.80, empleado: 0.0021, empresa: 0.0104 },
    { hastaMensual: Infinity, empleado: 0.0024, empresa: 0.0122 },
  ],

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

// RETA (Régimen Especial de Trabajadores Autónomos)
// Orden PJC/297/2026, art. 8 : bases mínimas por tramo de rendimientos netos (sin cambios respecto a 2025).
// Tipo total 2026 : 28,30 % contingencias comunes + 1,30 % profesionales + 0,90 % cese de actividad
// + 0,10 % formación profesional + 0,90 % MEI = 31,50 %. La cuota mínima es la base mínima por ese tipo.
export const RETA_TIPO_2026 = 0.315;
/** [rendimiento neto mensual hasta, base mínima, base máxima] */
const RETA_BASES: Array<[number, number, number]> = [
  [670, 653.59, 718.94],
  [900, 718.95, 900],
  [1_166.70, 849.67, 1_166.70],
  [1_300, 950.98, 1_300],
  [1_500, 960.78, 1_500],
  [1_700, 960.78, 1_700],
  [1_850, 1_143.79, 1_850],
  [2_030, 1_209.15, 2_030],
  [2_330, 1_274.51, 2_330],
  [2_760, 1_356.21, 2_760],
  [3_190, 1_437.91, 3_190],
  [3_620, 1_519.61, 3_620],
  [4_050, 1_601.31, 4_050],
  [6_000, 1_732.03, 5_101.20],
  [Infinity, 1_928.10, 5_101.20],
];
const redondear = (x: number) => Math.round(x * 100) / 100;
export const retaTramos2026 = RETA_BASES.map(([hastaIngresos, baseMinima, baseMaxima], i) => ({
  tramo: i + 1,
  desdeIngresos: i === 0 ? 0 : RETA_BASES[i - 1][0],
  hastaIngresos,
  baseMinima,
  baseMaxima,
  cuotaMinima: redondear(baseMinima * RETA_TIPO_2026),
  cuotaMaxima: redondear(baseMaxima * RETA_TIPO_2026),
}));
