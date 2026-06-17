import { useState, useMemo } from 'react';
import { calcularSueldoNeto, situacionFamiliarDefecto, type SituacionFamiliar, type DesgloseSueldo } from '../../lib/irpf-engine';
import { comunidadesAutonomas, type CCAACodigo } from '../../data/comunidades-autonomas';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';

interface ComparadorComunidadesProps {
  lang?: 'es' | 'en';
}

export default function ComparadorComunidades({ lang = 'es' }: ComparadorComunidadesProps) {
  const l = lang === 'en';
  const [brutoAnual, setBrutoAnual] = useState('30000');
  const [pagas, setPagas] = useState<12 | 14>(14);

  const brutoNum = Number(brutoAnual) || 0;

  const resultados = useMemo(() => {
    return comunidadesAutonomas
      .map(ccaa => ({
        ccaa,
        desglose: calcularSueldoNeto(brutoNum, ccaa.codigo, situacionFamiliarDefecto, pagas),
      }))
      .sort((a, b) => b.desglose.netoAnual - a.desglose.netoAnual);
  }, [brutoNum, pagas]);

  const maxNeto = resultados[0]?.desglose.netoAnual ?? 0;
  const minNeto = resultados[resultados.length - 1]?.desglose.netoAnual ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSalario id="comp-bruto" label={l ? 'Gross salary' : 'Salario bruto'} value={brutoAnual} onChange={setBrutoAnual} min={0} max={1000000} step={1000} divisor={pagas} lang={lang} />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{l ? 'Number of payments' : 'Número de pagas'}</label>
          <div>
            <div className="flex gap-2">
              {([14, 12] as const).map(p => (
                <button key={p} onClick={() => setPagas(p)} className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${pagas === p ? 'border-brand bg-brand/10 text-brand' : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'}`}>{p} {l ? 'payments' : 'pagas'}</button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{' '}</p>
          </div>
        </div>
      </div>

      {brutoNum > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{l ? 'Highest net' : 'Mayor neto'}</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{resultados[0]?.ccaa.nombreCorto}</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(maxNeto / pagas)}/{l ? 'mo' : 'mes'}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{l ? 'Lowest net' : 'Menor neto'}</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{resultados[resultados.length - 1]?.ccaa.nombreCorto}</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatEuros(minNeto / pagas)}/{l ? 'mo' : 'mes'}</p>
              <p className="text-sm text-red-600 dark:text-red-400">{l ? 'Difference' : 'Diferencia'}: {formatEuros((maxNeto - minNeto) / 12)}/{l ? 'mo' : 'mes'}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">#</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">{l ? 'Region' : 'Comunidad'}</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">{l ? 'Net/mo' : 'Neto/mes'}</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">{l ? 'Net/year' : 'Neto/año'}</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">IRPF</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">{l ? 'Eff. rate' : 'Tipo ef.'}</th>
                  <th className="hidden px-4 py-2 md:table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {resultados.map(({ ccaa, desglose }, i) => (
                  <tr key={ccaa.codigo} className={`border-t border-gray-100 dark:border-gray-700 ${i === 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''} ${i === resultados.length - 1 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-2 tabular-nums text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-charcoal dark:text-gray-100">
                      {ccaa.nombreCorto}
                      {ccaa.esForal && <span className="ml-1 text-xs text-gray-400">(foral)</span>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-charcoal dark:text-gray-100">{formatEuros(desglose.netoMensual)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-charcoal dark:text-gray-100">{formatEuros(desglose.netoAnual)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-red-600 dark:text-red-400">{formatEuros(desglose.irpfTotalAnual)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">{formatPercent(desglose.tipoEfectivoTotal)}</td>
                    <td className="hidden px-4 py-2 md:table-cell">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${maxNeto > 0 ? (desglose.netoAnual / maxNeto) * 100 : 0}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
