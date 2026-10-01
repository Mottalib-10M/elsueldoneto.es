/** Mini-simuladores de las guías (RECETTE §9.3), en español e inglés, calculados con los motores del sitio. */
import { calcularSueldoNeto, calcularBeckham, situacionFamiliarDefecto } from './irpf-engine';
import { calcularFiniquito, calcularCuotaAutonomo, calcularPlanAhorro } from './finanz-engine';
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
  finiquito: (l) => ({ title: T(l, 'Calcula tu finiquito', 'Work out your severance'), cta: T(l, 'Calculadora de finiquito', 'Severance calculator'), inputs: [{ id: 's', label: T(l, 'Sueldo bruto mensual', 'Gross monthly salary'), def: 2000, unit: '€', max: 100000 }, { id: 'a', label: T(l, 'Años de antigüedad', 'Years of service'), def: 5, unit: T(l, 'años', 'yrs'), max: 50, decimals: 1 }, { id: 't', label: T(l, 'Tipo de despido', 'Type of dismissal'), def: 0, options: [{ value: '0', label: T(l, 'Improcedente (33 días)', 'Unfair (33 days)') }, { value: '1', label: T(l, 'Objetivo (20 días)', 'Objective (20 days)') }, { value: '2', label: T(l, 'Fin de contrato', 'End of contract') }, { value: '3', label: T(l, 'Baja voluntaria', 'Resignation') }] }], run: ({ s, a, t }) => {
    const tipo = (['improcedente', 'objetivo', 'fin-contrato', 'voluntario'] as const)[t] ?? 'improcedente'; const f = calcularFiniquito(s, 15, 2, 3, 5, a, tipo);
    return { head: [T(l, 'Indemnización', 'Severance pay'), eur(l, f.indemnizacion)], rows: [[T(l, 'Total del finiquito, bruto', 'Total final pay, gross'), eur(l, f.totalBruto)], [T(l, 'Vacaciones pendientes (5 días)', 'Unused holidays (5 days)'), eur(l, f.vacacionesPendientes)]] };
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
