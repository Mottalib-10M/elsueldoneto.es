import { useState, useMemo } from 'react';
import CampoEntrada from '../ui/CampoEntrada';
import { formatEuros, formatPercent } from '../../lib/format-es';

type TipoHipoteca = 'fija' | 'variable';

function calcularCuotaMensual(capital: number, tasaAnual: number, plazoAnios: number): number {
  if (capital <= 0 || plazoAnios <= 0) return 0;
  if (tasaAnual <= 0) return capital / (plazoAnios * 12);
  const r = tasaAnual / 100 / 12;
  const n = plazoAnios * 12;
  return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

interface HipotecaProps {
  lang?: 'es' | 'en';
}

export default function Hipoteca({ lang = 'es' }: HipotecaProps) {
  const l = lang === 'en';
  const [precio, setPrecio] = useState('250000');
  const [ahorro, setAhorro] = useState('50000');
  const [plazo, setPlazo] = useState('25');
  const [interes, setInteres] = useState('3.0');
  const [tipo, setTipo] = useState<TipoHipoteca>('fija');

  const precioNum = Number(precio) || 0;
  const ahorroNum = Number(ahorro) || 0;
  const plazoNum = Math.max(5, Math.min(40, Math.round(Number(plazo) || 25)));
  const interesNum = Number(interes) || 0;

  const resultado = useMemo(() => {
    const capital = Math.max(0, precioNum - ahorroNum);
    if (capital <= 0 || precioNum <= 0) return null;

    const n = plazoNum * 12;
    const cuotaMensual = calcularCuotaMensual(capital, interesNum, plazoNum);
    const totalPagado = cuotaMensual * n;
    const totalIntereses = totalPagado - capital;
    const porcentajeFinanciado = (capital / precioNum) * 100;

    // Gastos estimados de compra (segunda mano: ITP 8%)
    const itp = precioNum * 0.08;
    const notaria = 800;
    const registro = 400;
    const gestoria = 400;
    const gastosCompra = itp + notaria + registro + gestoria;

    const ahorroNecesario = ahorroNum + gastosCompra;

    return {
      capital,
      cuotaMensual,
      totalIntereses,
      totalPagado,
      porcentajeFinanciado,
      gastosCompra,
      itp,
      notaria,
      registro,
      gestoria,
      ahorroNecesario,
    };
  }, [precioNum, ahorroNum, plazoNum, interesNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoEntrada id="hip-precio" label={l ? 'Property price' : 'Precio de la vivienda'} value={precio} onChange={setPrecio} min={0} max={5000000} step={5000} suffix="€" />
        <CampoEntrada id="hip-ahorro" label={l ? 'Down payment' : 'Ahorro aportado'} value={ahorro} onChange={setAhorro} min={0} max={5000000} step={1000} suffix="€" />
        <CampoEntrada id="hip-plazo" label={l ? 'Term' : 'Plazo'} value={plazo} onChange={setPlazo} min={5} max={40} step={1} suffix={l ? 'years' : 'años'} />
        <CampoEntrada id="hip-interes" label={l ? 'Annual interest rate' : 'Tipo de interés anual'} value={interes} onChange={setInteres} min={0} max={20} step={0.1} suffix="%" helpText={tipo === 'variable' ? (l ? 'Euribor + spread' : 'Euríbor + diferencial') : (l ? 'Fixed rate' : 'Tipo fijo')} />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{l ? 'Mortgage type' : 'Tipo de hipoteca'}</label>
          <div>
            <div className="flex gap-2">
              {(['fija', 'variable'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${tipo === t ? 'border-brand bg-brand/10 text-brand' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}
                >
                  {t === 'fija' ? (l ? 'Fixed' : 'Fija') : (l ? 'Variable' : 'Variable')}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{' '}</p>
          </div>
        </div>
      </div>

      {resultado && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{l ? 'Monthly payment' : 'Cuota mensual'}</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatEuros(resultado.cuotaMensual)}</p>
              <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">{l ? 'Principal' : 'Capital'}: {formatEuros(resultado.capital)}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-6 text-center dark:from-red-900/30 dark:to-red-900/10">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{l ? 'Total interest' : 'Total intereses'}</p>
              <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{formatEuros(resultado.totalIntereses)}</p>
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{formatPercent(resultado.totalIntereses / resultado.capital)}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center dark:from-gray-700 dark:to-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{l ? 'Total paid' : 'Total pagado'}</p>
              <p className="mt-1 text-2xl font-bold text-charcoal dark:text-gray-100">{formatEuros(resultado.totalPagado)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{l ? `In ${plazoNum} years (${plazoNum * 12} payments)` : `En ${plazoNum} años (${plazoNum * 12} cuotas)`}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{l ? 'Purchase costs' : 'Gastos de compra'}</p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{formatEuros(resultado.gastosCompra)}</p>
              <p className="mt-1 text-xs text-amber-500 dark:text-amber-400">{l ? 'Transfer tax 8% + notary + registry + agency' : 'ITP 8% + notaría + registro + gestoría'}</p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <p className="font-medium">
              {l ? 'You need to have saved:' : 'Necesitas tener ahorrado:'} {formatEuros(resultado.ahorroNecesario)} {l ? '(savings + costs)' : '(ahorro + gastos)'}
            </p>
            <p className="mt-1">
              {l
                ? `You are financing ${resultado.porcentajeFinanciado.toFixed(1)}% of the property price.`
                : `Financias el ${resultado.porcentajeFinanciado.toFixed(1)}% del precio de la vivienda.`}
              {resultado.porcentajeFinanciado > 80 && (
                <span className="ml-1 font-medium text-red-600 dark:text-red-400">
                  {l
                    ? 'Warning: banks usually finance a maximum of 80%. You may need more savings.'
                    : 'Atención: los bancos normalmente financian un máximo del 80%. Es posible que necesites más ahorro.'}
                </span>
              )}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-3 py-2 text-left font-medium text-gray-500">{l ? 'Item' : 'Concepto'}</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">{l ? 'Amount' : 'Importe'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-1 text-gray-600 dark:text-gray-300">{l ? 'Transfer tax (8% of price)' : 'ITP (8% sobre precio)'}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{formatEuros(resultado.itp)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-1 text-gray-600 dark:text-gray-300">{l ? 'Notary' : 'Notaría'}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{formatEuros(resultado.notaria)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-1 text-gray-600 dark:text-gray-300">{l ? 'Land Registry' : 'Registro de la Propiedad'}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{formatEuros(resultado.registro)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-1 text-gray-600 dark:text-gray-300">{l ? 'Agency' : 'Gestoría'}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{formatEuros(resultado.gestoria)}</td>
                </tr>
                <tr className="border-t-2 border-gray-300 dark:border-gray-500 font-medium">
                  <td className="px-3 py-1 text-charcoal dark:text-gray-100">{l ? 'Total costs' : 'Total gastos'}</td>
                  <td className="px-3 py-1 text-right tabular-nums text-charcoal dark:text-gray-100">{formatEuros(resultado.gastosCompra)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
