import { useState, useMemo } from 'react';
import CampoEntrada from '../ui/CampoEntrada';
import { formatEuros } from '../../lib/format-es';

type ComunidadAutonoma =
  | 'madrid'
  | 'cataluna'
  | 'andalucia'
  | 'valencia'
  | 'paisvasco'
  | 'galicia'
  | 'castillayleon'
  | 'aragon'
  | 'canarias'
  | 'baleares';

type GrupoParentesco = 'I' | 'II' | 'III' | 'IV';

const COMUNIDADES: { value: ComunidadAutonoma; label: string }[] = [
  { value: 'madrid', label: 'Madrid' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'valencia', label: 'C. Valenciana' },
  { value: 'paisvasco', label: 'País Vasco' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'castillayleon', label: 'Castilla y León' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'baleares', label: 'Baleares' },
];

const GRUPOS: { value: GrupoParentesco; label: string }[] = [
  { value: 'I', label: 'Grupo I: descendientes menores de 21 años' },
  { value: 'II', label: 'Grupo II: descendientes 21+, cónyuge, ascendientes' },
  { value: 'III', label: 'Grupo III: hermanos, tíos, sobrinos' },
  { value: 'IV', label: 'Grupo IV: otros (sin parentesco cercano)' },
];

/** Escala progresiva estatal del Impuesto de Sucesiones */
const TRAMOS = [
  { hasta: 7993.46, tipo: 0.0765 },
  { hasta: 15980.91, tipo: 0.085 },
  { hasta: 23968.36, tipo: 0.0935 },
  { hasta: 31955.81, tipo: 0.102 },
  { hasta: 39943.26, tipo: 0.1105 },
  { hasta: 47930.72, tipo: 0.119 },
  { hasta: 55918.17, tipo: 0.1275 },
  { hasta: 63905.62, tipo: 0.136 },
  { hasta: 71893.07, tipo: 0.1445 },
  { hasta: 79880.52, tipo: 0.153 },
  { hasta: 119757.67, tipo: 0.1615 },
  { hasta: 159634.83, tipo: 0.187 },
  { hasta: 239389.13, tipo: 0.2125 },
  { hasta: 398777.54, tipo: 0.255 },
  { hasta: 797555.08, tipo: 0.2975 },
  { hasta: Infinity, tipo: 0.34 },
];

function calcularReduccionParentesco(grupo: GrupoParentesco): number {
  switch (grupo) {
    case 'I':
      // 15.956,87 € + 3.990,72 € por año menor de 21 (usamos 2 años como ejemplo, max 47.858,59)
      return Math.min(15956.87 + 3990.72 * 2, 47858.59);
    case 'II':
      return 15956.87;
    case 'III':
      return 7993.46;
    case 'IV':
      return 0;
  }
}

function calcularReduccionVivienda(
  valor: number,
  grupo: GrupoParentesco,
  esViviendaHabitual: boolean
): number {
  if (!esViviendaHabitual) return 0;
  if (grupo === 'III' || grupo === 'IV') return 0;
  return Math.min(valor * 0.95, 122606.47);
}

function calcularCuotaIntegra(baseLiquidable: number): number {
  let cuota = 0;
  let baseRestante = baseLiquidable;
  let limiteAnterior = 0;

  for (const tramo of TRAMOS) {
    const anchura = tramo.hasta - limiteAnterior;
    if (baseRestante <= 0) break;
    const baseEnTramo = Math.min(baseRestante, anchura);
    cuota += baseEnTramo * tramo.tipo;
    baseRestante -= baseEnTramo;
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

function obtenerCoeficienteMultiplicador(grupo: GrupoParentesco): number {
  switch (grupo) {
    case 'I':
    case 'II':
      return 1.0;
    case 'III':
      return 1.5882;
    case 'IV':
      return 2.0;
  }
}

function obtenerBonificacionCCAA(
  ccaa: ComunidadAutonoma,
  grupo: GrupoParentesco
): number {
  switch (ccaa) {
    case 'madrid':
      return grupo === 'I' || grupo === 'II' ? 0.99 : 0;
    case 'andalucia':
      return grupo === 'I' || grupo === 'II' ? 0.99 : 0;
    case 'cataluna':
      if (grupo === 'I') return 0.99;
      if (grupo === 'II') return 0.5;
      return 0;
    case 'valencia':
      return grupo === 'I' || grupo === 'II' ? 0.75 : 0;
    case 'canarias':
      return grupo === 'I' || grupo === 'II' ? 0.999 : 0;
    case 'paisvasco':
      return grupo === 'I' || grupo === 'II' ? 0.95 : 0;
    default:
      return 0;
  }
}

interface ResultadoHerencia {
  valorHerencia: number;
  reduccionParentesco: number;
  reduccionVivienda: number;
  totalReducciones: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficiente: number;
  cuotaAjustada: number;
  bonificacion: number;
  aPagar: number;
}

function calcularHerencia(
  valor: number,
  ccaa: ComunidadAutonoma,
  grupo: GrupoParentesco,
  _patrimonioPreexistente: number,
  viviendaHabitual: boolean
): ResultadoHerencia {
  const reduccionParentesco = calcularReduccionParentesco(grupo);
  const reduccionVivienda = calcularReduccionVivienda(valor, grupo, viviendaHabitual);
  const totalReducciones = reduccionParentesco + reduccionVivienda;
  const baseLiquidable = Math.max(0, valor - totalReducciones);
  const cuotaIntegra = calcularCuotaIntegra(baseLiquidable);
  const coeficiente = obtenerCoeficienteMultiplicador(grupo);
  const cuotaAjustada = cuotaIntegra * coeficiente;
  const bonificacion = obtenerBonificacionCCAA(ccaa, grupo);
  const aPagar = Math.max(0, cuotaAjustada * (1 - bonificacion));

  return {
    valorHerencia: valor,
    reduccionParentesco,
    reduccionVivienda,
    totalReducciones,
    baseLiquidable,
    cuotaIntegra,
    coeficiente,
    cuotaAjustada,
    bonificacion,
    aPagar,
  };
}

export default function Herencia() {
  const [valor, setValor] = useState('200000');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [grupo, setGrupo] = useState<GrupoParentesco>('II');
  const [patrimonio, setPatrimonio] = useState('0');
  const [viviendaHabitual, setViviendaHabitual] = useState(false);

  const valorNum = Number(valor) || 0;
  const patrimonioNum = Number(patrimonio) || 0;

  const resultado = useMemo(() => {
    if (valorNum <= 0) return null;
    return calcularHerencia(valorNum, ccaa, grupo, patrimonioNum, viviendaHabitual);
  }, [valorNum, ccaa, grupo, patrimonioNum, viviendaHabitual]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoEntrada
          id="her-valor"
          label="Valor de la herencia"
          value={valor}
          onChange={setValor}
          min={0}
          max={10000000}
          step={5000}
          suffix="€"
        />
        <div className="flex h-full flex-col">
          <label
            htmlFor="her-ccaa"
            className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Comunidad Autónoma
          </label>
          <div>
            <select
              id="her-ccaa"
              value={ccaa}
              onChange={(e) => setCcaa(e.target.value as ComunidadAutonoma)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {COMUNIDADES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>
        <div className="flex h-full flex-col">
          <label
            htmlFor="her-grupo"
            className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Grupo de parentesco
          </label>
          <div>
            <select
              id="her-grupo"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value as GrupoParentesco)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {GRUPOS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>
        <CampoEntrada
          id="her-patrimonio"
          label="Patrimonio preexistente del heredero"
          value={patrimonio}
          onChange={setPatrimonio}
          min={0}
          max={50000000}
          step={10000}
          suffix="€"
          helpText="Patrimonio neto del heredero antes de recibir la herencia"
        />
        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Vivienda habitual
          </label>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={viviendaHabitual}
                onClick={() => setViviendaHabitual(!viviendaHabitual)}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                  viviendaHabitual
                    ? 'bg-brand'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    viviendaHabitual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {viviendaHabitual ? 'Sí' : 'No'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>
      </div>

      {resultado && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 text-center dark:from-gray-700 dark:to-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valor herencia
              </p>
              <p className="mt-1 text-2xl font-bold text-charcoal dark:text-gray-100">
                {formatEuros(resultado.valorHerencia)}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 text-center dark:from-blue-900/30 dark:to-blue-900/10">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Reducciones aplicadas
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatEuros(resultado.totalReducciones)}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-5 text-center dark:from-amber-900/30 dark:to-amber-900/10">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Cuota antes bonificación
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
                {formatEuros(resultado.cuotaAjustada)}
              </p>
            </div>
            <div
              className={`rounded-xl p-5 text-center ${
                resultado.aPagar < 5000
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10'
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  resultado.aPagar < 5000
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                A pagar
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  resultado.aPagar < 5000
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {formatEuros(resultado.aPagar)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Concepto
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    Valor de la herencia
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">
                    {formatEuros(resultado.valorHerencia)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    Reducción por parentesco ({grupo === 'I' ? 'Grupo I' : grupo === 'II' ? 'Grupo II' : grupo === 'III' ? 'Grupo III' : 'Grupo IV'})
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">
                    -{formatEuros(resultado.reduccionParentesco)}
                  </td>
                </tr>
                {resultado.reduccionVivienda > 0 && (
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                      Reducción vivienda habitual (95%, max 122.606 €)
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400">
                      -{formatEuros(resultado.reduccionVivienda)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 font-semibold text-charcoal dark:text-gray-100">
                    Base liquidable
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    {formatEuros(resultado.baseLiquidable)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    Cuota íntegra (escala progresiva)
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">
                    {formatEuros(resultado.cuotaIntegra)}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    Coeficiente multiplicador (x{resultado.coeficiente.toFixed(4)})
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">
                    {formatEuros(resultado.cuotaAjustada)}
                  </td>
                </tr>
                {resultado.bonificacion > 0 && (
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                      Bonificación autonómica ({(resultado.bonificacion * 100).toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                      -{formatEuros(resultado.cuotaAjustada * resultado.bonificacion)}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  <td className="px-4 py-2 font-bold text-charcoal dark:text-gray-100">
                    Total a pagar
                  </td>
                  <td
                    className={`px-4 py-2 text-right tabular-nums font-bold ${
                      resultado.aPagar < 5000
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {formatEuros(resultado.aPagar)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-medium-gray">
            Cálculo orientativo basado en la normativa estatal y bonificaciones autonómicas simplificadas. Las comunidades autónomas pueden aplicar reducciones y bonificaciones adicionales. Consulta con un profesional para tu caso concreto.
          </p>
        </>
      )}
    </div>
  );
}
