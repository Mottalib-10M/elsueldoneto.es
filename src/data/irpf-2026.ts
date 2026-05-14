/**
 * IRPF 2026 — State brackets and personal/family minimums.
 * Source: Agencia Tributaria, BOE, sede.agenciatributaria.gob.es
 *
 * The IRPF is split into two components:
 * - Estatal (state): uniform across Spain (except foral regimes)
 * - Autonómico (autonomic): varies by Comunidad Autónoma
 *
 * Total IRPF = estatal + autonómico
 */

export interface TramoIRPF {
  hasta: number;      // Upper bound (Infinity for last bracket)
  tipo: number;       // Marginal rate as decimal (e.g., 0.095 = 9.5%)
}

// State IRPF brackets (escala estatal)
// These are the STATE portion only — autonomic brackets are added separately
export const tramosEstatales2026: TramoIRPF[] = [
  { hasta: 12_450, tipo: 0.095 },
  { hasta: 20_200, tipo: 0.12 },
  { hasta: 35_200, tipo: 0.15 },
  { hasta: 60_000, tipo: 0.185 },
  { hasta: 300_000, tipo: 0.225 },
  { hasta: Infinity, tipo: 0.245 },
];

// Mínimo personal y familiar
// Applied to both state and autonomic portions equally
export const minimoPersonal2026 = {
  contribuyente: 5_550,
  edad65a74: 1_150,   // Additional for age 65-74
  edad75plus: 1_400,   // Additional for age 75+

  // Per descendant (children)
  descendientes: [
    2_400,  // 1st child
    2_700,  // 2nd child
    4_000,  // 3rd child
    4_500,  // 4th and subsequent
  ],
  descendienteMenor3: 2_800,  // Additional for child under 3

  // Ascendants (parents living with taxpayer)
  ascendiente65plus: 1_150,
  ascendiente75plus: 1_400, // Additional on top of ascendiente65plus

  // Disability
  discapacidad33a64: 3_000,
  discapacidad65plus: 9_000,
  gastoAsistenciaDiscapacidad: 3_000, // If needs assistance (≥65% or reduced mobility)
};

// Reducción por rendimientos del trabajo (Art. 20 LIRPF)
// Reduces taxable income for employment income
export const reduccionRendimientosTrabajo2026 = {
  // If net employment income ≤ 14,047.50€, reduction = 6,498€
  limiteInferior: 14_047.50,
  reduccionMaxima: 6_498,
  // If net employment income between 14,047.50€ and 19,747.50€:
  // reduction = 6,498 - 1.14 × (rendimiento - 14,047.50)
  limiteSuperior: 19_747.50,
  coeficiente: 1.14,
  // Only applies if other non-employment income ≤ 6,500€
  limiteOtrasRentas: 6_500,
};

// Gastos deducibles fijos del trabajo
export const gastosDeduciblesTrabajo2026 = {
  otros: 2_000,           // "Otros gastos" fixed deduction for all workers
  seguridadSocial: true,  // SS contributions are deductible (calculated separately)
};

// Beckham Law (Régimen Especial para Trabajadores Desplazados)
export const regimenBeckham2026 = {
  tipoFijo: 0.24,           // 24% flat rate up to 600,000€
  tipoExceso: 0.47,         // 47% above 600,000€
  limiteFlat: 600_000,
  duracionAnios: 6,          // Applies for 6 fiscal years
};
