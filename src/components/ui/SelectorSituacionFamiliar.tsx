import type { SituacionFamiliar } from '../../lib/irpf-engine';

interface SelectorSituacionFamiliarProps {
  value: SituacionFamiliar;
  onChange: (situacion: SituacionFamiliar) => void;
  lang?: 'es' | 'en';
}

export default function SelectorSituacionFamiliar({
  value,
  onChange,
  lang = 'es',
}: SelectorSituacionFamiliarProps) {
  const l = lang === 'en';
  const update = (partial: Partial<SituacionFamiliar>) =>
    onChange({ ...value, ...partial });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {l ? 'Family situation' : 'Situación familiar'}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="conyuge" className="block text-xs text-gray-500 dark:text-gray-400">
            {l ? 'Marital status' : 'Estado civil'}
          </label>
          <select
            id="conyuge"
            value={value.conyuge}
            onChange={(e) => update({ conyuge: e.target.value as SituacionFamiliar['conyuge'] })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="soltero">{l ? 'Single' : 'Soltero/a'}</option>
            <option value="con-ingresos">{l ? 'Married (spouse with income)' : 'Casado/a (cónyuge con ingresos)'}</option>
            <option value="sin-ingresos">{l ? 'Married (spouse without income)' : 'Casado/a (cónyuge sin ingresos)'}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="hijos" className="block text-xs text-gray-500 dark:text-gray-400">
            {l ? 'Number of children' : 'Número de hijos'}
          </label>
          <select
            id="hijos"
            value={value.hijos}
            onChange={(e) => {
              const hijos = Number(e.target.value);
              update({
                hijos,
                hijosMenores3: Math.min(value.hijosMenores3, hijos),
              });
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {value.hijos > 0 && (
          <div className="space-y-1">
            <label htmlFor="hijosMenores3" className="block text-xs text-gray-500 dark:text-gray-400">
              {l ? 'Children under 3' : 'Hijos menores de 3 años'}
            </label>
            <select
              id="hijosMenores3"
              value={value.hijosMenores3}
              onChange={(e) => update({ hijosMenores3: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {Array.from({ length: value.hijos + 1 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="edad" className="block text-xs text-gray-500 dark:text-gray-400">
            {l ? 'Your age' : 'Tu edad'}
          </label>
          <input
            id="edad"
            type="text"
            inputMode="decimal"
            min={16}
            max={99}
            value={value.edad}
            onChange={(e) => update({ edad: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="discapacidad" className="block text-xs text-gray-500 dark:text-gray-400">
            {l ? 'Disability' : 'Discapacidad'}
          </label>
          <select
            id="discapacidad"
            value={value.discapacidad}
            onChange={(e) => update({ discapacidad: Number(e.target.value) as 0 | 33 | 65 })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value={0}>{l ? 'No disability' : 'Sin discapacidad'}</option>
            <option value={33}>33% - 64%</option>
            <option value={65}>{l ? '65% or higher' : '65% o superior'}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="ascendientes65" className="block text-xs text-gray-500 dark:text-gray-400">
            {l ? 'Dependant ascendants (+65)' : 'Ascendientes a cargo (+65)'}
          </label>
          <select
            id="ascendientes65"
            value={value.ascendientes65}
            onChange={(e) => {
              const asc65 = Number(e.target.value);
              update({
                ascendientes65: asc65,
                ascendientes75: Math.min(value.ascendientes75, asc65),
              });
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {[0, 1, 2].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
