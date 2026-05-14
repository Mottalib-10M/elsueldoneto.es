import type { SituacionFamiliar } from '../../lib/irpf-engine';

interface SelectorSituacionFamiliarProps {
  value: SituacionFamiliar;
  onChange: (situacion: SituacionFamiliar) => void;
}

export default function SelectorSituacionFamiliar({
  value,
  onChange,
}: SelectorSituacionFamiliarProps) {
  const update = (partial: Partial<SituacionFamiliar>) =>
    onChange({ ...value, ...partial });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Situación familiar
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="conyuge" className="block text-xs text-gray-500 dark:text-gray-400">
            Estado civil
          </label>
          <select
            id="conyuge"
            value={value.conyuge}
            onChange={(e) => update({ conyuge: e.target.value as SituacionFamiliar['conyuge'] })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="soltero">Soltero/a</option>
            <option value="con-ingresos">Casado/a (cónyuge con ingresos)</option>
            <option value="sin-ingresos">Casado/a (cónyuge sin ingresos)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="hijos" className="block text-xs text-gray-500 dark:text-gray-400">
            Número de hijos
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
              Hijos menores de 3 años
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
            Tu edad
          </label>
          <input
            id="edad"
            type="number"
            min={16}
            max={99}
            value={value.edad}
            onChange={(e) => update({ edad: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="discapacidad" className="block text-xs text-gray-500 dark:text-gray-400">
            Discapacidad
          </label>
          <select
            id="discapacidad"
            value={value.discapacidad}
            onChange={(e) => update({ discapacidad: Number(e.target.value) as 0 | 33 | 65 })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-charcoal shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value={0}>Sin discapacidad</option>
            <option value={33}>33% - 64%</option>
            <option value={65}>65% o superior</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="ascendientes65" className="block text-xs text-gray-500 dark:text-gray-400">
            Ascendientes a cargo (+65)
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
