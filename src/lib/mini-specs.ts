/** Mini-simuladores de las guías (RECETTE §9.3), en español e inglés, calculados con los motores del sitio. */
import { calcularSueldoNeto, calcularBeckham, situacionFamiliarDefecto } from './irpf-engine';
import { calcularCuotaAutonomo, calcularPlanAhorro } from './finanz-engine';
import { calcularDespido, indemnizacionPorAnios } from './despido-engine';
import { porcentajePorMeses, coeficienteAnticipo, coeficienteSobreTope, baseReguladora, edadOrdinaria, PARAMS_JUBILACION as PJ, BASES_2026 } from './jubilacion-engine';
import { retaTramos2026 } from '../data/seguridad-social-2026';
import { comunidadesAutonomas } from '../data/comunidades-autonomas';
import type { MiniSpec } from './mini-types';

type L = 'es' | 'en';
const T = <A>(l: L, es: A, en: A) => (l === 'en' ? en : es);
const eur = (l: L, x: number, d = 0) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
const pct = (l: L, x: number) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'es-ES', { style: 'percent', maximumFractionDigits: 1 }).format(x);
const CCAA = [...comunidadesAutonomas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const MD = CCAA.findIndex((c) => c.codigo === 'MD');
const ccaa = (l: L) => ({ id: 'c', label: T(l, 'Comunidad autónoma', 'Autonomous community'), def: MD, options: CCAA.map((c, i) => ({ value: String(i), label: c.nombre })) });
const bruto = (l: L, def = 30000) => ({ id: 'b', label: T(l, 'Sueldo bruto anual', 'Gross annual salary'), def, unit: '€', max: 5000000 });
const REF = '2026-10-03';
const fechaRef = (l: L) => new Intl.DateTimeFormat(l === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(REF + 'T00:00:00Z'));
const num = (l: L, x: number, d = 0) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'es-ES', { maximumFractionDigits: d }).format(x);
const pct2 = (l: L, x: number) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'es-ES', { style: 'percent', maximumFractionDigits: 2 }).format(x);
const edadTxt = (l: L, m: number) => `${Math.floor(m / 12)} ${T(l, 'años', 'years')}${m % 12 ? ` ${T(l, 'y', 'and')} ${m % 12} ${T(l, 'meses', 'months')}` : ''}`;
const N = (b: number, c = MD) => calcularSueldoNeto(b, CCAA[c]?.codigo ?? 'MD', situacionFamiliarDefecto, 14);

const SPECS: Record<string, (l: L) => MiniSpec> = {
  neto: (l) => ({ title: T(l, 'Calcula tu sueldo neto', 'Work out your net salary'), cta: T(l, 'Calculadora completa', 'Full calculator'), inputs: [bruto(l), ccaa(l)], run: ({ b, c }) => {
    const r = N(b, c); return { head: [T(l, 'Neto al mes, 14 pagas', 'Net per month, 14 payments'), eur(l, r.netoMensual)], rows: [[T(l, 'IRPF al año', 'Income tax per year'), eur(l, r.irpfTotalAnual)], [T(l, 'Seguridad Social al año', 'Social security per year'), eur(l, r.seguridadSocialAnual)], [T(l, 'Tipo efectivo de IRPF', 'Effective income tax rate'), pct(l, r.tipoEfectivoIRPF)]] };
  } }),
  ccaa: (l) => ({ title: T(l, 'Tu IRPF según la comunidad', 'Your income tax by region'), cta: T(l, 'Calculadora completa', 'Full calculator'), inputs: [bruto(l, 40000), ccaa(l)], run: ({ b, c }) => {
    const r = N(b, c); const m = N(b, MD); return { head: [T(l, 'IRPF autonómico al año', 'Regional income tax per year'), eur(l, r.irpfAutonomicoAnual)], rows: [[T(l, 'IRPF estatal', 'State income tax'), eur(l, r.irpfEstatalAnual)], [T(l, 'Frente a Madrid', 'Compared with Madrid'), `${r.netoAnual >= m.netoAnual ? '+' : '−'}${eur(l, Math.abs(r.netoAnual - m.netoAnual))} ${T(l, 'netos al año', 'net per year')}`]] };
  } }),
  tramos: (l) => ({ title: T(l, 'Cuánto IRPF pagas por tramos', 'Income tax across the brackets'), cta: T(l, 'Calculadora completa', 'Full calculator'), inputs: [bruto(l, 35000)], run: ({ b }) => {
    const r = N(b); return { head: [T(l, 'IRPF al año', 'Income tax per year'), eur(l, r.irpfTotalAnual)], rows: [[T(l, 'Base imponible', 'Taxable base'), eur(l, r.baseImponible)], [T(l, 'Tipo efectivo', 'Effective rate'), pct(l, r.tipoEfectivoIRPF)], [T(l, 'Retención al mes', 'Withholding per month'), eur(l, r.retencionMensual)]] };
  } }),
  beckham: (l) => ({ title: T(l, 'Régimen Beckham frente al IRPF general', 'Beckham regime against the normal rules'), cta: T(l, 'Calculadora completa', 'Full calculator'), inputs: [bruto(l, 90000)], run: ({ b }) => {
    const x = calcularBeckham(b); const r = N(b); return { head: [T(l, 'Ahorro al año con el régimen', 'Saving per year under the regime'), eur(l, r.irpfTotalAnual - x.irpfAnual)], rows: [[T(l, 'IRPF con régimen Beckham', 'Tax under the Beckham regime'), eur(l, x.irpfAnual)], [T(l, 'IRPF general (Madrid)', 'Normal tax (Madrid)'), eur(l, r.irpfTotalAnual)]] };
  } }),
  finiquito: (l) => ({ title: T(l, 'Calcula tu finiquito y tu indemnización', 'Work out your final pay and compensation'), cta: T(l, 'Calculadora de finiquito', 'Final pay calculator'), inputs: [{ id: 's', label: T(l, 'Salario bruto anual', 'Gross annual salary'), def: 28000, unit: '€', max: 5000000 }, { id: 'a', label: T(l, 'Años de antigüedad', 'Years of service'), def: 5, unit: T(l, 'años', 'yrs'), max: 50, decimals: 1 }, { id: 't', label: T(l, 'Motivo de la baja', 'Reason for leaving'), def: 0, options: [{ value: '0', label: T(l, 'Despido improcedente', 'Unfair dismissal') }, { value: '1', label: T(l, 'Despido objetivo', 'Objective dismissal') }, { value: '2', label: T(l, 'Fin de contrato temporal', 'End of temporary contract') }, { value: '3', label: T(l, 'Baja voluntaria', 'Resignation') }] }], run: ({ s, a, t }) => {
    const tipo = (['improcedente', 'objetivo', 'fin-contrato', 'voluntaria'] as const)[t] ?? 'improcedente'; const f = indemnizacionPorAnios(s, a, tipo, REF);
    return { head: [T(l, 'Total bruto a cobrar', 'Total gross due'), eur(l, f.total)], rows: [[T(l, 'Indemnización', 'Compensation'), eur(l, f.indemnizacion)], [T(l, 'Finiquito (mes, vacaciones, paga extra)', 'Final pay (month, holidays, extra payment)'), eur(l, f.finiquito)], [T(l, 'Paga extra de Navidad devengada', 'Accrued Christmas extra payment'), eur(l, f.pagaExtraImporte)]], note: T(l, `Baja el ${fechaRef(l)}, sin vacaciones disfrutadas en el año.`, `Leaving on ${fechaRef(l)}, no holiday taken this year.`) };
  } }),
  improcedente: (l) => ({ title: T(l, 'Indemnización por despido improcedente', 'Unfair dismissal compensation'), cta: T(l, 'Calculadora de indemnización por despido', 'Dismissal compensation calculator'), inputs: [{ id: 's', label: T(l, 'Salario bruto anual', 'Gross annual salary'), def: 30000, unit: '€', max: 5000000 }, { id: 'y', label: T(l, 'Año de alta (1 de enero)', 'Year you started (1 January)'), def: 2008, max: 2026, group: false }], run: ({ s, y }) => {
    const anio = Math.min(2026, Math.max(1960, Math.round(y))); const r = calcularDespido({ inicio: `${anio}-01-01`, fin: REF, salarioAnual: s, tipo: 'improcedente' });
    const rows: Array<[string, string]> = [];
    if (r.tramoAnterior2012) rows.push([T(l, 'Días a 45 por año (hasta el 11/02/2012)', 'Days at 45 a year (to 11/02/2012)'), num(l, r.tramoAnterior2012.dias, 1)]);
    if (r.tramoPosterior2012) rows.push([T(l, 'Días a 33 por año', 'Days at 33 a year'), num(l, r.tramoPosterior2012.dias, 1)]);
    rows.push([T(l, 'Días pagados tras el tope', 'Days paid after the cap'), num(l, r.diasIndemnizacion, 1)]);
    return { head: [T(l, 'Indemnización bruta', 'Gross compensation'), eur(l, r.indemnizacion)], rows, note: T(l, `Antigüedad hasta el ${fechaRef(l)}.`, `Service up to ${fechaRef(l)}.`) };
  } }),
  objetivo: (l) => ({ title: T(l, 'Despido objetivo o ERE: cuánto cobras', 'Objective dismissal or ERE: what you get'), cta: T(l, 'Calculadora de indemnización por despido', 'Dismissal compensation calculator'), inputs: [{ id: 's', label: T(l, 'Salario bruto anual', 'Gross annual salary'), def: 32000, unit: '€', max: 5000000 }, { id: 'a', label: T(l, 'Años de antigüedad', 'Years of service'), def: 9, unit: T(l, 'años', 'yrs'), max: 50, decimals: 1 }, { id: 'd', label: T(l, 'Días por año pactados', 'Days per year agreed'), def: 20, unit: T(l, 'días', 'days'), max: 90 }], run: ({ s, a, d }) => {
    const r = indemnizacionPorAnios(s, a, 'ere', REF, { ereDias: d, ereTopeMensualidades: d > 20 ? 24 : 12 });
    return { head: [T(l, 'Indemnización bruta', 'Gross compensation'), eur(l, r.indemnizacion)], rows: [[T(l, 'Exenta de IRPF', 'Tax-free'), eur(l, r.exenta)], [T(l, 'Sujeta a IRPF', 'Taxable'), eur(l, r.sujeta)], [T(l, 'Mínimo legal (20 días, tope 12 meses)', 'Legal minimum (20 days, 12-month cap)'), eur(l, indemnizacionPorAnios(s, a, 'objetivo', REF).indemnizacion)]], note: T(l, 'Con más de 20 días se supone un tope pactado de 24 mensualidades.', 'Above 20 days, an agreed cap of 24 months’ pay is assumed.') };
  } }),
  fincontrato: (l) => ({ title: T(l, 'Indemnización por fin de contrato temporal', 'End of temporary contract payment'), cta: T(l, 'Calculadora de finiquito', 'Final pay calculator'), inputs: [{ id: 's', label: T(l, 'Salario bruto anual', 'Gross annual salary'), def: 22000, unit: '€', max: 5000000 }, { id: 'm', label: T(l, 'Duración del contrato', 'Length of the contract'), def: 9, unit: T(l, 'meses', 'months'), max: 120 }], run: ({ s, m }) => {
    const r = indemnizacionPorAnios(s, m / 12, 'fin-contrato', REF);
    return { head: [T(l, 'Indemnización (12 días por año)', 'Payment (12 days a year)'), eur(l, r.indemnizacion)], rows: [[T(l, 'Días de salario', 'Days of salary'), num(l, r.diasIndemnizacion, 1)], [T(l, 'Finiquito además', 'Final pay on top'), eur(l, r.finiquito)], [T(l, 'Sujeta a IRPF', 'Taxable'), eur(l, r.sujeta)]] };
  } }),
  irpfindem: (l) => ({ title: T(l, 'Qué parte de tu indemnización paga IRPF', 'How much of your severance is taxed'), cta: T(l, 'Calculadora de indemnización por despido', 'Dismissal compensation calculator'), inputs: [{ id: 's', label: T(l, 'Salario bruto anual', 'Gross annual salary'), def: 60000, unit: '€', max: 5000000 }, { id: 'a', label: T(l, 'Años de antigüedad', 'Years of service'), def: 12, unit: T(l, 'años', 'yrs'), max: 50, decimals: 1 }, { id: 'd', label: T(l, 'Días por año que te pagan', 'Days per year you are paid'), def: 45, unit: T(l, 'días', 'days'), max: 120 }], run: ({ s, a, d }) => {
    const r = indemnizacionPorAnios(s, a, 'ere', REF, { ereDias: d, ereTopeMensualidades: 60 });
    return { head: [T(l, 'Parte exenta', 'Tax-free part'), eur(l, r.exenta)], rows: [[T(l, 'Indemnización pactada', 'Agreed compensation'), eur(l, r.indemnizacion)], [T(l, 'Parte sujeta', 'Taxable part'), eur(l, r.sujeta)], [T(l, 'Reducción del 30 %', '30% reduction'), eur(l, r.reduccion30)], [T(l, 'Sujeta tras la reducción', 'Taxable after the reduction'), eur(l, r.sujetaTrasReduccion)]], note: T(l, 'Despido colectivo o por causas económicas: exenta hasta el importe del improcedente, máximo 180.000 €.', 'Collective or economic dismissal: tax-free up to the unfair-dismissal amount, at most €180,000.') };
  } }),
  edad: (l) => ({ title: T(l, 'A qué edad te jubilas', 'Your ordinary retirement age'), cta: T(l, 'Simulador de jubilación', 'Retirement pension calculator'), inputs: [{ id: 'n', label: T(l, 'Año de nacimiento', 'Year of birth'), def: 1962, max: 2010, group: false }, { id: 'c', label: T(l, 'Años cotizados al cumplir 65', 'Years contributed at 65'), def: 37, unit: T(l, 'años', 'yrs'), max: 60, decimals: 1 }], run: ({ n, c }) => {
    const nac = Math.round(n) * 12; const e = edadOrdinaria(nac, () => Math.round(c * 12)); const fin = nac + e;
    return { head: [T(l, 'Edad ordinaria', 'Ordinary age'), edadTxt(l, e)], rows: [[T(l, 'Te jubilarías en', 'You would retire in'), `${Math.floor(fin / 12)}`], [T(l, 'Cotización para hacerlo a los 65', 'Contributions needed to retire at 65'), edadTxt(l, Math.floor((nac + 780) / 12) <= 2026 ? 459 : 462)]], note: T(l, 'Nacimiento en enero; la edad se calcula por meses.', 'Born in January; age is counted in months.') };
  } }),
  basereg: (l) => ({ title: T(l, 'Tu base reguladora con las dos fórmulas', 'Your regulatory base under both formulas'), cta: T(l, 'Simulador de jubilación', 'Retirement pension calculator'), inputs: [{ id: 'b', label: T(l, 'Base de cotización mensual', 'Monthly contribution base'), def: 2500, unit: '€', max: 100000 }, { id: 'g', label: T(l, 'Meses sin cotizar antes de jubilarte', 'Months without contributions before retiring'), def: 6, unit: T(l, 'meses', 'months'), max: 120 }, { id: 'y', label: T(l, 'Año de jubilación', 'Year of retirement'), def: 2026, max: 2045, group: false }], run: ({ b, g, y }) => {
    const base = Math.min(BASES_2026.maxima, Math.max(BASES_2026.minima, b)); const lag = Math.round(g); const anio = Math.min(2045, Math.max(2026, Math.round(y)));
    const serie = Array.from({ length: 360 }, (_, i) => (i < lag ? null : base)); const r = baseReguladora(serie, anio);
    const rows: Array<[string, string]> = [];
    if (r.baseAntigua !== null) rows.push([T(l, 'Fórmula de 2023 (300 ÷ 350)', '2023 formula (300 ÷ 350)'), eur(l, r.baseAntigua)]);
    rows.push([T(l, 'Fórmula nueva del año', 'New formula for that year'), eur(l, r.baseNueva)]);
    rows.push([T(l, 'Se aplica', 'Applied'), r.metodo === 'antigua' ? T(l, 'la de 2023', 'the 2023 one') : T(l, 'la nueva', 'the new one')]);
    return { head: [T(l, 'Base reguladora', 'Regulatory base'), eur(l, r.baseReguladora)], rows, note: T(l, 'Base constante en euros de hoy; lagunas a la base mínima.', 'Constant base in today’s euros; gaps filled at the minimum base.') };
  } }),
  anticipada: (l) => ({ title: T(l, 'Cuánto pierdes jubilándote antes', 'What early retirement costs you'), cta: T(l, 'Simulador de jubilación', 'Retirement pension calculator'), inputs: [{ id: 'b', label: T(l, 'Base reguladora', 'Regulatory base'), def: 2200, unit: '€', max: 100000 }, { id: 'c', label: T(l, 'Años cotizados al jubilarte', 'Years contributed when retiring'), def: 38, unit: T(l, 'años', 'yrs'), max: 60, decimals: 1 }, { id: 'm', label: T(l, 'Meses de adelanto', 'Months early'), def: 24, unit: T(l, 'meses', 'months'), max: 48 }, { id: 'v', label: T(l, 'Tipo de anticipada', 'Type of early retirement'), def: 0, options: [{ value: '0', label: T(l, 'Voluntaria (máx. 24 meses, 35 años)', 'Voluntary (max 24 months, 35 years)') }, { value: '1', label: T(l, 'Involuntaria (máx. 48 meses, 33 años)', 'Involuntary (max 48 months, 33 years)') }] }], run: ({ b, c, m, v }) => {
    const inv = v === 1; const meses = Math.round(c * 12); const ant = Math.min(Math.round(m), inv ? 48 : 24); const pct = porcentajePorMeses(meses, 2026);
    const bruta = (b * pct) / 100; const MAX = PJ.pensionMaximaMensual; let coef = coeficienteAnticipo(ant, meses, inv); let p: number;
    if (!inv && bruta > MAX) { coef = coeficienteSobreTope(ant, meses, 2026); p = MAX * (1 - coef); } else p = Math.min(MAX, bruta * (1 - coef));
    const ok = meses >= (inv ? 396 : 420);
    return { head: [T(l, 'Pensión anticipada', 'Early pension'), eur(l, p)], rows: [[T(l, 'Coeficiente reductor', 'Reduction coefficient'), pct2(l, coef)], [T(l, 'Pensión a la edad ordinaria', 'Pension at ordinary age'), eur(l, Math.min(MAX, bruta))], [T(l, 'Pérdida al mes, de por vida', 'Monthly loss, for life'), eur(l, Math.min(MAX, bruta) - p)]], note: ok ? T(l, `Escala de 2026: ${num(l, pct, 2)} % de la base.`, `2026 scale: ${num(l, pct, 2)}% of the base.`) : T(l, 'No reúnes los años cotizados que exige esta modalidad.', 'You do not have the contribution years this route requires.') };
  } }),
  minmax: (l) => ({ title: T(l, 'Tu pensión frente a la mínima y la máxima', 'Your pension against the minimum and maximum'), cta: T(l, 'Simulador de jubilación', 'Retirement pension calculator'), inputs: [{ id: 'b', label: T(l, 'Base reguladora', 'Regulatory base'), def: 1500, unit: '€', max: 100000 }, { id: 'c', label: T(l, 'Años cotizados', 'Years contributed'), def: 20, unit: T(l, 'años', 'yrs'), max: 60, decimals: 1 }, { id: 's', label: T(l, 'Situación familiar', 'Household'), def: 0, options: [{ value: '0', label: T(l, 'Sin cónyuge a cargo', 'No dependent spouse') }, { value: '1', label: T(l, 'Con cónyuge a cargo', 'Dependent spouse') }, { value: '2', label: T(l, 'Con cónyuge no a cargo', 'Spouse not dependent') }] }], run: ({ b, c, s }) => {
    const sit = (['unipersonal', 'conyugeACargo', 'conyugeNoACargo'] as const)[s] ?? 'unipersonal'; const pct = porcentajePorMeses(Math.round(c * 12), 2026);
    const MAX = PJ.pensionMaximaMensual; const p = Math.min(MAX, (b * pct) / 100); const min = PJ.minimasAnuales['65'][sit] / PJ.pagasAnuales; const comp = pct > 0 && p < min ? Math.min(min - p, PJ.pensionNoContributivaAnual / PJ.pagasAnuales) : 0;
    return { head: [T(l, 'Pensión al mes, 14 pagas', 'Pension per month, 14 payments'), eur(l, p + comp)], rows: [[T(l, 'Pensión contributiva', 'Contributory pension'), eur(l, p)], [T(l, 'Complemento a mínimos', 'Top-up to the minimum'), eur(l, comp)], [T(l, 'Mínima a los 65 años', 'Minimum at 65'), eur(l, min)], [T(l, 'Máxima 2026', 'Maximum 2026'), eur(l, MAX)]], note: pct === 0 ? T(l, 'Menos de 15 años: sin pensión contributiva.', 'Under 15 years: no contributory pension.') : T(l, 'El complemento exige ingresos propios bajos y residir en España.', 'The top-up requires low other income and residence in Spain.') };
  } }),
  autonomos: (l) => ({ title: T(l, 'Tu cuota de autónomo en 2026', 'Your self-employed contribution in 2026'), cta: T(l, 'Calculadora completa', 'Full calculator'), inputs: [{ id: 'i', label: T(l, 'Rendimientos netos al mes', 'Net earnings per month'), def: 1500, unit: '€', max: 100000 }], run: ({ i }) => {
    const c = calcularCuotaAutonomo(i, retaTramos2026); return { head: [T(l, 'Cuota mensual', 'Monthly contribution'), eur(l, c)], rows: [[T(l, 'Al año', 'Per year'), eur(l, c * 12)], [T(l, 'Porcentaje de tus rendimientos', 'Share of your earnings'), pct(l, i ? c / i : 0)]] };
  } }),
  ahorro: (l) => ({ title: T(l, 'Cuánto ahorrarás para la jubilación', 'How much you will save for retirement'), cta: T(l, 'Calculadora completa', 'Full calculator'), inputs: [{ id: 'm', label: T(l, 'Ahorro al mes', 'Saving per month'), def: 200, unit: '€', max: 100000 }, { id: 'r', label: T(l, 'Rentabilidad anual', 'Annual return'), def: 4, unit: '%', max: 20, decimals: 1 }, { id: 'y', label: T(l, 'Años hasta la jubilación', 'Years until retirement'), def: 25, unit: T(l, 'años', 'yrs'), max: 50 }], run: ({ m, r, y }) => {
    const p = calcularPlanAhorro(m, r / 100, y); return { head: [T(l, 'Capital al jubilarte', 'Capital at retirement'), eur(l, p.capitalFinal)], rows: [[T(l, 'Total aportado', 'Total paid in'), eur(l, p.totalAportado)], [T(l, 'Intereses generados', 'Interest earned'), eur(l, p.interesesGenerados)]] };
  } }),
};

export function getSpec(kind: string, lang = 'es'): MiniSpec {
  const s = SPECS[kind]; if (!s) throw new Error(`Mini-simulador desconocido: ${kind}`); return s(lang === 'en' ? 'en' : 'es');
}
