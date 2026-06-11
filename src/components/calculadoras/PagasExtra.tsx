import { useState, useMemo } from 'react';
import { calcularSueldoNeto, situacionFamiliarDefecto } from '../../lib/irpf-engine';
import type { CCAACodigo } from '../../data/comunidades-autonomas';
import { formatEuros } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';

interface PagasExtraProps {
  lang?: 'es' | 'en';
}

export default function PagasExtra({ lang = 'es' }: PagasExtraProps) {
  const l = lang === 'en';
  const [brutoAnual, setBrutoAnual] = useState('30000');
  const [ccaa, setCCAA] = useState<CCAACodigo>('MD');

  const brutoNum = Number(brutoAnual) || 0;

  const resultado = useMemo(() => {
    const con12 = calcularSueldoNeto(brutoNum, ccaa, situacionFamiliarDefecto, 12);
    const con14 = calcularSueldoNeto(brutoNum, ccaa, situacionFamiliarDefecto, 14);
    return { con12, con14 };
  }, [brutoNum, ccaa]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSalario id="pe-bruto" label={l ? 'Gross salary' : 'Salario bruto'} value={brutoAnual} onChange={setBrutoAnual} min={0} max={1000000} step={500} lang={lang} />
        <SelectorCCAA value={ccaa} onChange={setCCAA} lang={lang} />
      </div>

      {brutoNum > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-blue-200 p-6 text-center dark:border-blue-700">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? '12 payments' : '12 pagas'}</p>
            <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.con12.netoMensual)}</p>
            <p className="text-sm text-gray-500">{l ? 'each month' : 'cada mes'}</p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{l ? 'Annual net' : 'Neto anual'}: {formatEuros(resultado.con12.netoAnual)}</p>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 p-6 text-center dark:border-emerald-700">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{l ? '14 payments' : '14 pagas'}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.con14.netoMensual)}</p>
            <p className="text-sm text-gray-500">{l ? 'each month (x 14)' : 'cada mes (× 14)'}</p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{l ? 'Annual net' : 'Neto anual'}: {formatEuros(resultado.con14.netoAnual)}</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{l ? '+ 2 extra payments of' : '+ 2 pagas extra de'} {formatEuros(resultado.con14.netoMensual)}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        <p className="font-medium">{l ? 'The annual net amount is identical in both cases.' : 'El neto anual es idéntico en ambos casos.'}</p>
        <p className="mt-1">{l ? 'The difference is in how it is distributed: with 14 payments you receive 12 regular payslips plus 2 extra payments (usually in June and December). With 12 payments, everything is distributed monthly.' : 'La diferencia está en cómo se distribuye: con 14 pagas recibes 12 nóminas ordinarias más 2 pagas extraordinarias (normalmente en junio y diciembre). Con 12 pagas, todo se distribuye mensualmente.'}</p>
      </div>
    </div>
  );
}
