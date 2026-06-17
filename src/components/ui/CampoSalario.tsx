import { useState, useEffect, useRef } from 'react';

type ModoSalario = 'anual' | 'mensual';

interface CampoSalarioProps {
  id: string;
  label?: string;
  value: string;
  onChange: (annualValue: string) => void;
  divisor?: number;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  lang?: 'es' | 'en';
}

export default function CampoSalario({
  id,
  label = 'Salario bruto',
  value,
  onChange,
  divisor = 12,
  min = 0,
  max = 1_000_000,
  step = 100,
  lang = 'es',
}: CampoSalarioProps) {
  const [modo, setModo] = useState<ModoSalario>('anual');
  const [mensual, setMensual] = useState(() =>
    String(Math.round((Number(value) / divisor) * 100) / 100)
  );
  const lastSentAnual = useRef(value);
  const prevDivisor = useRef(divisor);

  // Sync monthly from annual ONLY when value changes from an external source
  useEffect(() => {
    if (modo === 'mensual' && value === lastSentAnual.current) return;
    const num = Number(value) || 0;
    setMensual(String(Math.round((num / divisor) * 100) / 100));
    lastSentAnual.current = value;
  }, [value, divisor]);

  // When divisor changes while in mensual mode, recalc annual from current mensual
  useEffect(() => {
    if (divisor !== prevDivisor.current) {
      prevDivisor.current = divisor;
      if (modo === 'mensual') {
        const num = Number(mensual) || 0;
        const newAnual = String(Math.round(num * divisor * 100) / 100);
        lastSentAnual.current = newAnual;
        onChange(newAnual);
      }
    }
  }, [divisor]);

  const handleAnualChange = (val: string) => {
    lastSentAnual.current = val;
    onChange(val);
    const num = Number(val) || 0;
    setMensual(String(Math.round((num / divisor) * 100) / 100));
  };

  const handleMensualChange = (val: string) => {
    setMensual(val);
    const num = Number(val) || 0;
    const newAnual = String(Math.round(num * divisor * 100) / 100);
    lastSentAnual.current = newAnual;
    onChange(newAnual);
  };

  const displayValue = modo === 'anual' ? value : mensual;
  const annualNum = Number(value) || 0;
  const mensualNum = Number(mensual) || 0;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            value={displayValue}
            onChange={(e) =>
              modo === 'anual'
                ? handleAnualChange(e.target.value)
                : handleMensualChange(e.target.value)
            }
            min={min}
            max={modo === 'anual' ? max : Math.round(max / divisor)}
            step={modo === 'anual' ? step : Math.max(1, Math.round(step / divisor))}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-right text-charcoal shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            €
          </span>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
          {(['anual', 'mensual'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                modo === m
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {m === 'anual' ? (lang === 'en' ? '/year' : '/año') : (lang === 'en' ? '/month' : '/mes')}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {modo === 'anual'
          ? `${mensualNum.toLocaleString('es-ES', { maximumFractionDigits: 2 }).replace(/\./g, ' ')} ${lang === 'en' ? '€/month' : '€/mes'}`
          : `${annualNum.toLocaleString('es-ES', { maximumFractionDigits: 2 }).replace(/\./g, ' ')} ${lang === 'en' ? '€/year' : '€/año'}`}
      </p>
    </div>
  );
}
