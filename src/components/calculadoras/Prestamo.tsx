import { useState, useMemo } from 'react';
import { calcularPrestamo } from '../../lib/finanz-engine';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

export default function Prestamo({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [capital, setCapital] = useState('15000');
  const [tin, setTin] = useState('6.5');
  const [plazo, setPlazo] = useState('60');

  const capitalNum = Number(capital) || 0;
  const tinNum = Number(tin) || 0;
  const plazoNum = Math.max(1, Math.round(Number(plazo) || 0));

  const resultado = useMemo(() => {
    if (capitalNum <= 0) return null;
    return calcularPrestamo(capitalNum, tinNum / 100, plazoNum);
  }, [capitalNum, tinNum, plazoNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoEntrada id="pr-capital" label={l ? 'Loan amount' : 'Capital del préstamo'} value={capital} onChange={setCapital} min={0} max={1000000} step={500} suffix="€" />
        <CampoEntrada id="pr-tin" label={l ? 'Annual interest rate' : 'TIN anual'} value={tin} onChange={setTin} min={0} max={50} step={0.1} suffix="%" helpText={l ? 'Nominal Interest Rate' : 'Tipo de Interés Nominal'} />
        <CampoEntrada id="pr-plazo" label={l ? 'Term' : 'Plazo'} value={plazo} onChange={setPlazo} min={1} max={600} step={1} suffix={l ? 'months' : 'meses'} />
      </div>

      {resultado && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'Monthly payment' : 'Cuota mensual'}</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.cuotaMensual)}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-6 text-center dark:from-red-900/30 dark:to-red-900/10">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{l ? 'Total interest' : 'Total intereses'}</p>
              <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{formatEuros(resultado.totalIntereses)}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center dark:from-gray-700 dark:to-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{l ? 'Total to repay' : 'Total a devolver'}</p>
              <p className="mt-1 text-2xl font-bold text-charcoal dark:text-gray-100">{formatEuros(resultado.totalPagado)}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-charcoal dark:text-gray-100">{l ? 'Amortization schedule' : 'Tabla de amortización'}</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-2 text-left font-medium text-gray-500">{l ? 'Month' : 'Mes'}</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">{l ? 'Payment' : 'Cuota'}</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">{l ? 'Principal' : 'Capital'}</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">{l ? 'Interest' : 'Intereses'}</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">{l ? 'Balance' : 'Pendiente'}</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.tablaAmortizacion.slice(0, 12).map(f => (
                    <tr key={f.mes} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-1 tabular-nums text-gray-600 dark:text-gray-300">{f.mes}</td>
                      <td className="px-3 py-1 text-right tabular-nums">{formatEuros(f.cuota)}</td>
                      <td className="px-3 py-1 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{formatEuros(f.capital)}</td>
                      <td className="px-3 py-1 text-right tabular-nums text-red-600 dark:text-red-400">{formatEuros(f.intereses)}</td>
                      <td className="px-3 py-1 text-right tabular-nums">{formatEuros(f.saldoPendiente)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {plazoNum > 12 && <p className="mt-2 text-xs text-gray-500">{l ? `Showing the first 12 of ${plazoNum} months.` : `Mostrando los primeros 12 de ${plazoNum} meses.`}</p>}
          </div>
        </>
      )}
    </div>
  );
}
