import { useState, useMemo } from 'react';
import { calcularImpactoInflacion } from '../../lib/finanz-engine';
import { formatEuros, formatPercent } from '../../lib/format-es';
import CampoEntrada from '../ui/CampoEntrada';

export default function Inflacion() {
  const [cantidad, setCantidad] = useState('10000');
  const [inflacion, setInflacion] = useState('3');
  const [anios, setAnios] = useState('10');

  const cantidadNum = Number(cantidad) || 0;
  const inflacionNum = Number(inflacion) || 0;
  const aniosNum = Math.max(1, Math.round(Number(anios) || 0));

  const resultado = useMemo(() => calcularImpactoInflacion(cantidadNum, inflacionNum / 100, aniosNum), [cantidadNum, inflacionNum, aniosNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoEntrada id="inf-cantidad" label="Cantidad actual" value={cantidad} onChange={setCantidad} min={0} max={10000000} step={100} suffix="€" helpText="Cantidad de dinero hoy" />
        <CampoEntrada id="inf-inflacion" label="Inflación anual" value={inflacion} onChange={setInflacion} min={0} max={50} step={0.1} suffix="%" helpText="Tasa de inflación anual media" />
        <CampoEntrada id="inf-anios" label="Años" value={anios} onChange={setAnios} min={1} max={60} step={1} suffix="años" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-6 text-center dark:from-red-900/30 dark:to-red-900/10">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Valor real en {aniosNum} años</p>
          <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{formatEuros(resultado.valorReal)}</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">Pérdida: {formatEuros(resultado.perdidaPoder)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Para mantener tu poder adquisitivo</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{formatEuros(resultado.equivalenteActual)}</p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">necesitarás en {aniosNum} años</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Cantidad hoy</td><td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(cantidadNum)}</td></tr>
            <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Poder adquisitivo equivalente en {aniosNum} años</td><td className="px-4 py-2 text-right tabular-nums font-medium text-red-600">{formatEuros(resultado.valorReal)}</td></tr>
            <tr className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Pérdida acumulada</td><td className="px-4 py-2 text-right tabular-nums font-medium text-red-600">{formatPercent(resultado.perdidaPoder / cantidadNum)}</td></tr>
            <tr><td className="px-4 py-2 text-gray-600 dark:text-gray-300">Inflación total acumulada</td><td className="px-4 py-2 text-right tabular-nums font-medium">{formatPercent((resultado.equivalenteActual - cantidadNum) / cantidadNum)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
