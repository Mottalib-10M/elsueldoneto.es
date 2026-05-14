import { useState, useMemo, useEffect } from 'react';
import { calcularSueldoNeto, situacionFamiliarDefecto, type SituacionFamiliar } from '../../lib/irpf-engine';
import type { CCAACodigo } from '../../data/comunidades-autonomas';
import CampoSalario from '../ui/CampoSalario';
import SelectorCCAA from '../ui/SelectorCCAA';
import SelectorSituacionFamiliar from '../ui/SelectorSituacionFamiliar';
import PanelResultado from '../ui/PanelResultado';

interface SueldoNetoProps {
  initialBruto?: number;
  initialCCAA?: CCAACodigo;
  initialPagas?: 12 | 14;
}

export default function SueldoNeto({
  initialBruto = 30_000,
  initialCCAA = 'MD',
  initialPagas = 14,
}: SueldoNetoProps) {
  const [brutoAnual, setBrutoAnual] = useState(String(initialBruto));
  const [ccaa, setCCAA] = useState<CCAACodigo>(initialCCAA);
  const [pagas, setPagas] = useState<12 | 14>(initialPagas);
  const [situacion, setSituacion] = useState<SituacionFamiliar>(situacionFamiliarDefecto);
  const [showFamiliar, setShowFamiliar] = useState(false);

  const brutoNum = Number(brutoAnual) || 0;

  const resultado = useMemo(
    () => calcularSueldoNeto(brutoNum, ccaa, situacion, pagas),
    [brutoNum, ccaa, situacion, pagas]
  );

  // Update URL state on changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (brutoNum > 0) {
        const params = new URLSearchParams();
        params.set('bruto', String(brutoNum));
        params.set('ccaa', ccaa);
        params.set('pagas', String(pagas));
        if (situacion.hijos > 0) params.set('hijos', String(situacion.hijos));
        if (situacion.conyuge !== 'soltero') params.set('conyuge', situacion.conyuge);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [brutoNum, ccaa, pagas, situacion]);

  // Read URL state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const b = params.get('bruto');
    if (b) setBrutoAnual(b);
    const c = params.get('ccaa');
    if (c) setCCAA(c as CCAACodigo);
    const p = params.get('pagas');
    if (p === '12' || p === '14') setPagas(Number(p) as 12 | 14);
    const h = params.get('hijos');
    if (h) {
      setSituacion(prev => ({ ...prev, hijos: Number(h) }));
      setShowFamiliar(true);
    }
    const co = params.get('conyuge');
    if (co === 'sin-ingresos' || co === 'con-ingresos') {
      setSituacion(prev => ({ ...prev, conyuge: co }));
      setShowFamiliar(true);
    }
  }, []);

  return (
    <div className="space-y-6">
      <CampoSalario
        id="bruto-anual"
        label="Salario bruto"
        value={brutoAnual}
        onChange={setBrutoAnual}
        divisor={pagas}
        min={0}
        max={1_000_000}
        step={100}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectorCCAA value={ccaa} onChange={setCCAA} />

        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de pagas
          </label>
          <div>
            <div className="flex gap-2">
              {([14, 12] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagas(p)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    pagas === p
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {p} pagas
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>

        <div className="flex h-full flex-col">
          <label className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            &nbsp;
          </label>
          <div>
            <button
              onClick={() => setShowFamiliar(!showFamiliar)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
            >
              <span>Situación familiar</span>
              <svg
                className={`h-4 w-4 transition-transform ${showFamiliar ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <p className="mt-1 text-xs text-gray-500">{'\u00A0'}</p>
          </div>
        </div>
      </div>

      {showFamiliar && (
        <SelectorSituacionFamiliar
          value={situacion}
          onChange={setSituacion}
        />
      )}

      <PanelResultado resultado={resultado} />
    </div>
  );
}
