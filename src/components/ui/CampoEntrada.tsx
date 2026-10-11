import { type InputHTMLAttributes, useState } from 'react';

/** Lit un nombre tapé à l'espagnole : « 3,5 », « 250.000 », « 1.234,56 » ; « 3.5 » reste 3,5. */
export function parseEs(input: string): number {
  const c = input.replace(/[^\d.,-]/g, '');
  if (c === '' || c === '-') return NaN;
  const coma = c.lastIndexOf(','), punto = c.lastIndexOf('.');
  let t: string;
  if (coma > punto) t = c.replace(/\./g, '').replace(',', '.');
  else if (coma >= 0) t = c.replace(/,/g, '');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(c)) t = c.replace(/\./g, '');
  else t = c;
  return parseFloat(t);
}

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
  // Le champ qu'on remplit garde sa frappe brute tant qu'il a le focus ; au blur on montre le
  // nombre mis en forme à l'espagnole : milliers par un point, décimales par une virgule
  // (RECETTE §4.1). Le parent reçoit toujours un nombre lisible par Number() (« 3.5 »), si bien
  // que « 3,5 » se calcule avec 3,5 (bug du 2026-10-12 : « 3.0 » s'affichait « 30 » et
  // « 3,5 » donnait 0).
  const [bruto, setBruto] = useState<string | null>(null);
  const s = String(value ?? '');
  const n = Number(s);
  const fmt = (x: number, agrupar: boolean) =>
    x.toLocaleString('es-ES', { maximumFractionDigits: 4, useGrouping: agrupar });
  const mostrado = bruto !== null ? bruto : s === '' || !Number.isFinite(n) ? s : fmt(n, true);

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
            onChange={(e) => {
              const f = e.target.value.replace(/[^0-9.,\s-]/g, '');
              setBruto(f);
              const x = parseEs(f);
              onChange(f.trim() === '' ? '' : Number.isFinite(x) ? String(x) : '');
            }}
            onFocus={() => setBruto(s === '' || !Number.isFinite(n) ? s : fmt(n, false))}
            onBlur={() => setBruto(null)}
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
