import { useState, useMemo } from 'react';
import CampoEntrada from '../ui/CampoEntrada';
import { formatEuros } from '../../lib/format-es';

/** Escala del ahorro IRPF 2025 */
const TRAMOS_AHORRO = [
  { hasta: 6000, tipo: 0.19 },
  { hasta: 50000, tipo: 0.21 },
  { hasta: 200000, tipo: 0.23 },
  { hasta: 300000, tipo: 0.27 },
  { hasta: Infinity, tipo: 0.28 },
];

function calcularIRPFAhorro(ganancia: number): number {
  if (ganancia <= 0) return 0;
  let cuota = 0;
  let baseRestante = ganancia;
  let limiteAnterior = 0;

  for (const tramo of TRAMOS_AHORRO) {
    if (baseRestante <= 0) break;
    const anchura = tramo.hasta - limiteAnterior;
    const baseEnTramo = Math.min(baseRestante, anchura);
    cuota += baseEnTramo * tramo.tipo;
    baseRestante -= baseEnTramo;
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

function calcularPlusvaliaMunicipal(precioCompra: number): number {
  const valorCatastralSuelo = precioCompra * 0.4;
  const coeficiente = 0.12; // 10 anios de tenencia aprox
  const tipoImpositivo = 0.3;
  return valorCatastralSuelo * coeficiente * tipoImpositivo;
}

interface ResultadoVenta {
  gananciaPatrimonial: number;
  irpf: number;
  plusvaliaMunicipal: number;
  totalImpuestos: number;
  reinversionAplicada: boolean;
}

function calcularImpuestosVenta(
  precioCompra: number,
  precioVenta: number,
  gastosCompra: number,
  gastosVenta: number,
  mejoras: number,
  reinversion: boolean
): ResultadoVenta {
  const gananciaPatrimonial =
    precioVenta - precioCompra - gastosCompra - gastosVenta - mejoras;

  const gananciaFiscal = reinversion ? 0 : Math.max(0, gananciaPatrimonial);
  const irpf = calcularIRPFAhorro(gananciaFiscal);
  const plusvaliaMunicipal = calcularPlusvaliaMunicipal(precioCompra);
  const totalImpuestos = irpf + plusvaliaMunicipal;

  return {
    gananciaPatrimonial,
    irpf,
    plusvaliaMunicipal,
    totalImpuestos,
    reinversionAplicada: reinversion && gananciaPatrimonial > 0,
  };
}

export default function VentaVivienda({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [precioCompra, setPrecioCompra] = useState('180000');
  const [precioVenta, setPrecioVenta] = useState('250000');
  const [gastosCompra, setGastosCompra] = useState('15000');
  const [gastosVenta, setGastosVenta] = useState('8000');
  const [mejoras, setMejoras] = useState('0');
  const [reinversion, setReinversion] = useState(false);

  const precioCompraNum = Number(precioCompra) || 0;
  const precioVentaNum = Number(precioVenta) || 0;
  const gastosCompraNum = Number(gastosCompra) || 0;
  const gastosVentaNum = Number(gastosVenta) || 0;
  const mejorasNum = Number(mejoras) || 0;

  const resultado = useMemo(() => {
    if (precioCompraNum <= 0 || precioVentaNum <= 0) return null;
    return calcularImpuestosVenta(
      precioCompraNum,
      precioVentaNum,
      gastosCompraNum,
      gastosVentaNum,
      mejorasNum,
      reinversion
    );
  }, [precioCompraNum, precioVentaNum, gastosCompraNum, gastosVentaNum, mejorasNum, reinversion]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoEntrada
          id="vv-precio-compra"
          label={l ? 'Purchase price' : 'Precio de compra'}
          value={precioCompra}
          onChange={setPrecioCompra}
          min={0}
          max={10000000}
          step={1000}
          suffix="€"
        />
        <CampoEntrada
          id="vv-precio-venta"
          label={l ? 'Sale price' : 'Precio de venta'}
          value={precioVenta}
          onChange={setPrecioVenta}
          min={0}
          max={10000000}
          step={1000}
          suffix="€"
        />
        <CampoEntrada
          id="vv-gastos-compra"
          label={l ? 'Purchase costs' : 'Gastos de compra'}
          value={gastosCompra}
          onChange={setGastosCompra}
          min={0}
          max={500000}
          step={500}
          suffix="€"
          helpText={l ? 'Notary, registry, transfer tax, etc.' : 'Notaría, registro, ITP, etc.'}
        />
        <CampoEntrada
          id="vv-gastos-venta"
          label={l ? 'Sale costs' : 'Gastos de venta'}
          value={gastosVenta}
          onChange={setGastosVenta}
          min={0}
          max={500000}
          step={500}
          suffix="€"
          helpText={l ? 'Agency, certificates, cancellation' : 'Agencia, certificados, cancelación'}
        />
        <CampoEntrada
          id="vv-mejoras"
          label={l ? 'Improvement investments' : 'Inversiones en mejoras'}
          value={mejoras}
          onChange={setMejoras}
          min={0}
          max={5000000}
          step={500}
          suffix="€"
          helpText={l ? 'Renovations with invoice' : 'Reformas con factura'}
        />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {l ? 'Reinvestment in primary residence' : 'Reinversión en vivienda habitual'}
          </label>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={reinversion}
                onClick={() => setReinversion(!reinversion)}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                  reinversion
                    ? 'bg-brand'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    reinversion ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {reinversion ? (l ? 'Yes' : 'Sí') : 'No'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{' '}</p>
          </div>
        </div>
      </div>

      {resultado && (
        <>
          {resultado.reinversionAplicada && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {l ? 'Primary residence reinvestment exemption applied' : 'Exención por reinversión en vivienda habitual aplicada'}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 text-center dark:from-gray-700 dark:to-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {l ? 'Capital gain' : 'Ganancia patrimonial'}
              </p>
              <p className="mt-1 text-2xl font-bold text-charcoal dark:text-gray-100">
                {formatEuros(resultado.gananciaPatrimonial)}
              </p>
              {resultado.gananciaPatrimonial <= 0 && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  {l ? 'No gain: no income tax due' : 'No hay ganancia: sin IRPF'}
                </p>
              )}
            </div>
            <div
              className={`rounded-xl p-5 text-center ${
                resultado.irpf === 0
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10'
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  resultado.irpf === 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {l ? 'Income tax due' : 'IRPF a pagar'}
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  resultado.irpf === 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {formatEuros(resultado.irpf)}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-5 text-center dark:from-amber-900/30 dark:to-amber-900/10">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {l ? 'Estimated municipal capital gains tax' : 'Plusvalía municipal estimada'}
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
                {formatEuros(resultado.plusvaliaMunicipal)}
              </p>
              <p className="mt-1 text-xs text-amber-500 dark:text-amber-400">
                {l ? 'Check with your local council' : 'Consulta tu ayuntamiento'}
              </p>
            </div>
            <div
              className={`rounded-xl p-5 text-center ${
                resultado.totalImpuestos < 3000
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10'
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  resultado.totalImpuestos < 3000
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {l ? 'Total taxes' : 'Total impuestos'}
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  resultado.totalImpuestos < 3000
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {formatEuros(resultado.totalImpuestos)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    {l ? 'Item' : 'Concepto'}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">
                    {l ? 'Amount' : 'Importe'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {l ? 'Sale price' : 'Precio de venta'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">
                    {formatEuros(precioVentaNum)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {l ? 'Purchase price' : 'Precio de compra'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">
                    -{formatEuros(precioCompraNum)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {l ? 'Purchase costs (notary, registry, transfer tax)' : 'Gastos de compra (notaría, registro, ITP)'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">
                    -{formatEuros(gastosCompraNum)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {l ? 'Sale costs (agency, cancellation)' : 'Gastos de venta (agencia, cancelación)'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">
                    -{formatEuros(gastosVentaNum)}
                  </td>
                </tr>
                {mejorasNum > 0 && (
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                      {l ? 'Improvement investments' : 'Inversiones en mejoras'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">
                      -{formatEuros(mejorasNum)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 font-semibold text-charcoal dark:text-gray-100">
                    {l ? 'Capital gain' : 'Ganancia patrimonial'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    {formatEuros(resultado.gananciaPatrimonial)}
                  </td>
                </tr>
                {resultado.reinversionAplicada && (
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400">
                      {l ? 'Primary residence reinvestment exemption' : 'Exención por reinversión en vivienda habitual'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                      -{formatEuros(resultado.gananciaPatrimonial)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {l ? 'Income tax on gain (savings tax brackets)' : 'IRPF sobre la ganancia (escala del ahorro)'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-red-600 dark:text-red-400">
                    {formatEuros(resultado.irpf)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {l ? 'Estimated municipal capital gains tax' : 'Plusvalía municipal estimada'}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
                    {formatEuros(resultado.plusvaliaMunicipal)}
                  </td>
                </tr>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  <td className="px-4 py-2 font-bold text-charcoal dark:text-gray-100">
                    {l ? 'Total estimated taxes' : 'Total impuestos estimados'}
                  </td>
                  <td
                    className={`px-4 py-2 text-right tabular-nums font-bold ${
                      resultado.totalImpuestos < 3000
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {formatEuros(resultado.totalImpuestos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-medium-gray">
            {l
              ? 'Approximate calculation. The municipal capital gains tax depends on the cadastral land value, your municipality\'s coefficients, and the actual years of ownership. Consult your local council and a tax advisor for your specific case.'
              : 'Cálculo orientativo. La plusvalía municipal depende del valor catastral del suelo, los coeficientes de tu municipio y los años de tenencia reales. Consulta con tu ayuntamiento y con un asesor fiscal para tu caso concreto.'}
          </p>
        </>
      )}
    </div>
  );
}
