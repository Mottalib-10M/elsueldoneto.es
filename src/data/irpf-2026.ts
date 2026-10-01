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

// Reducción por obtención de rendimientos del trabajo (art. 20 LIRPF, redacción vigente desde 2024)
export const reduccionRendimientosTrabajo2026 = {
  // Rendimiento neto ≤ 14.852 € : 7.302 €
  limiteInferior: 14_852,
  reduccionMaxima: 7_302,
  // Entre 14.852 y 17.673,52 € : 7.302 − 1,75 × (rendimiento − 14.852)
  limiteMedio: 17_673.52,
  coeficienteMedio: 1.75,
  // Entre 17.673,52 y 19.747,50 € : 2.364,34 − 1,14 × (rendimiento − 17.673,52)
  reduccionMedia: 2_364.34,
  limiteSuperior: 19_747.50,
  coeficiente: 1.14,
  // Solo si las demás rentas no superan 6.500 €
  limiteOtrasRentas: 6_500,
};

// Deducción por obtención de rendimientos del trabajo (disp. adicional 61.ª LIRPF, Real Decreto-ley 5/2026) :
// 590,89 € hasta 17.094 € de rendimientos íntegros ; después baja 0,2 € por euro y se agota en 20.048,45 €.
export const deduccionSMI2026 = {
  importe: 590.89,
  hasta: 17_094,
  coeficiente: 0.2,
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
