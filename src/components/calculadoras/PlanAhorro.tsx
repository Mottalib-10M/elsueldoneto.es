import { useState, useMemo } from 'react';
import { calcularPlanAhorro } from '../../lib/finanz-engine';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

export default function PlanAhorro({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [aportacion, setAportacion] = useState('300');
  const [tipo, setTipo] = useState('5');
  const [anios, setAnios] = useState('15');
  const [capitalInicial, setCapitalInicial] = useState('5000');

  const aportNum = Number(aportacion) || 0;
  const tipoNum = Number(tipo) || 0;
  const aniosNum = Math.max(1, Math.round(Number(anios) || 0));
  const capitalNum = Number(capitalInicial) || 0;

  const resultado = useMemo(() => calcularPlanAhorro(aportNum, tipoNum / 100, aniosNum, capitalNum), [aportNum, tipoNum, aniosNum, capitalNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampoEntrada id="pa-aportacion" label={l ? 'Monthly contribution' : 'Aportación mensual'} value={aportacion} onChange={setAportacion} min={0} max={100000} step={50} suffix={l ? '€/mo' : '€/mes'} />
        <CampoEntrada id="pa-tipo" label={l ? 'Annual return' : 'Rentabilidad anual'} value={tipo} onChange={setTipo} min={0} max={30} step={0.1} suffix="%" />
        <CampoEntrada id="pa-anios" label={l ? 'Years' : 'Años'} value={anios} onChange={setAnios} min={1} max={60} step={1} suffix={l ? 'years' : 'años'} />
        <CampoEntrada id="pa-capital" label={l ? 'Initial capital' : 'Capital inicial'} value={capitalInicial} onChange={setCapitalInicial} min={0} max={10000000} step={100} suffix="€" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{l ? 'Final capital' : 'Capital final'}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.capitalFinal)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'Total contributed' : 'Total aportado'}</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.totalAportado)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{l ? 'Interest earned' : 'Intereses generados'}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{formatEuros(resultado.interesesGenerados)}</p>
        </div>
      </div>

      {resultado.evolucion.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-2 text-left font-medium text-gray-500">{l ? 'Year' : 'Año'}</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">{l ? 'Capital' : 'Capital'}</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">{l ? 'Contributed' : 'Aportado'}</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">{l ? 'Interest' : 'Intereses'}</th>
              </tr>
            </thead>
            <tbody>
              {resultado.evolucion.map(p => (
                <tr key={p.mes} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-1 tabular-nums text-gray-600 dark:text-gray-300">{p.mes / 12}</td>
                  <td className="px-4 py-1 text-right tabular-nums font-medium text-emerald-700 dark:text-emerald-400">{formatEuros(p.capital)}</td>
                  <td className="px-4 py-1 text-right tabular-nums text-blue-600 dark:text-blue-400">{formatEuros(p.aportado)}</td>
                  <td className="px-4 py-1 text-right tabular-nums text-amber-600 dark:text-amber-400">{formatEuros(p.capital - p.aportado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
