import { useState, useMemo } from 'react';
import { calcularTarifaHora } from '../../lib/finanz-engine';
import { calcularSueldoNeto, situacionFamiliarDefecto } from '../../lib/irpf-engine';
import { formatEuros } from '../../lib/format-es';
import CampoSalario from '../ui/CampoSalario';
import CampoEntrada from '../ui/CampoEntrada';

export default function HoraTrabajada() {
  const [brutoAnual, setBrutoAnual] = useState('30000');
  const [horas, setHoras] = useState('40');
  const [vacaciones, setVacaciones] = useState('5');
  const [festivos, setFestivos] = useState('14');

  const brutoNum = Number(brutoAnual) || 0;
  const horasNum = Math.max(1, Number(horas) || 40);
  const vacNum = Math.max(0, Number(vacaciones) || 0);
  const festNum = Math.max(0, Number(festivos) || 0);

  const resultado = useMemo(() => {
    const tarifa = calcularTarifaHora(brutoNum, horasNum, vacNum, festNum);
    const neto = calcularSueldoNeto(brutoNum, 'MD', situacionFamiliarDefecto, 14);
    const tarifaNeta = calcularTarifaHora(neto.netoAnual * (14 / 12), horasNum, vacNum, festNum);

    return {
      ...tarifa,
      tarifaNeta: tarifaNeta.tarifaBruta,
      netoAnual: neto.netoAnual,
      brutoMensual: brutoNum / 14,
      netoMensual: neto.netoMensual,
    };
  }, [brutoNum, horasNum, vacNum, festNum]);

  return (
    <div className="space-y-6">
      <CampoSalario id="ht-bruto" label="Salario bruto" value={brutoAnual} onChange={setBrutoAnual} min={0} max={300000} step={1000} divisor={14} />

      <div className="grid gap-4 sm:grid-cols-3">
        <CampoEntrada id="ht-horas" label="Horas/semana" value={horas} onChange={setHoras} min={1} max={60} step={1} suffix="h/semana" />
        <CampoEntrada id="ht-vacaciones" label="Semanas vacaciones" value={vacaciones} onChange={setVacaciones} min={0} max={10} step={1} suffix="semanas" />
        <CampoEntrada id="ht-festivos" label="Días festivos/año" value={festivos} onChange={setFestivos} min={0} max={20} step={1} suffix="días" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Hora bruta</p>
          <p className="mt-1 text-4xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.tarifaBruta)}</p>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">/hora trabajada</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center dark:from-emerald-900/30 dark:to-emerald-900/10">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Hora neta (aprox.)</p>
          <p className="mt-1 text-4xl font-bold text-emerald-700 dark:text-emerald-300">{formatEuros(resultado.tarifaNeta)}</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">/hora trabajada (Madrid, soltero)</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Salario bruto anual</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(brutoNum)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Horas trabajadas al año</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium">{resultado.horasAnuales.toFixed(0)} h</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Tarifa hora bruta</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600">{formatEuros(resultado.tarifaBruta)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Tarifa hora neta (aprox.)</td>
              <td className="px-4 py-2 text-right tabular-nums font-medium text-emerald-600">{formatEuros(resultado.tarifaNeta)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Sueldo neto mensual (14 pagas)</td>
              <td className="px-4 py-2 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-400">{formatEuros(resultado.netoMensual)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
