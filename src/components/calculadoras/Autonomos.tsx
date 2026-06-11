import { useState, useMemo } from 'react';
import { calcularCuotaAutonomo } from '../../lib/finanz-engine';
import { calcularImpuestoProgresivo } from '../../lib/irpf-engine';
import { tramosEstatales2026 } from '../../data/irpf-2026';
import { getCCAAByCodigo, type CCAACodigo } from '../../data/comunidades-autonomas';
import { retaTramos2026 } from '../../data/seguridad-social-2026';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';

export default function Autonomos({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [ingresos, setIngresos] = useState('36000');
  const [gastos, setGastos] = useState('6000');
  const [ccaa, setCcaa] = useState<CCAACodigo>('MD');

  const ingresosNum = Number(ingresos) || 0;
  const gastosNum = Number(gastos) || 0;

  const resultado = useMemo(() => {
    const ingresosNetos = Math.max(0, ingresosNum - gastosNum);
    const ingresosNetosMensuales = ingresosNetos / 12;
    const cuotaMensual = calcularCuotaAutonomo(ingresosNetosMensuales, retaTramos2026);
    const cuotaAnual = cuotaMensual * 12;

    // Base imponible = ingresos - gastos - cuota autónomos
    const baseImponible = Math.max(0, ingresosNetos - cuotaAnual);

    const comunidad = getCCAAByCodigo(ccaa);
    let irpfAnual: number;

    if (comunidad.esForal) {
      irpfAnual = calcularImpuestoProgresivo(baseImponible, comunidad.tramos);
    } else {
      const estatal = calcularImpuestoProgresivo(baseImponible, tramosEstatales2026);
      const autonomico = calcularImpuestoProgresivo(baseImponible, comunidad.tramos);
      irpfAnual = estatal + autonomico;
    }

    const netoAnual = ingresosNetos - cuotaAnual - irpfAnual;

    return {
      ingresosNetos,
      cuotaMensual,
      cuotaAnual,
      baseImponible,
      irpfAnual,
      netoAnual,
      netoMensual: netoAnual / 12,
      tipoEfectivo: ingresosNetos > 0 ? irpfAnual / ingresosNetos : 0,
    };
  }, [ingresosNum, gastosNum, ccaa]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoSalario id="au-ingresos" label={l ? 'Gross income' : 'Ingresos brutos'} value={ingresos} onChange={setIngresos} min={0} max={500000} step={1000} lang={lang} />
        <CampoSalario id="au-gastos" label={l ? 'Deductible expenses' : 'Gastos deducibles'} value={gastos} onChange={setGastos} min={0} max={300000} step={500} lang={lang} />
        <SelectorCCAA value={ccaa} onChange={setCcaa} lang={lang} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{l ? 'Monthly net' : 'Neto mensual'}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.netoMensual)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{l ? 'Self-employed contribution/month' : 'Cuota autónomos/mes'}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{formatEuros(resultado.cuotaMensual)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-6 text-center dark:from-red-900/30 dark:to-red-900/10">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{l ? 'Annual IRPF' : 'IRPF anual'}</p>
          <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{formatEuros(resultado.irpfAnual)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Gross income' : 'Ingresos brutos'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(ingresosNum)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Deductible expenses' : 'Gastos deducibles'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-amber-600">- {formatEuros(gastosNum)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Net income' : 'Rendimiento neto'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.ingresosNetos)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Annual self-employed contribution (RETA)' : 'Cuota autónomos anual (RETA)'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-amber-600">- {formatEuros(resultado.cuotaAnual)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'IRPF taxable base' : 'Base imponible IRPF'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.baseImponible)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">IRPF</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-red-600">- {formatEuros(resultado.irpfAnual)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Effective IRPF rate' : 'Tipo efectivo IRPF'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatPercent(resultado.tipoEfectivo)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">{l ? 'Annual net' : 'Neto anual'}</td>
              <td className="px-4 py-2 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-400">{formatEuros(resultado.netoAnual)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
