/**
 * Champ numérique conforme à RECETTE §4.1 et §17.1–17.2 :
 * - le texte saisi est la source de vérité, le nombre en est dérivé (champ vide = 0 sans réécriture) ;
 * - pendant la frappe, texte brut ; au blur, milliers séparés selon la langue de la page ;
 * - le plafond s'applique au nombre dérivé, jamais au texte, et se signale (role="status") ;
 * - sélection du contenu au focus juste après le rendu, premier relâchement du clic neutralisé.
 */
import { type ChangeEvent, useLayoutEffect, useRef, useState } from 'react';

export function leerNumero(input: string): number {
  const c = input.replace(/[^\d.,-]/g, '');
  const lc = c.lastIndexOf(','), ld = c.lastIndexOf('.');
  let s = c;
  if (lc > ld) s = c.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(c)) s = c.replace(/\./g, '');
  else s = c.replace(/,/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

interface Props {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  help?: string;
  max?: number;
  decimals?: number;
  locale?: string;
  maxLabel?: string;
  /** false pour une année */
  agrupar?: boolean;
}

export default function CampoNumero({ id, label, value, onChange, suffix, help, max = 1e9, decimals = 0, locale = 'es-ES', maxLabel, agrupar = true }: Props) {
  const [foco, setFoco] = useState(false);
  const [texto, setTexto] = useState('');
  const [excede, setExcede] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const seleccionar = useRef(false);
  const guarda = useRef(false);
  useLayoutEffect(() => { if (seleccionar.current) { seleccionar.current = false; ref.current?.select(); } });
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: decimals, useGrouping: agrupar }).format(n);
  const mostrado = foco ? texto : (value === 0 ? '' : fmt(value));
  const pr = !suffix ? 'pr-3' : suffix.length <= 2 ? 'pr-10' : suffix.length <= 6 ? 'pr-16' : 'pr-24';
  const ayudaId = `${id}-ayuda`;
  return (
    <div className="flex h-full flex-col">
      <label htmlFor={id} className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div>
        <div className="relative">
          <input
            ref={ref} id={id} type="text" inputMode="decimal" value={mostrado} placeholder="0"
            aria-describedby={help || excede ? ayudaId : undefined}
            onMouseUp={(e) => { if (guarda.current) { guarda.current = false; e.preventDefault(); } }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const t = e.target.value.replace(/[^0-9.,\s-]/g, '');
              setTexto(t);
              const n = leerNumero(t);
              setExcede(n > max);
              onChange(Math.min(n, max));
            }}
            onFocus={() => { setTexto(value === 0 ? '' : String(value).replace('.', locale.startsWith('es') ? ',' : '.')); setFoco(true); seleccionar.current = true; guarda.current = true; }}
            onBlur={() => { guarda.current = false; setFoco(false); setExcede(false); if (value > max) onChange(max); }}
            className={`h-12 w-full rounded-lg border border-gray-300 bg-white pl-3 text-right text-charcoal shadow-sm tabular-nums focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${pr}`}
          />
          {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 dark:text-gray-300" aria-hidden="true">{suffix}</span>}
        </div>
        {excede
          ? <p id={ayudaId} role="status" className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-300">{maxLabel ?? '≤'} {fmt(max)}{suffix ? ` ${suffix}` : ''}</p>
          : <p id={ayudaId} className="mt-1 text-xs text-gray-600 dark:text-gray-400">{help || ' '}</p>}
      </div>
    </div>
  );
}
