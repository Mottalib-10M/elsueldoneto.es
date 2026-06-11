import { useState, useMemo } from 'react';
import CampoEntrada from '../ui/CampoEntrada';
import { formatEuros } from '../../lib/format-es';

type TipoIVA = 0.21 | 0.10 | 0.04;
type Operacion = 'anadir' | 'quitar';

const TIPOS_IVA_ES: { valor: TipoIVA; etiqueta: string; nombre: string }[] = [
  { valor: 0.21, etiqueta: '21% General', nombre: 'General' },
  { valor: 0.10, etiqueta: '10% Reducido', nombre: 'Reducido' },
  { valor: 0.04, etiqueta: '4% Superreducido', nombre: 'Superreducido' },
];

const TIPOS_IVA_EN: { valor: TipoIVA; etiqueta: string; nombre: string }[] = [
  { valor: 0.21, etiqueta: '21% General', nombre: 'General' },
  { valor: 0.10, etiqueta: '10% Reduced', nombre: 'Reduced' },
  { valor: 0.04, etiqueta: '4% Super-reduced', nombre: 'Super-reduced' },
];

export default function IVA({ lang = 'es' }: { lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const TIPOS_IVA = l ? TIPOS_IVA_EN : TIPOS_IVA_ES;
  const [importe, setImporte] = useState('1000');
  const [tipoIVA, setTipoIVA] = useState<TipoIVA>(0.21);
  const [operacion, setOperacion] = useState<Operacion>('anadir');

  const importeNum = Number(importe) || 0;

  const resultado = useMemo(() => {
    if (importeNum <= 0) {
      return { base: 0, iva: 0, total: 0 };
    }

    if (operacion === 'anadir') {
      const base = importeNum;
      const iva = importeNum * tipoIVA;
      const total = base + iva;
      return { base, iva, total };
    }

    // Quitar IVA
    const total = importeNum;
    const base = importeNum / (1 + tipoIVA);
    const iva = total - base;
    return { base, iva, total };
  }, [importeNum, tipoIVA, operacion]);

  const referencia = useMemo(() => {
    if (importeNum <= 0) return null;

    if (operacion === 'anadir') {
      return {
        iva21: importeNum * 0.21,
        iva10: importeNum * 0.10,
        iva4: importeNum * 0.04,
      };
    }

    return {
      iva21: importeNum - importeNum / 1.21,
      iva10: importeNum - importeNum / 1.10,
      iva4: importeNum - importeNum / 1.04,
    };
  }, [importeNum, operacion]);

  const porcentajeLabel = `${Math.round(tipoIVA * 100)}%`;

  return (
    <div className="space-y-6">
      {/* Entrada del importe */}
      <CampoEntrada
        id="iva-importe"
        label={l ? 'Amount' : 'Importe'}
        value={importe}
        onChange={setImporte}
        min={0}
        max={100000000}
        step={1}
        suffix="€"
      />

      {/* Tipo de IVA */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {l ? 'VAT rate' : 'Tipo de IVA'}
        </label>
        <div className="flex gap-2">
          {TIPOS_IVA.map((t) => (
            <button
              key={t.valor}
              type="button"
              onClick={() => setTipoIVA(t.valor)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                tipoIVA === t.valor
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {/* Operación */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {l ? 'Operation' : 'Operación'}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOperacion('anadir')}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              operacion === 'anadir'
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            {l ? 'Add VAT' : 'Añadir IVA'}
          </button>
          <button
            type="button"
            onClick={() => setOperacion('quitar')}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              operacion === 'quitar'
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            {l ? 'Remove VAT' : 'Quitar IVA'}
          </button>
        </div>
      </div>

      {/* Resultado: 3 tarjetas */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Base imponible */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center dark:from-gray-700 dark:to-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{l ? 'Tax base' : 'Base imponible'}</p>
          <p className="mt-1 text-2xl font-bold text-charcoal dark:text-gray-100">
            {formatEuros(resultado.base)}
          </p>
        </div>

        {/* IVA */}
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            IVA ({porcentajeLabel})
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {formatEuros(resultado.iva)}
          </p>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/30 dark:to-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {operacion === 'anadir' ? (l ? 'Total with VAT' : 'Total con IVA') : (l ? 'Total without VAT' : 'Total sin IVA')}
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatEuros(operacion === 'anadir' ? resultado.total : resultado.base)}
          </p>
        </div>
      </div>

      {/* Tabla de referencia rápida */}
      {referencia && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          <p className="font-medium mb-2">{l ? 'Quick reference' : 'Referencia rápida'}</p>
          <p>
            {l ? (
              <>
                If you enter {formatEuros(importeNum)}, the VAT at 21% is{' '}
                <span className="font-semibold tabular-nums">{formatEuros(referencia.iva21)}</span>, at
                10% is{' '}
                <span className="font-semibold tabular-nums">{formatEuros(referencia.iva10)}</span>, at
                4% is{' '}
                <span className="font-semibold tabular-nums">{formatEuros(referencia.iva4)}</span>.
              </>
            ) : (
              <>
                Si introduces {formatEuros(importeNum)}, el IVA al 21% es{' '}
                <span className="font-semibold tabular-nums">{formatEuros(referencia.iva21)}</span>, al
                10% es{' '}
                <span className="font-semibold tabular-nums">{formatEuros(referencia.iva10)}</span>, al
                4% es{' '}
                <span className="font-semibold tabular-nums">{formatEuros(referencia.iva4)}</span>.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
