import { useState, useMemo } from 'react';
import { calcularFiniquito } from '../../lib/finanz-engine';
import { formatEuros } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

type TipoDespido = 'voluntario' | 'improcedente' | 'objetivo' | 'fin-contrato';

export default function Finiquito({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [salario, setSalario] = useState('2000');
  const [diasTrabajados, setDiasTrabajados] = useState('15');
  const [pagasExtra, setPagasExtra] = useState<0 | 2>(2);
  const [mesesPaga, setMesesPaga] = useState('3');
  const [diasVacaciones, setDiasVacaciones] = useState('5');
  const [antiguedad, setAntiguedad] = useState('3');
  const [tipoDespido, setTipoDespido] = useState<TipoDespido>('voluntario');

  const salarioNum = Number(salario) || 0;
  const diasNum = Math.max(0, Math.min(30, Number(diasTrabajados) || 0));
  const mesesPagaNum = Math.max(0, Math.min(6, Number(mesesPaga) || 0));
  const diasVacNum = Math.max(0, Math.min(30, Number(diasVacaciones) || 0));
  const antiguedadNum = Math.max(0, Number(antiguedad) || 0);

  const resultado = useMemo(
    () => calcularFiniquito(salarioNum, diasNum, pagasExtra, mesesPagaNum, diasVacNum, antiguedadNum, tipoDespido),
    [salarioNum, diasNum, pagasExtra, mesesPagaNum, diasVacNum, antiguedadNum, tipoDespido]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoEntrada id="fq-salario" label={l ? 'Monthly gross salary' : 'Salario bruto mensual'} value={salario} onChange={setSalario} min={0} max={50000} step={100} suffix={l ? '€/month' : '€/mes'} />
        <CampoEntrada id="fq-dias" label={l ? 'Days worked (last month)' : 'Días trabajados (último mes)'} value={diasTrabajados} onChange={setDiasTrabajados} min={0} max={30} step={1} suffix={l ? 'days' : 'días'} />
        <CampoEntrada id="fq-vacaciones" label={l ? 'Pending holiday days' : 'Días vacaciones pendientes'} value={diasVacaciones} onChange={setDiasVacaciones} min={0} max={30} step={1} suffix={l ? 'days' : 'días'} />
        <CampoEntrada id="fq-antiguedad" label={l ? 'Years at company' : 'Antigüedad en la empresa'} value={antiguedad} onChange={setAntiguedad} min={0} max={50} step={0.5} suffix={l ? 'years' : 'años'} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{l ? 'Extra payments' : 'Pagas extras'}</label>
          <select
            value={pagasExtra}
            onChange={e => setPagasExtra(Number(e.target.value) as 0 | 2)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value={2}>{l ? '2 extra payments (14 payments)' : '2 pagas extras (14 pagas)'}</option>
            <option value={0}>{l ? 'Prorated (12 payments)' : 'Prorrateadas (12 pagas)'}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{l ? 'Termination type' : 'Tipo de extinción'}</label>
          <select
            value={tipoDespido}
            onChange={e => setTipoDespido(e.target.value as TipoDespido)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="voluntario">{l ? 'Voluntary resignation' : 'Baja voluntaria'}</option>
            <option value="objetivo">{l ? 'Objective dismissal (20 d/year)' : 'Despido objetivo (20 d/año)'}</option>
            <option value="improcedente">{l ? 'Unfair dismissal (33 d/year)' : 'Despido improcedente (33 d/año)'}</option>
            <option value="fin-contrato">{l ? 'End of temporary contract (12 d/year)' : 'Fin de contrato temporal (12 d/año)'}</option>
          </select>
        </div>
      </div>

      {pagasExtra === 2 && (
        <CampoEntrada id="fq-meses-paga" label={l ? 'Months since last extra payment' : 'Meses desde última paga extra'} value={mesesPaga} onChange={setMesesPaga} min={0} max={6} step={1} suffix={l ? 'months' : 'meses'} helpText={l ? 'To calculate the proportional part' : 'Para calcular la parte proporcional'} />
      )}

      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{l ? 'Total gross severance' : 'Finiquito bruto total'}</p>
        <p className="mt-2 text-4xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.totalBruto)}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-2 text-left font-medium text-gray-500">{l ? 'Item' : 'Concepto'}</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">{l ? 'Amount' : 'Importe'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? `Pending salary (${diasNum} days)` : `Salario pendiente (${diasNum} días)`}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.salarioPendiente)}</td>
            </tr>
            {pagasExtra === 2 && (
              <tr className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Proportional extra payments' : 'Pagas extras proporcionales'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.pagasExtrasProporcionales)}</td>
              </tr>
            )}
            <tr className="border-t border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? `Pending holidays (${diasVacNum} days)` : `Vacaciones pendientes (${diasVacNum} días)`}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.vacacionesPendientes)}</td>
            </tr>
            {resultado.indemnizacion > 0 && (
              <tr className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Severance pay' : 'Indemnización'}</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600">{formatEuros(resultado.indemnizacion)}</td>
              </tr>
            )}
            <tr className="border-t-2 border-gray-300 dark:border-gray-600">
              <td className="px-4 py-2 font-bold text-charcoal dark:text-gray-100">{l ? 'Total gross' : 'Total bruto'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-400">{formatEuros(resultado.totalBruto)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-medium-gray">
        {l ? 'Unfair dismissal severance is exempt from income tax up to the legal limits. Consult a professional for your specific case.' : 'La indemnización por despido improcedente está exenta de IRPF hasta los límites legales. Consulta con un profesional para tu caso concreto.'}
      </p>
    </div>
  );
}
