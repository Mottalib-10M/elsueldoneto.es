import { useState, useMemo } from 'react';
import { calcularIRPF, calcularSeguridadSocialAnual, calcularMinimoPersonalFamiliar, calcularReduccionRendimientosTrabajo, situacionFamiliarDefecto, type SituacionFamiliar } from '../../lib/irpf-engine';
import { gastosDeduciblesTrabajo2026 } from '../../data/irpf-2026';
import type { CCAACodigo } from '../../data/comunidades-autonomas';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';
import SelectorSituacionFamiliar from '../ui/SelectorSituacionFamiliar';

export default function IRPF() {
  const [brutoAnual, setBrutoAnual] = useState('30000');
  const [ccaa, setCCAA] = useState<CCAACodigo>('MD');
  const [situacion, setSituacion] = useState<SituacionFamiliar>(situacionFamiliarDefecto);
  const [showFamiliar, setShowFamiliar] = useState(false);

  const brutoNum = Number(brutoAnual) || 0;

  const resultado = useMemo(() => {
    const ss = calcularSeguridadSocialAnual(brutoNum);
    const rendNetos = brutoNum - ss - gastosDeduciblesTrabajo2026.otros;
    const reduccion = calcularReduccionRendimientosTrabajo(rendNetos);
    const baseImponible = Math.max(0, rendNetos - reduccion);
    const minimo = calcularMinimoPersonalFamiliar(situacion);
    const irpf = calcularIRPF(brutoNum, ccaa, situacion);
    return { ss, rendNetos, reduccion, baseImponible, minimo, irpf };
  }, [brutoNum, ccaa, situacion]);

  return (
    <div className="space-y-6">
      <CampoSalario id="irpf-bruto" label="Salario bruto" value={brutoAnual} onChange={setBrutoAnual} min={0} max={1000000} step={100} />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectorCCAA value={ccaa} onChange={setCCAA} />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">&nbsp;</label>
          <div>
            <button onClick={() => setShowFamiliar(!showFamiliar)} className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300">
              <span>Situación familiar</span>
              <svg className={`h-4 w-4 transition-transform ${showFamiliar ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>
      </div>

      {showFamiliar && <SelectorSituacionFamiliar value={situacion} onChange={setSituacion} />}

      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center dark:from-gray-700 dark:to-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IRPF total anual</p>
          <p className="mt-1 text-4xl font-bold text-brand">{formatEuros(resultado.irpf.total)}</p>
          <p className="mt-1 text-sm text-gray-500">Tipo efectivo: {formatPercent(brutoNum > 0 ? resultado.irpf.total / brutoNum : 0)}</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Bruto anual</td><td className="px-4 py-2 text-right tabular-nums font-medium text-charcoal dark:text-gray-100">{formatEuros(brutoNum)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Seguridad Social</td><td className="px-4 py-2 text-right tabular-nums text-red-600">-{formatEuros(resultado.ss)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Gastos deducibles</td><td className="px-4 py-2 text-right tabular-nums text-red-600">-{formatEuros(gastosDeduciblesTrabajo2026.otros)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Reducción rendimientos</td><td className="px-4 py-2 text-right tabular-nums text-red-600">-{formatEuros(resultado.reduccion)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 font-medium text-charcoal dark:text-gray-100">Base imponible</td><td className="px-4 py-2 text-right tabular-nums font-medium text-charcoal dark:text-gray-100">{formatEuros(resultado.baseImponible)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Mínimo personal/familiar</td><td className="px-4 py-2 text-right tabular-nums text-charcoal dark:text-gray-100">{formatEuros(resultado.minimo)}</td></tr>
              {resultado.irpf.estatal > 0 && <>
                <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">IRPF estatal</td><td className="px-4 py-2 text-right tabular-nums text-red-600">{formatEuros(resultado.irpf.estatal)}</td></tr>
                <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">IRPF autonómico</td><td className="px-4 py-2 text-right tabular-nums text-red-600">{formatEuros(resultado.irpf.autonomico)}</td></tr>
              </>}
              {resultado.irpf.bonificacion > 0 && <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Bonificación Ceuta/Melilla</td><td className="px-4 py-2 text-right tabular-nums text-emerald-600">+{formatEuros(resultado.irpf.bonificacion)}</td></tr>}
              <tr className="bg-red-50 dark:bg-red-900/20"><td className="px-4 py-2 font-bold text-charcoal dark:text-gray-100">IRPF total</td><td className="px-4 py-2 text-right tabular-nums font-bold text-brand">{formatEuros(resultado.irpf.total)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
