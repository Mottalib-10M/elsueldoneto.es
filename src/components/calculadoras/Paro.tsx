import { useState, useMemo } from 'react';
import { calcularParo } from '../../lib/finanz-engine';
import { formatEuros } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

export default function Paro() {
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
        <CampoEntrada id="pa-base" label="Base cotización mensual" value={baseCotizacion} onChange={setBaseCotizacion} min={0} max={10000} step={100} suffix="€/mes" helpText="Media últimos 180 días" />
        <CampoEntrada id="pa-anios" label="Años cotizados" value={aniosCotizados} onChange={setAniosCotizados} min={1} max={30} step={0.5} suffix="años" helpText="En los últimos 6 años" />
        <CampoEntrada id="pa-hijos" label="Hijos a cargo" value={hijos} onChange={setHijos} min={0} max={10} step={1} suffix="hijos" />
      </div>

      {diasCotizados < 360 ? (
        <div className="rounded-xl bg-red-50 p-6 text-center dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Se necesita un mínimo de 360 días cotizados (1 año) para acceder a la prestación contributiva por desempleo.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Prestación primeros 6 meses</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.prestacionMensual180)}/mes</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">70% de la base reguladora</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Prestación a partir del mes 7</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.prestacionMensualResto)}/mes</p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">50% de la base reguladora</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Duración de la prestación</p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{resultado.duracionMeses.toFixed(0)} meses</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Base reguladora mensual</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.baseReguladora)}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Tope máximo mensual</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.topeMaximo)}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Tope mínimo mensual</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.topeMinimo)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Días cotizados</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{diasCotizados} días</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-medium-gray">
        Cálculo orientativo de la prestación contributiva por desempleo. Los topes se basan en el IPREM vigente.
        La duración depende de los días cotizados en los últimos 6 años.
      </p>
    </div>
  );
}
