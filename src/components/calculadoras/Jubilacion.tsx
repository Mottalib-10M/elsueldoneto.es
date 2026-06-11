import { useState, useMemo } from 'react';
import CampoEntrada from '../ui/CampoEntrada';
import { formatEuros } from '../../lib/format-es';

/** Pensión máxima mensual 2025 */
const PENSION_MAXIMA = 3175.04;
/** Pensión mínima sin cónyuge a cargo */
const PENSION_MINIMA_SIN_CONYUGE = 783;
/** Pensión mínima con cónyuge a cargo */
const PENSION_MINIMA_CON_CONYUGE = 1033;
/** Años mínimos cotizados para acceder a pensión */
const ANIOS_MINIMOS = 15;

function calcularPorcentaje(aniosCotizados: number): number {
  if (aniosCotizados < ANIOS_MINIMOS) return 0;

  // Con exactamente 15 años: 50%
  let porcentaje = 50;
  const mesesExtra = Math.round((aniosCotizados - 15) * 12);

  if (mesesExtra <= 0) return porcentaje;

  // Del mes 1 al 120 (años 16 al 25): +0,21% por mes
  const mesesTramo1 = Math.min(mesesExtra, 120);
  porcentaje += mesesTramo1 * 0.21;

  // Del mes 121 al 258 (años 26 al 36,5): +0,19% por mes
  if (mesesExtra > 120) {
    const mesesTramo2 = Math.min(mesesExtra - 120, 138);
    porcentaje += mesesTramo2 * 0.19;
  }

  return Math.min(porcentaje, 100);
}

function calcularEdadJubilacion(aniosCotizadosTotales: number): number {
  // Regla 2026: con 38+ años cotizados jubilación a los 65, con menos a los 66 años y 8 meses (usamos 67)
  return aniosCotizadosTotales >= 38 ? 65 : 67;
}

export default function Jubilacion({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [edadActual, setEdadActual] = useState('40');
  const [aniosCotizados, setAniosCotizados] = useState('15');
  const [baseCotizacion, setBaseCotizacion] = useState('2500');
  const [aniosRestantes, setAniosRestantes] = useState('25');

  const edadNum = Math.max(18, Math.min(66, Math.round(Number(edadActual) || 0)));
  const aniosCotNum = Math.max(0, Math.min(50, Number(aniosCotizados) || 0));
  const baseNum = Math.max(0, Math.min(4720, Number(baseCotizacion) || 0));
  const restantesNum = Math.max(0, Number(aniosRestantes) || 0);

  const resultado = useMemo(() => {
    const totalAniosCotizados = aniosCotNum + restantesNum;
    const edadJubilacion = calcularEdadJubilacion(totalAniosCotizados);
    const porcentaje = calcularPorcentaje(totalAniosCotizados);

    // Base reguladora = base de cotización media mensual (simplificación)
    const baseReguladora = baseNum;

    // Pensión mensual bruta
    let pensionMensual = baseReguladora * (porcentaje / 100);

    // Aplicar topes
    pensionMensual = Math.min(pensionMensual, PENSION_MAXIMA);
    if (totalAniosCotizados >= ANIOS_MINIMOS && pensionMensual < PENSION_MINIMA_SIN_CONYUGE) {
      pensionMensual = PENSION_MINIMA_SIN_CONYUGE;
    }

    const pensionAnual = pensionMensual * 14; // 14 pagas
    const gapMensual = baseNum - pensionMensual;
    const tasaSustitucion = baseNum > 0 ? (pensionMensual / baseNum) * 100 : 0;

    return {
      totalAniosCotizados,
      edadJubilacion,
      porcentaje,
      baseReguladora,
      pensionMensual,
      pensionAnual,
      gapMensual,
      tasaSustitucion,
      cumpleMinimo: totalAniosCotizados >= ANIOS_MINIMOS,
    };
  }, [edadNum, aniosCotNum, baseNum, restantesNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampoEntrada
          id="jub-edad"
          label={l ? 'Current age' : 'Edad actual'}
          value={edadActual}
          onChange={setEdadActual}
          min={18}
          max={66}
          step={1}
          suffix={l ? 'years' : 'años'}
        />
        <CampoEntrada
          id="jub-cotizados"
          label={l ? 'Years of contributions' : 'Años cotizados'}
          value={aniosCotizados}
          onChange={setAniosCotizados}
          min={0}
          max={50}
          step={1}
          suffix={l ? 'years' : 'años'}
        />
        <CampoEntrada
          id="jub-base"
          label={l ? 'Average monthly contribution base' : 'Base de cotización media mensual'}
          value={baseCotizacion}
          onChange={setBaseCotizacion}
          min={0}
          max={4720}
          step={50}
          suffix={l ? '€/mo' : '€/mes'}
          helpText={l ? 'Average of your latest contribution bases' : 'Promedio de tus últimas bases'}
        />
        <CampoEntrada
          id="jub-restantes"
          label={l ? 'Years you plan to keep contributing' : 'Años que prevés seguir cotizando'}
          value={aniosRestantes}
          onChange={setAniosRestantes}
          min={0}
          max={50}
          step={1}
          suffix={l ? 'years' : 'años'}
        />
      </div>

      {!resultado.cumpleMinimo && (
        <div className="rounded-xl bg-red-50 p-6 text-center dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {l
              ? `With ${resultado.totalAniosCotizados.toFixed(0)} years of contributions, the minimum of 15 years required to access a contributory retirement pension is not reached.`
              : `Con ${resultado.totalAniosCotizados.toFixed(0)} años cotizados no se alcanza el mínimo de 15 años necesarios para acceder a una pensión contributiva de jubilación.`}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'Estimated monthly pension' : 'Pensión mensual estimada'}</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
            {resultado.cumpleMinimo ? formatEuros(resultado.pensionMensual) : '0,00 €'}
          </p>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            {resultado.cumpleMinimo
              ? (l ? `${formatEuros(resultado.pensionAnual)}/year (14 payments)` : `${formatEuros(resultado.pensionAnual)}/año (14 pagas)`)
              : (l ? 'Minimum 15 years of contributions' : 'Mínimo 15 años cotizados')}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{l ? 'Regulatory base percentage' : 'Porcentaje de base reguladora'}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {resultado.porcentaje.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            {l ? 'Maximum 100% with 36.5 years' : 'Máximo 100% con 36,5 años'}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{l ? 'Estimated retirement age' : 'Edad estimada de jubilación'}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {resultado.edadJubilacion} {l ? 'years' : 'años'}
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            {resultado.totalAniosCotizados >= 38
              ? (l ? '38+ years contributed: retirement at 65' : '38+ años cotizados: jubilación a los 65')
              : (l ? 'Less than 38 years contributed' : 'Menos de 38 años cotizados')}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center dark:from-purple-900/30 dark:to-purple-900/10">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{l ? 'Total years contributed' : 'Años cotizados totales'}</p>
          <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">
            {resultado.totalAniosCotizados.toFixed(0)} {l ? 'years' : 'años'}
          </p>
          <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
            {l ? `${aniosCotNum} current + ${restantesNum} future` : `${aniosCotNum} actuales + ${restantesNum} futuros`}
          </p>
        </div>
      </div>

      {resultado.cumpleMinimo && (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Monthly regulatory base' : 'Base reguladora mensual'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.baseReguladora)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Replacement rate' : 'Tasa de sustitución'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{resultado.tasaSustitucion.toFixed(2)}%</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Difference from last salary' : 'Diferencia con último salario'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium text-red-600 dark:text-red-400">
                  {resultado.gapMensual > 0 ? `-${formatEuros(resultado.gapMensual)}/${l ? 'mo' : 'mes'}` : formatEuros(0) + `/${l ? 'mo' : 'mes'}`}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Maximum pension 2025' : 'Pensión máxima 2025'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(PENSION_MAXIMA)}/{l ? 'mo' : 'mes'}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Minimum pension (no dependent spouse)' : 'Pensión mínima (sin cónyuge)'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(PENSION_MINIMA_SIN_CONYUGE)}/{l ? 'mo' : 'mes'}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Minimum pension (with dependent spouse)' : 'Pensión mínima (con cónyuge a cargo)'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(PENSION_MINIMA_CON_CONYUGE)}/{l ? 'mo' : 'mes'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-medium-gray">
        {l
          ? 'Approximate calculation based on current regulations (LGSS). The actual regulatory base is calculated using the last 300 monthly payments (25 years) adjusted for CPI. Consult Social Security for a personalized calculation.'
          : 'Cálculo orientativo basado en la normativa vigente (LGSS). La base reguladora real se calcula con las últimas 300 mensualidades (25 años) actualizadas por IPC. Consulta la Seguridad Social para un cálculo personalizado.'}
      </p>
    </div>
  );
}
