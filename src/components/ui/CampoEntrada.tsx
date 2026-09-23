import { type InputHTMLAttributes, useState } from 'react';

interface CampoEntradaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  suffix?: string;
  helpText?: string;
  id: string;
}

export default function CampoEntrada({
  label,
  value,
  onChange,
  suffix,
  helpText,
  id,
  ...rest
}: CampoEntradaProps) {
  // Le champ qu'on remplit garde son texte brut ; sinon on montre les milliers
  // separes par le point espagnol (RECETTE §4.1).
  const [enEdicion, setEnEdicion] = useState(false);
  const mostrado = (() => {
    const s = String(value ?? '');
    if (enEdicion || s === '') return s;
    const n = parseFloat(s.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n).toLocaleString('es-ES') : s;
  })();

  const prClass = !suffix
    ? 'pr-3'
    : suffix.length <= 2
      ? 'pr-10'
      : suffix.length <= 5
        ? 'pr-16'
        : 'pr-24';

  return (
    <div className="flex h-full flex-col">
      <label htmlFor={id} className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div>
        <div className="relative">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={mostrado}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setEnEdicion(true)}
            onBlur={() => setEnEdicion(false)}
            className={`w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 text-right text-charcoal shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${prClass}`}
            {...rest}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {suffix}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helpText || ' '}
        </p>
      </div>
    </div>
  );
}
