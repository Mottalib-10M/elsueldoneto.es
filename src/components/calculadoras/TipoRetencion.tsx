import { useState, useMemo } from 'react';
import { calcularSueldoNeto, situacionFamiliarDefecto } from '../../lib/irpf-engine';
import type { SituacionFamiliar } from '../../lib/irpf-engine';
import type { CCAACodigo } from '../../data/comunidades-autonomas';
import { formatPercent, formatEuros } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';
import SelectorSituacionFamiliar from '../ui/SelectorSituacionFamiliar';

interface TipoRetencionProps {
  lang?: 'es' | 'en';
}

export default function TipoRetencion({ lang = 'es' }: TipoRetencionProps) {
  const l = lang === 'en';
  const [bruto, setBruto] = useState('30000');
  const [ccaa, setCcaa] = useState<CCAACodigo>('MD');
  const [pagas, setPagas] = useState<12 | 14>(14);
  const [situacion, setSituacion] = useState<SituacionFamiliar>(situacionFamiliarDefecto);
  const [showFamilia, setShowFamilia] = useState(false);

  const brutoNum = Number(bruto) || 0;

  const resultado = useMemo(
    () => calcularSueldoNeto(brutoNum, ccaa, situacion, pagas),
    [brutoNum, ccaa, situacion, pagas]
  );

  const retencionPorcentaje = brutoNum > 0 ? (resultado.irpfTotalAnual / brutoNum) * 100 : 0;

  return (
    <div className="space-y-6">
      <CampoSalario id="tr-bruto" label={l ? 'Gross salary' : 'Salario bruto'} value={bruto} onChange={setBruto} min={0} max={300000} step={500} divisor={pagas} lang={lang} />

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectorCCAA value={ccaa} onChange={setCcaa} lang={lang} />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{l ? 'Payments' : 'Pagas'}</label>
          <div>
            <select
              value={pagas}
              onChange={e => setPagas(Number(e.target.value) as 12 | 14)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value={14}>{l ? '14 payments' : '14 pagas'}</option>
              <option value={12}>{l ? '12 payments' : '12 pagas'}</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">{' '}</p>
          </div>
        </div>
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">&nbsp;</label>
          <div>
            <button
              type="button"
              onClick={() => setShowFamilia(!showFamilia)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
            >
              <span>{l ? 'Family situation' : 'Situación familiar'}</span>
              <svg className={`h-4 w-4 transition-transform ${showFamilia ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <p className="mt-1 text-xs text-gray-500">{' '}</p>
          </div>
        </div>
      </div>

      {showFamilia && (
        <SelectorSituacionFamiliar value={situacion} onChange={setSituacion} lang={lang} />
      )}

      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 text-center dark:from-blue-900/30 dark:to-blue-900/10">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'Your IRPF withholding rate' : 'Tu tipo de retención IRPF'}</p>
        <p className="mt-2 text-5xl font-bold text-blue-700 dark:text-blue-300">{retencionPorcentaje.toFixed(2)} %</p>
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          {l ? 'Monthly withholding' : 'Retención mensual'}: {formatEuros(resultado.retencionMensual)}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Annual gross salary' : 'Salario bruto anual'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(brutoNum)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Annual IRPF' : 'IRPF anual'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-red-600">{formatEuros(resultado.irpfTotalAnual)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Effective IRPF rate' : 'Tipo efectivo IRPF'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-red-600">{formatPercent(resultado.tipoEfectivoIRPF)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Annual Social Security' : 'Seguridad Social anual'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-amber-600">{formatEuros(resultado.seguridadSocialAnual)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Total withholding (IRPF + SS)' : 'Retención total (IRPF + SS)'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatPercent(resultado.tipoEfectivoTotal)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">{l ? 'Monthly net salary' : 'Sueldo neto mensual'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-400">{formatEuros(resultado.netoMensual)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
