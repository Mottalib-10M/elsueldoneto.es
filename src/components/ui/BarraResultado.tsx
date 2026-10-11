/**
 * Barre collante du téléphone (RECETTE §5, règle du 2026-10-11) : tant que le bloc du résultat
 * (`[data-resultat]`, son parent) est sous l'écran, une barre en bas montre le chiffre clé
 * (`[data-cle]`) et son intitulé (`[data-cle-label]`). Elle lit le texte déjà affiché dans le
 * résultat, côté client : rien n'est dupliqué dans le HTML. Masquée sur ordinateur (lg:hidden),
 * où le résultat est déjà à côté des champs.
 */
import { useEffect, useRef, useState } from 'react';

export default function BarraResultado() {
  const ancla = useRef<HTMLSpanElement>(null);
  const caja = useRef<HTMLElement | null>(null);
  const [abajo, setAbajo] = useState(false);
  const [cifra, setCifra] = useState<{ l: string; v: string } | null>(null);

  useEffect(() => {
    const box = ancla.current?.closest('[data-resultat]') as HTMLElement | null;
    if (!box) return;
    caja.current = box;
    const leer = () => {
      const v = box.querySelector('[data-cle]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const l = box.querySelector('[data-cle-label]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      setCifra((prev) => (!v ? null : prev && prev.v === v && prev.l === l ? prev : { l, v }));
    };
    leer();
    const mo = new MutationObserver(leer);
    mo.observe(box, { subtree: true, childList: true, characterData: true });
    if (typeof IntersectionObserver === 'undefined') return () => mo.disconnect();
    const io = new IntersectionObserver(([e]) => setAbajo(!e.isIntersecting && e.boundingClientRect.top > 0));
    io.observe(box);
    return () => { mo.disconnect(); io.disconnect(); };
  }, []);

  return (
    <span ref={ancla} className="contents">
      {abajo && cifra && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => caja.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed inset-x-0 bottom-0 z-40 flex items-baseline justify-between gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 text-left shadow-lg backdrop-blur lg:hidden dark:border-gray-700 dark:bg-gray-800/95"
        >
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{cifra.l}</span>
          <span className="tabular-nums text-xl font-bold text-brand">{cifra.v}</span>
        </button>
      )}
    </span>
  );
}
