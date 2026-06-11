import { useState, useMemo } from 'react';
import { calcularBrutoDesdeNeto, calcularSueldoNeto, situacionFamiliarDefecto, type SituacionFamiliar } from '../../lib/irpf-engine';
import type { CCAACodigo } from '../../data/comunidades-autonomas';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';
import PanelResultado from '../ui/PanelResultado';

export default function SalarioBruto({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [netoDeseado, setNetoDeseado] = useState('24000');
  const [ccaa, setCCAA] = useState<CCAACodigo>('MD');
  const [pagas, setPagas] = useState<12 | 14>(14);

  const netoNum = Number(netoDeseado) || 0;

  const resultado = useMemo(() => {
    if (netoNum <= 0) return null;
    const brutoNecesario = calcularBrutoDesdeNeto(netoNum, ccaa, situacionFamiliarDefecto, pagas);
    const desglose = calcularSueldoNeto(brutoNecesario, ccaa, situacionFamiliarDefecto, pagas);
    return { brutoNecesario, desglose };
  }, [netoNum, ccaa, pagas]);

  return (
    <div className="space-y-6">
      <CampoSalario id="sb-neto" label={l ? 'Desired net' : 'Neto deseado'} value={netoDeseado} onChange={setNetoDeseado} min={0} max={500000} step={500} divisor={pagas} lang={lang} />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectorCCAA value={ccaa} onChange={setCCAA} lang={lang} />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{l ? 'Number of payments' : 'Número de pagas'}</label>
          <div>
            <div className="flex gap-2">
              {([14, 12] as const).map(p => (
                <button key={p} onClick={() => setPagas(p)} className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${pagas === p ? 'border-brand bg-brand/10 text-brand' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}>{p} {l ? 'payments' : 'pagas'}</button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>
      </div>

      {resultado && (
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'You need an annual gross of' : 'Necesitas un bruto anual de'}</p>
            <p className="mt-1 text-4xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.brutoNecesario)}</p>
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">{l ? `to earn ${formatEuros(netoNum)} net per year` : `para cobrar ${formatEuros(netoNum)} netos al año`}</p>
          </div>
          <PanelResultado resultado={resultado.desglose} lang={lang} />
        </div>
      )}
    </div>
  );
}
