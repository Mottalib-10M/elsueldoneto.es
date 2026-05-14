/**
 * IRPF Engine — Core tax calculation functions for Spain 2026.
 *
 * Pure functions, no side effects. All amounts in euros (annual).
 * Handles both common regime and foral regimes (País Vasco, Navarra).
 */

import {
  tramosEstatales2026,
  minimoPersonal2026,
  reduccionRendimientosTrabajo2026,
  gastosDeduciblesTrabajo2026,
  regimenBeckham2026,
  type TramoIRPF,
} from '../data/irpf-2026';

import {
  comunidadesAutonomas,
  getCCAAByCodigo,
  type CCAACodigo,
  type ComunidadAutonoma,
} from '../data/comunidades-autonomas';

import {
  seguridadSocial2026,
  tipoEmpleadoIndefinido,
} from '../data/seguridad-social-2026';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SituacionFamiliar {
  hijos: number;            // Number of children (dependents < 25)
  hijosMenores3: number;    // Of those, how many are under 3
  ascendientes65: number;   // Ascendants 65+ living with taxpayer
  ascendientes75: number;   // Of those, how many are 75+
  conyuge: 'sin-ingresos' | 'con-ingresos' | 'soltero';
  discapacidad: 0 | 33 | 65;  // Own disability percentage (0, 33-64%, or 65%+)
  edad: number;             // Taxpayer age
}

export interface DesgloseSueldo {
  brutoAnual: number;
  seguridadSocialAnual: number;
  irpfEstatalAnual: number;
  irpfAutonomicoAnual: number;
  irpfTotalAnual: number;
  netoAnual: number;
  netoMensual: number;
  tipoEfectivoIRPF: number;    // Effective IRPF rate as decimal
  tipoEfectivoTotal: number;   // Effective total deduction rate
  retencionMensual: number;    // Monthly IRPF withholding
  ssMensual: number;           // Monthly SS contribution
  pagas: 12 | 14;

  // Detailed breakdown
  baseImponible: number;
  minimoPersonalFamiliar: number;
  reduccionRendimientosTrabajo: number;
  bonificacionCeutaMelilla: number;
}

export const situacionFamiliarDefecto: SituacionFamiliar = {
  hijos: 0,
  hijosMenores3: 0,
  ascendientes65: 0,
  ascendientes75: 0,
  conyuge: 'soltero',
  discapacidad: 0,
  edad: 30,
};

// ── Progressive tax calculation ────────────────────────────────────────────

/**
 * Calculate tax using progressive brackets.
 * @param baseImponible Taxable income
 * @param tramos Tax brackets (with upper bounds and marginal rates)
 * @returns Total tax amount
 */
export function calcularImpuestoProgresivo(
  baseImponible: number,
  tramos: TramoIRPF[]
): number {
  if (baseImponible <= 0) return 0;

  let impuesto = 0;
  let baseRestante = baseImponible;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    if (baseRestante <= 0) break;

    const anchoTramo = tramo.hasta === Infinity
      ? baseRestante
      : Math.min(tramo.hasta - limiteAnterior, baseRestante);

    impuesto += anchoTramo * tramo.tipo;
    baseRestante -= anchoTramo;
    limiteAnterior = tramo.hasta === Infinity ? limiteAnterior : tramo.hasta;
  }

  return impuesto;
}

// ── Mínimo personal y familiar ─────────────────────────────────────────────

export function calcularMinimoPersonalFamiliar(situacion: SituacionFamiliar): number {
  let minimo = minimoPersonal2026.contribuyente;

  // Age additions for taxpayer
  if (situacion.edad >= 75) {
    minimo += minimoPersonal2026.edad65a74 + minimoPersonal2026.edad75plus;
  } else if (situacion.edad >= 65) {
    minimo += minimoPersonal2026.edad65a74;
  }

  // Descendents (children)
  for (let i = 0; i < situacion.hijos; i++) {
    const idx = Math.min(i, minimoPersonal2026.descendientes.length - 1);
    minimo += minimoPersonal2026.descendientes[idx];
  }

  // Children under 3 additional
  minimo += situacion.hijosMenores3 * minimoPersonal2026.descendienteMenor3;

  // Ascendants
  minimo += situacion.ascendientes65 * minimoPersonal2026.ascendiente65plus;
  minimo += situacion.ascendientes75 * minimoPersonal2026.ascendiente75plus;

  // Own disability
  if (situacion.discapacidad >= 65) {
    minimo += minimoPersonal2026.discapacidad65plus + minimoPersonal2026.gastoAsistenciaDiscapacidad;
  } else if (situacion.discapacidad >= 33) {
    minimo += minimoPersonal2026.discapacidad33a64;
  }

  return minimo;
}

// ── Reducción por rendimientos del trabajo ──────────────────────────────────

export function calcularReduccionRendimientosTrabajo(
  rendimientosNetosTrabajo: number
): number {
  const r = reduccionRendimientosTrabajo2026;

  if (rendimientosNetosTrabajo <= r.limiteInferior) {
    return r.reduccionMaxima;
  }

  if (rendimientosNetosTrabajo <= r.limiteSuperior) {
    return Math.max(
      0,
      r.reduccionMaxima - r.coeficiente * (rendimientosNetosTrabajo - r.limiteInferior)
    );
  }

  return 0;
}

// ── Seguridad Social ────────────────────────────────────────────────────────

export function calcularSeguridadSocialAnual(
  brutoAnual: number,
  tipoContrato: 'indefinido' | 'temporal' = 'indefinido'
): number {
  const baseMensual = Math.min(
    Math.max(brutoAnual / 12, seguridadSocial2026.baseMinimaMensual),
    seguridadSocial2026.baseMaximaMensual
  );

  const tipo = tipoContrato === 'indefinido'
    ? tipoEmpleadoIndefinido
    : (seguridadSocial2026.empleado.contingenciasComunes +
       seguridadSocial2026.empleado.desempleoTemporal +
       seguridadSocial2026.empleado.formacionProfesional +
       seguridadSocial2026.empleado.mei);

  return baseMensual * tipo * 12;
}

// ── Main IRPF calculation ───────────────────────────────────────────────────

export function calcularIRPF(
  brutoAnual: number,
  ccaa: CCAACodigo,
  situacion: SituacionFamiliar = situacionFamiliarDefecto
): { estatal: number; autonomico: number; total: number; bonificacion: number } {
  const comunidad = getCCAAByCodigo(ccaa);

  // SS contributions are deductible
  const ssAnual = calcularSeguridadSocialAnual(brutoAnual);

  // Net employment income = bruto - SS - gastos deducibles
  const rendimientosNetos = brutoAnual - ssAnual - gastosDeduciblesTrabajo2026.otros;

  // Reducción por rendimientos del trabajo
  const reduccion = calcularReduccionRendimientosTrabajo(rendimientosNetos);

  // Base imponible general
  const baseImponible = Math.max(0, rendimientosNetos - reduccion);

  // Mínimo personal y familiar
  const minimoPersonalFamiliar = calcularMinimoPersonalFamiliar(situacion);

  if (comunidad.esForal) {
    // Foral regimes: single bracket structure, no state/autonomic split
    const impuestoTotal = calcularImpuestoProgresivo(baseImponible, comunidad.tramos);
    const cuotaMinimo = calcularImpuestoProgresivo(minimoPersonalFamiliar, comunidad.tramos);
    const total = Math.max(0, impuestoTotal - cuotaMinimo);

    return { estatal: 0, autonomico: total, total, bonificacion: 0 };
  }

  // Common regime: calculate state and autonomic portions separately
  const impuestoEstatal = calcularImpuestoProgresivo(baseImponible, tramosEstatales2026);
  const cuotaMinimoEstatal = calcularImpuestoProgresivo(minimoPersonalFamiliar, tramosEstatales2026);
  const estatal = Math.max(0, impuestoEstatal - cuotaMinimoEstatal);

  const impuestoAutonomico = calcularImpuestoProgresivo(baseImponible, comunidad.tramos);
  const cuotaMinimoAutonomico = calcularImpuestoProgresivo(minimoPersonalFamiliar, comunidad.tramos);
  const autonomico = Math.max(0, impuestoAutonomico - cuotaMinimoAutonomico);

  let bonificacion = 0;
  // Ceuta and Melilla: 50% bonus on total tax
  if (ccaa === 'CE' || ccaa === 'ML') {
    bonificacion = (estatal + autonomico) * 0.5;
  }

  const total = estatal + autonomico - bonificacion;

  return { estatal, autonomico, total, bonificacion };
}

// ── Full salary breakdown ───────────────────────────────────────────────────

export function calcularSueldoNeto(
  brutoAnual: number,
  ccaa: CCAACodigo = 'MD',
  situacion: SituacionFamiliar = situacionFamiliarDefecto,
  pagas: 12 | 14 = 14
): DesgloseSueldo {
  const ssAnual = calcularSeguridadSocialAnual(brutoAnual);
  const rendimientosNetos = brutoAnual - ssAnual - gastosDeduciblesTrabajo2026.otros;
  const reduccion = calcularReduccionRendimientosTrabajo(rendimientosNetos);
  const baseImponible = Math.max(0, rendimientosNetos - reduccion);
  const minimoPersonalFamiliar = calcularMinimoPersonalFamiliar(situacion);
  const irpf = calcularIRPF(brutoAnual, ccaa, situacion);

  const netoAnual = brutoAnual - ssAnual - irpf.total;
  const netoMensual = netoAnual / pagas;

  return {
    brutoAnual,
    seguridadSocialAnual: ssAnual,
    irpfEstatalAnual: irpf.estatal,
    irpfAutonomicoAnual: irpf.autonomico,
    irpfTotalAnual: irpf.total,
    netoAnual,
    netoMensual,
    tipoEfectivoIRPF: brutoAnual > 0 ? irpf.total / brutoAnual : 0,
    tipoEfectivoTotal: brutoAnual > 0 ? (ssAnual + irpf.total) / brutoAnual : 0,
    retencionMensual: irpf.total / 12,  // Monthly withholding (always /12)
    ssMensual: ssAnual / 12,
    pagas,
    baseImponible,
    minimoPersonalFamiliar,
    reduccionRendimientosTrabajo: reduccion,
    bonificacionCeutaMelilla: irpf.bonificacion,
  };
}

// ── Beckham regime ──────────────────────────────────────────────────────────

export function calcularBeckham(brutoAnual: number): {
  irpfAnual: number;
  netoAnual: number;
  tipoEfectivo: number;
} {
  const ssAnual = calcularSeguridadSocialAnual(brutoAnual);
  const baseImponible = brutoAnual; // Beckham: gross is the base

  let irpf: number;
  if (baseImponible <= regimenBeckham2026.limiteFlat) {
    irpf = baseImponible * regimenBeckham2026.tipoFijo;
  } else {
    irpf = regimenBeckham2026.limiteFlat * regimenBeckham2026.tipoFijo +
           (baseImponible - regimenBeckham2026.limiteFlat) * regimenBeckham2026.tipoExceso;
  }

  return {
    irpfAnual: irpf,
    netoAnual: brutoAnual - ssAnual - irpf,
    tipoEfectivo: brutoAnual > 0 ? irpf / brutoAnual : 0,
  };
}

// ── Reverse: net target → required gross ────────────────────────────────────

export function calcularBrutoDesdeNeto(
  netoObjetivo: number,
  ccaa: CCAACodigo = 'MD',
  situacion: SituacionFamiliar = situacionFamiliarDefecto,
  pagas: 12 | 14 = 14,
  precision: number = 1
): number {
  // Binary search for the gross that produces the desired net
  let low = netoObjetivo;
  let high = netoObjetivo * 2.5; // Reasonable upper bound

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const resultado = calcularSueldoNeto(mid, ccaa, situacion, pagas);

    if (Math.abs(resultado.netoAnual - netoObjetivo) < precision) {
      return Math.round(mid * 100) / 100;
    }

    if (resultado.netoAnual < netoObjetivo) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.round((low + high) / 2 * 100) / 100;
}

// ── Compare all CCAAs ───────────────────────────────────────────────────────

export function compararComunidades(
  brutoAnual: number,
  situacion: SituacionFamiliar = situacionFamiliarDefecto,
  pagas: 12 | 14 = 14
): DesgloseSueldo[] {
  return comunidadesAutonomas.map(ccaa =>
    calcularSueldoNeto(brutoAnual, ccaa.codigo, situacion, pagas)
  );
}
