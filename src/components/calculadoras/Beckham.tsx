import { useState, useMemo } from 'react';
import { calcularBeckham, calcularSueldoNeto, situacionFamiliarDefecto, calcularSeguridadSocialAnual } from '../../lib/irpf-engine';
import type { CCAACodigo } from '../../data/comunidades-autonomas';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';

export default function Beckham() {
  const [brutoAnual, setBrutoAnual] = useState('80000');
  const [ccaa, setCCAA] = useState<CCAACodigo>('MD');

  const brutoNum = Number(brutoAnual) || 0;

  const resultado = useMemo(() => {
    const beckham = calcularBeckham(brutoNum);
    const normal = calcularSueldoNeto(brutoNum, ccaa, situacionFamiliarDefecto, 14);
    const ss = calcularSeguridadSocialAnual(brutoNum);
    const ahorro = normal.irpfTotalAnual - beckham.irpfAnual;
    return { beckham, normal, ss, ahorro };
  }, [brutoNum, ccaa]);

  const mereceLaPena = resultado.ahorro > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSalario id="beck-bruto" label="Salario bruto" value={brutoAnual} onChange={setBrutoAnual} min={0} max={2000000} step={1000} divisor={14} />
        <SelectorCCAA value={ccaa} onChange={setCCAA} id="beck-ccaa" />
      </div>

      {brutoNum > 0 && (
        <div className="space-y-4">
          <div className={`rounded-xl p-6 text-center ${mereceLaPena ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {mereceLaPena ? 'Beckham te ahorra' : 'Beckham te cuesta más'}
            </p>
            <p className={`mt-1 text-4xl font-bold ${mereceLaPena ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {formatEuros(Math.abs(resultado.ahorro))}/año
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {mereceLaPena ? `${formatEuros(Math.abs(resultado.ahorro) / 12)}/mes de ahorro` : 'El régimen general es más favorable'}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left font-medium text-gray-500"></th>
                  <th className="px-4 py-2 text-right font-medium text-brand">Beckham</th>
                  <th className="px-4 py-2 text-right font-medium text-blue-600 dark:text-blue-400">Régimen general</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">IRPF anual</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-brand">{formatEuros(resultado.beckham.irpfAnual)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">{formatEuros(resultado.normal.irpfTotalAnual)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Tipo efectivo IRPF</td>
                  <td className="px-4 py-2 text-right tabular-nums text-brand">{formatPercent(resultado.beckham.tipoEfectivo)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">{formatPercent(resultado.normal.tipoEfectivoIRPF)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Seguridad Social</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300" colSpan={2}>{formatEuros(resultado.ss)} (igual en ambos)</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Neto anual</td>
                  <td className="px-4 py-2 text-right tabular-nums font-bold text-brand">{formatEuros(resultado.beckham.netoAnual)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-bold text-blue-600 dark:text-blue-400">{formatEuros(resultado.normal.netoAnual)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Neto mensual (14 pagas)</td>
                  <td className="px-4 py-2 text-right tabular-nums font-bold text-brand">{formatEuros(resultado.beckham.netoAnual / 14)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-bold text-blue-600 dark:text-blue-400">{formatEuros(resultado.normal.netoMensual)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
