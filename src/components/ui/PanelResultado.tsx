import { formatEuros, formatPercent } from '../../lib/format-es';
import type { DesgloseSueldo } from '../../lib/irpf-engine';

interface PanelResultadoProps {
  resultado: DesgloseSueldo;
  lang?: 'es' | 'en';
}

export default function PanelResultado({ resultado, lang = 'es' }: PanelResultadoProps) {
  const l = lang === 'en';
  const {
    brutoAnual,
    netoAnual,
    netoMensual,
    irpfTotalAnual,
    seguridadSocialAnual,
    tipoEfectivoIRPF,
    tipoEfectivoTotal,
    pagas,
  } = resultado;

  return (
    <div className="space-y-6">
      {/* Hero result */}
      <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center dark:from-gray-700 dark:to-gray-800">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {l ? 'Your monthly net salary' : 'Tu sueldo neto mensual'} ({pagas} pagas)
        </p>
        <p className="mt-1 text-4xl font-bold text-brand md:text-5xl">
          {formatEuros(netoMensual)}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {formatEuros(netoAnual)} {l ? 'net per year' : 'netos al año'}
        </p>
      </div>

      {/* Breakdown bar */}
      <BarraDesglose resultado={resultado} lang={lang} />

      {/* Detail table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <FilaTabla label={l ? 'Annual gross salary' : 'Salario bruto anual'} value={formatEuros(brutoAnual)} bold />
            <FilaTabla
              label={l ? 'Social Security (employee)' : 'Seguridad Social (empleado)'}
              value={`-${formatEuros(seguridadSocialAnual)}`}
              sublabel={formatPercent(seguridadSocialAnual / brutoAnual)}
              negative
            />
            <FilaTabla
              label={l ? 'Total income tax (IRPF)' : 'IRPF total'}
              value={`-${formatEuros(irpfTotalAnual)}`}
              sublabel={`${l ? 'Effective rate:' : 'Tipo efectivo:'} ${formatPercent(tipoEfectivoIRPF)}`}
              negative
            />
            {resultado.irpfEstatalAnual > 0 && (
              <>
                <FilaTabla
                  label={l ? '  · State IRPF' : '  · IRPF estatal'}
                  value={`-${formatEuros(resultado.irpfEstatalAnual)}`}
                  indent
                />
                <FilaTabla
                  label={l ? '  · Regional IRPF' : '  · IRPF autonómico'}
                  value={`-${formatEuros(resultado.irpfAutonomicoAnual)}`}
                  indent
                />
              </>
            )}
            {resultado.bonificacionCeutaMelilla > 0 && (
              <FilaTabla
                label="  · Bonificación Ceuta/Melilla"
                value={`+${formatEuros(resultado.bonificacionCeutaMelilla)}`}
                indent
              />
            )}
            <FilaTabla
              label={l ? 'Annual net salary' : 'Salario neto anual'}
              value={formatEuros(netoAnual)}
              bold
              highlight
            />
            <FilaTabla
              label={`${l ? 'Monthly net' : 'Neto mensual'} (${pagas} pagas)`}
              value={formatEuros(netoMensual)}
              bold
              highlight
            />
            <FilaTabla
              label={l ? 'Total effective withholding' : 'Retención total efectiva'}
              value={formatPercent(tipoEfectivoTotal)}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarraDesglose({ resultado, lang = 'es' }: { resultado: DesgloseSueldo; lang?: 'es' | 'en' }) {
  const l = lang === 'en';
  const { brutoAnual, seguridadSocialAnual, irpfTotalAnual, netoAnual } = resultado;
  if (brutoAnual <= 0) return null;

  const pctSS = (seguridadSocialAnual / brutoAnual) * 100;
  const pctIRPF = (irpfTotalAnual / brutoAnual) * 100;
  const pctNeto = (netoAnual / brutoAnual) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-8 overflow-hidden rounded-full">
        <div
          className="flex items-center justify-center bg-brand text-xs font-medium text-white transition-all"
          style={{ width: `${pctIRPF}%` }}
          title={`IRPF: ${pctIRPF.toFixed(1)}%`}
        >
          {pctIRPF > 8 && 'IRPF'}
        </div>
        <div
          className="flex items-center justify-center bg-amber-500 text-xs font-medium text-white transition-all"
          style={{ width: `${pctSS}%` }}
          title={`SS: ${pctSS.toFixed(1)}%`}
        >
          {pctSS > 5 && 'SS'}
        </div>
        <div
          className="flex items-center justify-center bg-emerald-500 text-xs font-medium text-white transition-all"
          style={{ width: `${pctNeto}%` }}
          title={`${l ? 'Net' : 'Neto'}: ${pctNeto.toFixed(1)}%`}
        >
          {l ? 'Net' : 'Neto'}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand" /> IRPF {pctIRPF.toFixed(1)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> SS {pctSS.toFixed(1)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> {l ? 'Net' : 'Neto'} {pctNeto.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function FilaTabla({
  label,
  value,
  sublabel,
  bold,
  negative,
  highlight,
  indent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  bold?: boolean;
  negative?: boolean;
  highlight?: boolean;
  indent?: boolean;
}) {
  return (
    <tr
      className={[
        'border-b border-gray-100 dark:border-gray-700',
        highlight ? 'bg-emerald-50 dark:bg-emerald-900/20' : '',
      ].join(' ')}
    >
      <td
        className={[
          'px-4 py-2',
          bold ? 'font-semibold text-charcoal dark:text-gray-100' : 'text-gray-600 dark:text-gray-300',
          indent ? 'pl-8 text-xs' : '',
        ].join(' ')}
      >
        {label}
        {sublabel && (
          <span className="ml-2 text-xs text-gray-400">({sublabel})</span>
        )}
      </td>
      <td
        className={[
          'px-4 py-2 text-right tabular-nums',
          bold ? 'font-semibold' : '',
          negative ? 'text-red-600 dark:text-red-400' : '',
          highlight ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-charcoal dark:text-gray-100',
        ].join(' ')}
      >
        {value}
      </td>
    </tr>
  );
}
