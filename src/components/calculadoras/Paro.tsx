import { useState, useMemo } from 'react';
import { calcularParo } from '../../lib/finanz-engine';
import { formatEuros } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

interface ParoProps {
  lang?: 'es' | 'en';
}

export default function Paro({ lang = 'es' }: ParoProps) {
  const l = lang === 'en';
  const [baseCotizacion, setBaseCotizacion] = useState('2000');
  const [aniosCotizados, setAniosCotizados] = useState('4');
  const [hijos, setHijos] = useState('0');

  const baseNum = Number(baseCotizacion) || 0;
  const aniosNum = Math.max(0, Number(aniosCotizados) || 0);
  const hijosNum = Math.max(0, Math.round(Number(hijos) || 0));
  const diasCotizados = Math.round(aniosNum * 365);

  const resultado = useMemo(
    () => calcularParo(baseNum, diasCotizados, hijosNum),
    [baseNum, diasCotizados, hijosNum]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoEntrada id="pa-base" label={l ? 'Monthly contribution base' : 'Base cotización mensual'} value={baseCotizacion} onChange={setBaseCotizacion} min={0} max={10000} step={100} suffix={l ? '€/mo' : '€/mes'} helpText={l ? 'Average of last 180 days' : 'Media últimos 180 días'} />
        <CampoEntrada id="pa-anios" label={l ? 'Years contributed' : 'Años cotizados'} value={aniosCotizados} onChange={setAniosCotizados} min={1} max={30} step={0.5} suffix={l ? 'years' : 'años'} helpText={l ? 'In the last 6 years' : 'En los últimos 6 años'} />
        <CampoEntrada id="pa-hijos" label={l ? 'Dependent children' : 'Hijos a cargo'} value={hijos} onChange={setHijos} min={0} max={10} step={1} suffix={l ? 'children' : 'hijos'} />
      </div>

      {diasCotizados < 360 ? (
        <div className="rounded-xl bg-red-50 p-6 text-center dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {l
              ? 'A minimum of 360 contributed days (1 year) is required to access contributory unemployment benefits.'
              : 'Se necesita un mínimo de 360 días cotizados (1 año) para acceder a la prestación contributiva por desempleo.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{l ? 'Benefit for the first 6 months' : 'Prestación primeros 6 meses'}</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.prestacionMensual180)}/{l ? 'mo' : 'mes'}</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{l ? '70% of the regulatory base' : '70% de la base reguladora'}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'Benefit from month 7 onwards' : 'Prestación a partir del mes 7'}</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.prestacionMensualResto)}/{l ? 'mo' : 'mes'}</p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{l ? '50% of the regulatory base' : '50% de la base reguladora'}</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{l ? 'Benefit duration' : 'Duración de la prestación'}</p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{resultado.duracionMeses.toFixed(0)} {l ? 'months' : 'meses'}</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Monthly regulatory base' : 'Base reguladora mensual'}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.baseReguladora)}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Monthly maximum cap' : 'Tope máximo mensual'}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.topeMaximo)}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Monthly minimum cap' : 'Tope mínimo mensual'}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.topeMinimo)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Days contributed' : 'Días cotizados'}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{diasCotizados} {l ? 'days' : 'días'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-medium-gray">
        {l
          ? 'Approximate calculation of contributory unemployment benefits. Caps are based on the current IPREM. Duration depends on the days contributed in the last 6 years.'
          : 'Cálculo orientativo de la prestación contributiva por desempleo. Los topes se basan en el IPREM vigente. La duración depende de los días cotizados en los últimos 6 años.'}
      </p>
    </div>
  );
}
