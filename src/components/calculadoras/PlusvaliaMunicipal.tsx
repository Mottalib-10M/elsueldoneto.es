import { useState, useMemo } from 'react';
import CampoEntrada from '../ui/CampoEntrada';
import { formatEuros } from '../../lib/format-es';

/** Coeficientes máximos por años de tenencia (RDL 26/2021, actualizados) */
const COEFICIENTES: Record<number, number> = {
  1: 0.14,
  2: 0.13,
  3: 0.15,
  4: 0.17,
  5: 0.17,
  6: 0.16,
  7: 0.12,
  8: 0.10,
  9: 0.09,
  10: 0.08,
  11: 0.08,
  12: 0.08,
  13: 0.08,
  14: 0.10,
  15: 0.12,
  16: 0.16,
  17: 0.20,
  18: 0.26,
  19: 0.36,
  20: 0.45,
};

function obtenerCoeficiente(anios: number): number {
  if (anios < 1) return 0;
  if (anios > 20) return COEFICIENTES[20];
  return COEFICIENTES[anios] ?? 0;
}

interface ResultadoPlusvalia {
  // Método objetivo
  coeficiente: number;
  baseObjetivo: number;
  cuotaObjetivo: number;
  // Método real
  gananciaInmueble: number;
  gananciaSuelo: number;
  baseReal: number;
  cuotaReal: number;
  // Resultado
  ventaConPerdidas: boolean;
  metodoFavorable: 'objetivo' | 'real';
  cuotaFinal: number;
}

function calcularPlusvalia(
  valorCatastralSuelo: number,
  precioCompra: number,
  precioVenta: number,
  aniosTenencia: number,
  tipoImpositivo: number
): ResultadoPlusvalia {
  const tipo = tipoImpositivo / 100;

  // Método objetivo
  const coeficiente = obtenerCoeficiente(aniosTenencia);
  const baseObjetivo = valorCatastralSuelo * coeficiente;
  const cuotaObjetivo = baseObjetivo * tipo;

  // Método real
  const gananciaInmueble = precioVenta - precioCompra;
  const ventaConPerdidas = gananciaInmueble <= 0;

  // Porcentaje atribuible al suelo (simplificado: 40%)
  const porcentajeSuelo = 0.40;
  const gananciaSuelo = ventaConPerdidas ? 0 : gananciaInmueble * porcentajeSuelo;
  const baseReal = gananciaSuelo;
  const cuotaReal = ventaConPerdidas ? 0 : baseReal * tipo;

  // El contribuyente elige el método más favorable (menor cuota)
  let metodoFavorable: 'objetivo' | 'real';
  let cuotaFinal: number;

  if (ventaConPerdidas) {
    metodoFavorable = 'real';
    cuotaFinal = 0;
  } else if (cuotaReal <= cuotaObjetivo) {
    metodoFavorable = 'real';
    cuotaFinal = cuotaReal;
  } else {
    metodoFavorable = 'objetivo';
    cuotaFinal = cuotaObjetivo;
  }

  return {
    coeficiente,
    baseObjetivo,
    cuotaObjetivo,
    gananciaInmueble,
    gananciaSuelo,
    baseReal,
    cuotaReal,
    ventaConPerdidas,
    metodoFavorable,
    cuotaFinal,
  };
}

export default function PlusvaliaMunicipal({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('80000');
  const [precioCompra, setPrecioCompra] = useState('180000');
  const [precioVenta, setPrecioVenta] = useState('250000');
  const [aniosTenencia, setAniosTenencia] = useState('10');
  const [tipoImpositivo, setTipoImpositivo] = useState('30');

  const valorCatastralSueloNum = Number(valorCatastralSuelo) || 0;
  const precioCompraNum = Number(precioCompra) || 0;
  const precioVentaNum = Number(precioVenta) || 0;
  const aniosTenenciaNum = Math.max(1, Math.min(20, Math.round(Number(aniosTenencia) || 10)));
  const tipoImpositivoNum = Math.max(0, Math.min(30, Number(tipoImpositivo) || 30));

  const resultado = useMemo(() => {
    if (valorCatastralSueloNum <= 0) return null;
    return calcularPlusvalia(
      valorCatastralSueloNum,
      precioCompraNum,
      precioVentaNum,
      aniosTenenciaNum,
      tipoImpositivoNum
    );
  }, [valorCatastralSueloNum, precioCompraNum, precioVentaNum, aniosTenenciaNum, tipoImpositivoNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoEntrada
          id="plv-catastral"
          label={l ? 'Cadastral land value' : 'Valor catastral del suelo'}
          value={valorCatastralSuelo}
          onChange={setValorCatastralSuelo}
          min={0}
          max={5000000}
          step={1000}
          suffix="€"
          helpText={l ? 'Check your property tax bill (IBI)' : 'Consulta tu recibo del IBI'}
        />
        <CampoEntrada
          id="plv-compra"
          label={l ? 'Property purchase price' : 'Precio de compra del inmueble'}
          value={precioCompra}
          onChange={setPrecioCompra}
          min={0}
          max={10000000}
          step={1000}
          suffix="€"
        />
        <CampoEntrada
          id="plv-venta"
          label={l ? 'Property sale price' : 'Precio de venta del inmueble'}
          value={precioVenta}
          onChange={setPrecioVenta}
          min={0}
          max={10000000}
          step={1000}
          suffix="€"
        />
        <CampoEntrada
          id="plv-anios"
          label={l ? 'Years of ownership' : 'Años de tenencia'}
          value={aniosTenencia}
          onChange={setAniosTenencia}
          min={1}
          max={20}
          step={1}
          suffix={l ? 'years' : 'años'}
        />
        <CampoEntrada
          id="plv-tipo"
          label={l ? 'Municipal tax rate' : 'Tipo impositivo municipal'}
          value={tipoImpositivo}
          onChange={setTipoImpositivo}
          min={0}
          max={30}
          step={1}
          suffix="%"
          helpText={l ? 'Legal maximum: 30%' : 'Máximo legal: 30%'}
        />
      </div>

      {resultado && (
        <>
          {/* Banner de venta con pérdidas */}
          {resultado.ventaConPerdidas && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                {l ? 'Not subject to municipal capital gains tax (sale at no gain)' : 'No sujeto a plusvalia municipal (venta sin ganancia)'}
              </p>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-300">
                {l
                  ? 'Since Constitutional Court ruling STC 59/2017 and its confirmation in STC 182/2021, if there is no increase in land value, the tax is not applicable.'
                  : 'Desde la STC 59/2017 y su confirmacion en la STC 182/2021, si no existe incremento de valor del terreno no se genera el impuesto.'}
              </p>
            </div>
          )}

          {/* Comparativa de métodos */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Método objetivo */}
            <div
              className={`rounded-xl border-2 p-5 ${
                resultado.metodoFavorable === 'objetivo' && !resultado.ventaConPerdidas
                  ? 'border-brand bg-red-50/50 dark:border-brand dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-charcoal dark:text-gray-100">
                  {l ? 'Objective method' : 'Metodo objetivo'}
                </h3>
                {resultado.metodoFavorable === 'objetivo' && !resultado.ventaConPerdidas && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {l ? 'Most favorable' : 'Mas favorable'}
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l ? 'Cadastral land value' : 'Valor catastral suelo'}</span>
                  <span className="tabular-nums font-medium">{formatEuros(valorCatastralSueloNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l ? `Coefficient (${aniosTenenciaNum} ${aniosTenenciaNum === 1 ? 'year' : 'years'})` : `Coeficiente (${aniosTenenciaNum} ${aniosTenenciaNum === 1 ? 'ano' : 'anos'})`}</span>
                  <span className="tabular-nums font-medium">{resultado.coeficiente.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                  <span className="font-semibold text-charcoal dark:text-gray-100">{l ? 'Tax base' : 'Base imponible'}</span>
                  <span className="tabular-nums font-semibold">{formatEuros(resultado.baseObjetivo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l ? 'Tax rate' : 'Tipo impositivo'}</span>
                  <span className="tabular-nums font-medium">{tipoImpositivoNum}%</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-300 pt-2 dark:border-gray-500">
                  <span className="font-bold text-charcoal dark:text-gray-100">{l ? 'Tax amount' : 'Cuota'}</span>
                  <span className="tabular-nums text-lg font-bold text-charcoal dark:text-gray-100">
                    {formatEuros(resultado.cuotaObjetivo)}
                  </span>
                </div>
              </div>
            </div>

            {/* Método real */}
            <div
              className={`rounded-xl border-2 p-5 ${
                resultado.metodoFavorable === 'real' && !resultado.ventaConPerdidas
                  ? 'border-brand bg-red-50/50 dark:border-brand dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-charcoal dark:text-gray-100">
                  {l ? 'Actual method' : 'Metodo real'}
                </h3>
                {resultado.metodoFavorable === 'real' && !resultado.ventaConPerdidas && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {l ? 'Most favorable' : 'Mas favorable'}
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l ? 'Property gain' : 'Ganancia del inmueble'}</span>
                  <span className={`tabular-nums font-medium ${resultado.gananciaInmueble < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {formatEuros(resultado.gananciaInmueble)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l ? 'Gain attributable to land (40%)' : 'Ganancia atribuible al suelo (40%)'}</span>
                  <span className="tabular-nums font-medium">{formatEuros(resultado.gananciaSuelo)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                  <span className="font-semibold text-charcoal dark:text-gray-100">{l ? 'Tax base' : 'Base imponible'}</span>
                  <span className="tabular-nums font-semibold">{formatEuros(resultado.baseReal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l ? 'Tax rate' : 'Tipo impositivo'}</span>
                  <span className="tabular-nums font-medium">{tipoImpositivoNum}%</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-300 pt-2 dark:border-gray-500">
                  <span className="font-bold text-charcoal dark:text-gray-100">{l ? 'Tax amount' : 'Cuota'}</span>
                  <span className={`tabular-nums text-lg font-bold ${resultado.ventaConPerdidas ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal dark:text-gray-100'}`}>
                    {resultado.ventaConPerdidas ? '0,00 €' : formatEuros(resultado.cuotaReal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado final */}
          <div
            className={`rounded-xl p-6 text-center ${
              resultado.ventaConPerdidas
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10'
                : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                resultado.ventaConPerdidas
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {resultado.ventaConPerdidas
                ? (l ? 'Not subject to municipal capital gains tax' : 'No sujeto a plusvalia municipal')
                : (l
                    ? `Amount due (${resultado.metodoFavorable === 'objetivo' ? 'objective method' : 'actual method'})`
                    : `A pagar (${resultado.metodoFavorable === 'objetivo' ? 'metodo objetivo' : 'metodo real'})`)}
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                resultado.ventaConPerdidas
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {formatEuros(resultado.cuotaFinal)}
            </p>
            {!resultado.ventaConPerdidas && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {l ? 'The taxpayer may choose the most favorable method (RDL 26/2021)' : 'El contribuyente puede elegir el metodo que resulte mas favorable (RDL 26/2021)'}
              </p>
            )}
          </div>

          {/* Tabla resumen detallada */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">{l ? 'Item' : 'Concepto'}</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">{l ? 'Objective' : 'M. objetivo'}</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">{l ? 'Actual' : 'M. real'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Tax base' : 'Base imponible'}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.baseObjetivo)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatEuros(resultado.baseReal)}</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{l ? 'Tax rate' : 'Tipo impositivo'}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{tipoImpositivoNum}%</td>
                  <td className="px-4 py-2 text-right tabular-nums">{tipoImpositivoNum}%</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 font-semibold text-charcoal dark:text-gray-100">{l ? 'Tax liability' : 'Cuota tributaria'}</td>
                  <td className={`px-4 py-2 text-right tabular-nums font-semibold ${resultado.metodoFavorable === 'objetivo' && !resultado.ventaConPerdidas ? 'text-brand' : ''}`}>
                    {formatEuros(resultado.cuotaObjetivo)}
                  </td>
                  <td className={`px-4 py-2 text-right tabular-nums font-semibold ${resultado.metodoFavorable === 'real' && !resultado.ventaConPerdidas ? 'text-brand' : ''}`}>
                    {resultado.ventaConPerdidas ? '0,00 €' : formatEuros(resultado.cuotaReal)}
                  </td>
                </tr>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  <td className="px-4 py-2 font-bold text-charcoal dark:text-gray-100">{l ? 'Amount due (most favorable)' : 'A pagar (mas favorable)'}</td>
                  <td colSpan={2} className="px-4 py-2 text-right tabular-nums text-lg font-bold text-brand">
                    {formatEuros(resultado.cuotaFinal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-medium-gray">
            {l
              ? 'Approximate calculation. The land-to-total-value ratio (40%) is a simplified estimate. The actual value depends on each property\'s cadastral data. Each municipality may set coefficients and rates below the legal maximums. Consult your local council or a tax advisor for your specific case.'
              : 'Calculo orientativo. El porcentaje de suelo sobre el valor total (40%) es una estimacion simplificada. El valor real depende de los datos catastrales de cada inmueble. Cada ayuntamiento puede fijar coeficientes y tipos inferiores a los maximos legales. Consulta con tu ayuntamiento o un asesor fiscal para tu caso concreto.'}
          </p>
        </>
      )}
    </div>
  );
}
