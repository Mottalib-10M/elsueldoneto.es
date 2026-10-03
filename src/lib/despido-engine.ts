/**
 * Motor de indemnización por despido y finiquito (España, 2026).
 *
 * Reglas (todas leídas en el BOE consolidado el 2026-10-03, ver `data/params-despido-2026.json`):
 * - Improcedente: 33 días por año, tope 24 mensualidades (art. 56.1 ET).
 * - Contratos anteriores al 12/02/2012: 45 días por año hasta el 11/02/2012 y 33 después; tope de
 *   720 días salvo que el tramo anterior ya los supere, con un máximo absoluto de 42 mensualidades
 *   (DT 11.ª ET).
 * - Objetivo y despido colectivo (ERE): 20 días por año, tope 12 mensualidades (arts. 51.4 y 53.1.b ET).
 * - Fin de contrato temporal: 12 días por año, parte proporcional (art. 49.1.c ET).
 * - Periodos inferiores al año: prorrateo por meses; la fracción de mes cuenta como mes completo
 *   (práctica judicial mayoritaria; desactivable con `mesCompleto: false`, que prorratea por días).
 * - IRPF: exención hasta la cuantía obligatoria del ET, 180 000 € como máximo (art. 7.e LIRPF);
 *   objetivo por causas del art. 52.c y despido colectivo: exenta hasta el importe del improcedente;
 *   improcedente exenta solo si se reconoce en conciliación o sentencia; fin de contrato: no exenta
 *   (Manual práctico de Renta 2025, AEAT). Reducción del 30 % del exceso si la antigüedad supera
 *   dos años (art. 18.2 LIRPF), sobre 300 000 € como máximo.
 *
 * Funciones puras, sin acceso a la fecha del día: la fecha de fin se pasa siempre como argumento.
 */
import P from '../data/params-despido-2026.json';

export type TipoExtincion = 'improcedente' | 'objetivo' | 'ere' | 'fin-contrato' | 'voluntaria' | 'procedente';
export type Pagas = '14' | '12';

export interface EntradaDespido {
  /** Fecha de alta en la empresa, AAAA-MM-DD */
  inicio: string;
  /** Último día trabajado (fecha de efectos del despido), AAAA-MM-DD */
  fin: string;
  /** Salario bruto anual con pagas extra y complementos fijos */
  salarioAnual: number;
  tipo: TipoExtincion;
  /** '14': pagas extra aparte; '12': prorrateadas en la nómina */
  pagas?: Pagas;
  /** Días naturales de vacaciones al año (mínimo legal 30) */
  vacacionesAnuales?: number;
  /** Días de vacaciones ya disfrutados en el año de la baja */
  vacacionesDisfrutadas?: number;
  /** Objetivo: causa económica, técnica, organizativa o de producción (art. 52.c ET) */
  causaEconomica?: boolean;
  /** Improcedente: reconocida en conciliación (SMAC) o por sentencia */
  reconocidaConciliacion?: boolean;
  /** ERE: días por año y tope en mensualidades pactados (si mejoran el mínimo legal) */
  ereDias?: number;
  ereTopeMensualidades?: number;
  /** Días de preaviso no concedidos (objetivo y ERE: 15 días, art. 53.1.c ET) */
  preavisoOmitido?: number;
  /** Fracción de mes = mes completo (por defecto) */
  mesCompleto?: boolean;
}

export interface TramoAntiguedad { meses: number; dias: number; diasPorAnio: number }

export interface ResultadoDespido {
  valido: boolean;
  error?: 'fechas';
  mesesServicio: number;
  aniosServicio: number;
  salarioDiario: number;
  tramoAnterior2012?: TramoAntiguedad;
  tramoPosterior2012?: TramoAntiguedad;
  diasIndemnizacion: number;
  diasSinTope: number;
  topeDias: number | null;
  /** Regla que fija el importe: 'dias' | 'tope24' | 'tope720' | 'topePre2012' | 'tope42' | 'tope12' | 'topePactado' | 'sin' */
  regla: string;
  indemnizacion: number;
  /** Indemnización que correspondería por despido improcedente (límite de exención en ERE y art. 52.c) */
  indemnizacionImprocedente: number;
  exenta: number;
  sujeta: number;
  reduccion30: number;
  sujetaTrasReduccion: number;
  salarioPendiente: number;
  diasPendientesMes: number;
  vacacionesDevengadas: number;
  vacacionesPendientesDias: number;
  vacacionesImporte: number;
  pagaExtraImporte: number;
  pagaExtraNombre: 'verano' | 'navidad' | null;
  preavisoImporte: number;
  finiquito: number;
  total: number;
}

const DIA = 86_400_000;
const FECHA_2012 = P.fechaReforma2012;

function parse(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return Number.isFinite(t) ? t : null;
}
const ymd = (t: number) => { const d = new Date(t); return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()] as const; };
const addMonths = (t: number, n: number) => { const [y, m, d] = ymd(t); return Date.UTC(y, m + n, d); };

/**
 * Meses de servicio entre `desde` y `hasta` (ambos incluidos). Los meses completos se cuentan
 * de fecha a fecha; el resto en días se redondea a un mes completo (o se prorratea por 30 días).
 */
export function mesesServicio(desde: number, hasta: number, mesCompleto = true): number {
  if (hasta < desde) return 0;
  const finExcl = hasta + DIA;
  let n = 0;
  while (addMonths(desde, n + 1) <= finExcl) n++;
  const resto = Math.round((finExcl - addMonths(desde, n)) / DIA);
  if (resto <= 0) return n;
  return mesCompleto ? n + 1 : n + resto / 30;
}

/** Indemnización por despido improcedente en días de salario, con sus tramos y su tope. */
function diasImprocedente(ini: number, fin: number, mc: boolean, salarioAnual: number) {
  const corte = parse(FECHA_2012)!;
  const I = P.tipos.improcedente, A = P.tipos.improcedentePre2012;
  const diasPorMensualidad = P.diasAnio / 12;
  if (ini >= corte) {
    const meses = mesesServicio(ini, fin, mc);
    const dias = (I.diasPorAnio * meses) / 12;
    const tope = I.topeMensualidades * diasPorMensualidad;
    return { tramoA: undefined, tramoB: { meses, dias, diasPorAnio: I.diasPorAnio }, sinTope: dias, tope, regla: dias > tope ? 'tope24' : 'dias' };
  }
  const finA = Math.min(fin, corte - DIA);
  const mA = mesesServicio(ini, finA, mc);
  const mB = fin >= corte ? mesesServicio(corte, fin, mc) : 0;
  const dA = (A.diasPorAnio * mA) / 12;
  const dB = (I.diasPorAnio * mB) / 12;
  const sinTope = dA + dB;
  let tope: number, regla: string;
  if (dA > A.topeDias) {
    tope = Math.min(dA, A.topeMensualidadesAbsoluto * diasPorMensualidad);
    regla = sinTope > tope ? (dA > A.topeMensualidadesAbsoluto * diasPorMensualidad ? 'tope42' : 'topePre2012') : 'dias';
  } else {
    tope = A.topeDias;
    regla = sinTope > tope ? 'tope720' : 'dias';
  }
  void salarioAnual;
  return {
    tramoA: { meses: mA, dias: dA, diasPorAnio: A.diasPorAnio },
    tramoB: mB > 0 ? { meses: mB, dias: dB, diasPorAnio: I.diasPorAnio } : undefined,
    sinTope, tope, regla,
  };
}

const VACIO: Omit<ResultadoDespido, 'valido' | 'error'> = {
  mesesServicio: 0, aniosServicio: 0, salarioDiario: 0, diasIndemnizacion: 0, diasSinTope: 0, topeDias: null, regla: 'sin',
  indemnizacion: 0, indemnizacionImprocedente: 0, exenta: 0, sujeta: 0, reduccion30: 0, sujetaTrasReduccion: 0,
  salarioPendiente: 0, diasPendientesMes: 0, vacacionesDevengadas: 0, vacacionesPendientesDias: 0, vacacionesImporte: 0,
  pagaExtraImporte: 0, pagaExtraNombre: null, preavisoImporte: 0, finiquito: 0, total: 0,
};

/** Reducción del 30 % del art. 18.2 LIRPF sobre la parte sujeta. */
export function reduccionIrregular(sujeta: number, totalRendimiento: number, anios: number): number {
  const R = P.irpf;
  if (sujeta <= 0 || anios <= R.aniosGeneracionMin) return 0;
  let limite = R.limiteReduccion;
  if (totalRendimiento >= R.umbralReduccionNula) limite = 0;
  else if (totalRendimiento > R.umbralReduccionDecreciente) limite = Math.max(0, R.limiteReduccion - (totalRendimiento - R.umbralReduccionDecreciente));
  return R.reduccionIrregular * Math.min(sujeta, limite);
}

export function calcularDespido(e: EntradaDespido): ResultadoDespido {
  const ini = parse(e.inicio), fin = parse(e.fin);
  if (ini === null || fin === null || fin < ini) return { valido: false, error: 'fechas', ...VACIO };
  const mc = e.mesCompleto ?? true;
  const anual = Math.max(0, e.salarioAnual || 0);
  const pagas: Pagas = e.pagas ?? '14';
  const diario = anual / P.diasAnio;
  const meses = mesesServicio(ini, fin, mc);
  const anios = meses / 12;
  const porMensualidad = P.diasAnio / 12;

  // ── Indemnización ────────────────────────────────────────────────
  const imp = diasImprocedente(ini, fin, mc, anual);
  const diasImp = Math.min(imp.sinTope, imp.tope);
  let dias = 0, sinTope = 0, tope: number | null = null, regla = 'sin';
  let tramoA: TramoAntiguedad | undefined, tramoB: TramoAntiguedad | undefined;
  switch (e.tipo) {
    case 'improcedente':
      dias = diasImp; sinTope = imp.sinTope; tope = imp.tope; regla = imp.regla; tramoA = imp.tramoA; tramoB = imp.tramoB; break;
    case 'objetivo': {
      const O = P.tipos.objetivo; sinTope = (O.diasPorAnio * meses) / 12; tope = O.topeMensualidades * porMensualidad;
      dias = Math.min(sinTope, tope); regla = sinTope > tope ? 'tope12' : 'dias'; break;
    }
    case 'ere': {
      const E = P.tipos.ere;
      const dpa = Math.max(E.diasPorAnio, e.ereDias ?? E.diasPorAnio);
      const tm = Math.max(E.topeMensualidades, e.ereTopeMensualidades ?? E.topeMensualidades);
      sinTope = (dpa * meses) / 12; tope = tm * porMensualidad;
      dias = Math.min(sinTope, tope);
      regla = sinTope > tope ? (tm > E.topeMensualidades ? 'topePactado' : 'tope12') : 'dias'; break;
    }
    case 'fin-contrato':
      sinTope = dias = (P.tipos.finContrato.diasPorAnio * meses) / 12; regla = 'dias'; break;
    default:
      dias = 0; regla = 'sin';
  }
  const indemnizacion = dias * diario;
  const indemnizacionImprocedente = diasImp * diario;

  // ── IRPF de la indemnización ────────────────────────────────────
  let limiteObligatorio = 0;
  if (e.tipo === 'improcedente') limiteObligatorio = (e.reconocidaConciliacion ?? true) ? indemnizacionImprocedente : 0;
  else if (e.tipo === 'objetivo') limiteObligatorio = (e.causaEconomica ?? true) ? indemnizacionImprocedente : Math.min(indemnizacion, (P.tipos.objetivo.diasPorAnio * meses / 12) * diario);
  else if (e.tipo === 'ere') limiteObligatorio = indemnizacionImprocedente;
  else if (e.tipo === 'fin-contrato') limiteObligatorio = P.irpf.finContratoExenta ? indemnizacion : 0;
  const exenta = Math.min(indemnizacion, limiteObligatorio, P.irpf.limiteExencion);
  const sujeta = indemnizacion - exenta;
  const reduccion30 = reduccionIrregular(sujeta, indemnizacion, anios);

  // ── Finiquito ────────────────────────────────────────────────────
  const [fy, fm, fd] = ymd(fin);
  const ultimoDiaMes = new Date(Date.UTC(fy, fm + 1, 0)).getUTCDate();
  const mensualOrdinario = anual / 14; // las dos pagas extra del art. 31 ET existen siempre, prorrateadas o no
  const mensualNomina = pagas === '14' ? anual / 14 : anual / 12;
  const inicioMes = Date.UTC(fy, fm, 1);
  const diasMes = fd === ultimoDiaMes ? 30 : Math.min(30, Math.round((fin - Math.max(inicioMes, ini)) / DIA) + 1);
  const salarioPendiente = (mensualNomina * diasMes) / 30;

  const vacAnual = Math.max(0, e.vacacionesAnuales ?? P.vacacionesMinimasNaturales);
  const inicioAnio = Date.UTC(fy, 0, 1);
  const diasAnio = Math.round((Date.UTC(fy + 1, 0, 1) - inicioAnio) / DIA);
  const diasTrabajadosAnio = Math.round((fin - Math.max(inicioAnio, ini)) / DIA) + 1;
  const vacacionesDevengadas = (vacAnual * diasTrabajadosAnio) / diasAnio;
  const vacacionesPendientesDias = Math.max(0, vacacionesDevengadas - Math.max(0, e.vacacionesDisfrutadas ?? 0));
  const vacacionesImporte = vacacionesPendientesDias * (mensualOrdinario / 30);

  let pagaExtraImporte = 0, pagaExtraNombre: ResultadoDespido['pagaExtraNombre'] = null;
  if (pagas === '14') {
    const h2 = fm >= 6;
    const iniSem = Date.UTC(fy, h2 ? 6 : 0, 1);
    const finSem = Date.UTC(fy, h2 ? 12 : 6, 1);
    const diasSem = Math.round((finSem - iniSem) / DIA);
    const devengados = Math.round((fin - Math.max(iniSem, ini)) / DIA) + 1;
    pagaExtraImporte = (mensualOrdinario * Math.max(0, devengados)) / diasSem;
    pagaExtraNombre = h2 ? 'navidad' : 'verano';
  }
  const preavisoImporte = (e.tipo === 'objetivo' || e.tipo === 'ere') ? Math.max(0, Math.min(P.preavisoObjetivoDias, e.preavisoOmitido ?? 0)) * diario : 0;
  const finiquito = salarioPendiente + vacacionesImporte + pagaExtraImporte + preavisoImporte;

  return {
    valido: true,
    mesesServicio: meses, aniosServicio: anios, salarioDiario: diario,
    tramoAnterior2012: tramoA, tramoPosterior2012: tramoB,
    diasIndemnizacion: dias, diasSinTope: sinTope, topeDias: tope, regla,
    indemnizacion, indemnizacionImprocedente,
    exenta, sujeta, reduccion30, sujetaTrasReduccion: sujeta - reduccion30,
    salarioPendiente, diasPendientesMes: diasMes,
    vacacionesDevengadas, vacacionesPendientesDias, vacacionesImporte,
    pagaExtraImporte, pagaExtraNombre, preavisoImporte,
    finiquito, total: finiquito + indemnizacion,
  };
}

/** Atajo para los mini-simuladores: antigüedad en años completos hasta una fecha de fin dada. */
export function indemnizacionPorAnios(salarioAnual: number, anios: number, tipo: TipoExtincion, fin: string, extra: Partial<EntradaDespido> = {}): ResultadoDespido {
  const f = parse(fin)!;
  const [y, m, d] = ymd(f);
  const totalMeses = Math.round(anios * 12);
  const ini = Date.UTC(y, m - totalMeses, d + 1);
  const iso = new Date(ini).toISOString().slice(0, 10);
  return calcularDespido({ inicio: iso, fin, salarioAnual, tipo, ...extra });
}

export const PARAMS_DESPIDO = P;
