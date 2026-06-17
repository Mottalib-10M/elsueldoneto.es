import { comunidadesAutonomas, type CCAACodigo } from '../../data/comunidades-autonomas';

interface SelectorCCAAProps {
  value: CCAACodigo;
  onChange: (ccaa: CCAACodigo) => void;
  id?: string;
  lang?: 'es' | 'en';
}

const ccaaOrdenadas = [...comunidadesAutonomas].sort((a, b) =>
  a.nombre.localeCompare(b.nombre, 'es')
);

export default function SelectorCCAA({ value, onChange, id = 'ccaa', lang = 'es' }: SelectorCCAAProps) {
  return (
    <div className="flex h-full flex-col">
      <label htmlFor={id} className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {lang === 'en' ? 'Autonomous Community' : 'Comunidad Autónoma'}
      </label>
      <div>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as CCAACodigo)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-charcoal shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          {ccaaOrdenadas.map((ccaa) => (
            <option key={ccaa.codigo} value={ccaa.codigo}>
              {ccaa.nombre}{ccaa.esForal ? ' (Foral)' : ''}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">{' '}</p>
      </div>
    </div>
  );
}
