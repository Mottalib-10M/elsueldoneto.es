import { useState, useMemo } from 'react';
import { calcularInteresCompuesto } from '../../lib/finanz-engine';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

export default function InteresCompuesto() {
  const [capitalInicial, setCapitalInicial] = useState('10000');
  const [tipoAnual, setTipoAnual] = useState('7');
  const [anios, setAnios] = useState('20');
  const [aportacionMensual, setAportacionMensual] = useState('200');

  const capitalNum = Number(capitalInicial) || 0;
  const tipoNum = Number(tipoAnual) || 0;
  const aniosNum = Math.max(1, Math.round(Number(anios) || 0));
  const aportacionNum = Number(aportacionMensual) || 0;

  const resultado = useMemo(() => calcularInteresCompuesto(capitalNum, tipoNum / 100, aniosNum, aportacionNum), [capitalNum, tipoNum, aniosNum, aportacionNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampoEntrada id="ic-capital" label="Capital inicial" value={capitalInicial} onChange={setCapitalInicial} min={0} max={10000000} step={100} suffix="€" />
        <CampoEntrada id="ic-tipo" label="Rentabilidad anual" value={tipoAnual} onChange={setTipoAnual} min={0} max={50} step={0.1} suffix="%" />
        <CampoEntrada id="ic-anios" label="Años" value={anios} onChange={setAnios} min={1} max={60} step={1} suffix="años" />
        <CampoEntrada id="ic-aportacion" label="Aportación mensual" value={aportacionMensual} onChange={setAportacionMensual} min={0} max={100000} step={50} suffix="€/mes" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Capital final</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.capitalFinal)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Capital invertido</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.capitalInvertido)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Intereses generados</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{formatEuros(resultado.interesesTotales)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Capital inicial</td><td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(capitalNum)}</td></tr>
            <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Total aportaciones ({aniosNum} años)</td><td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(aportacionNum * 12 * aniosNum)}</td></tr>
            <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Rentabilidad sobre invertido</td><td className="px-4 py-2 text-right tabular-nums font-medium">{resultado.capitalInvertido > 0 ? formatPercent(resultado.interesesTotales / resultado.capitalInvertido) : '-'}</td></tr>
            <tr><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Multiplicador</td><td className="px-4 py-2 text-right tabular-nums font-medium">{resultado.capitalInvertido > 0 ? `×${(resultado.capitalFinal / resultado.capitalInvertido).toFixed(2)}` : '-'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
