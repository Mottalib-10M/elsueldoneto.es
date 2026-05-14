import { formatEuros, formatPercent } from '../../lib/format-es';
import type { DesgloseSueldo } from '../../lib/irpf-engine';

interface PanelResultadoProps {
  resultado: DesgloseSueldo;
}

export default function PanelResultado({ resultado }: PanelResultadoProps) {
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
          Tu sueldo neto mensual ({pagas} pagas)
        </p>
        <p className="mt-1 text-4xl font-bold text-brand md:text-5xl">
          {formatEuros(netoMensual)}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {formatEuros(netoAnual)} netos al año
        </p>
      </div>

      {/* Breakdown bar */}
      <BarraDesglose resultado={resultado} />

      {/* Detail table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm">
          <tbody>
            <FilaTabla label="Salario bruto anual" value={formatEuros(brutoAnual)} bold />
            <FilaTabla
              label="Seguridad Social (empleado)"
              value={`-${formatEuros(seguridadSocialAnual)}`}
              sublabel={formatPercent(seguridadSocialAnual / brutoAnual)}
              negative
            />
            <FilaTabla
              label="IRPF total"
              value={`-${formatEuros(irpfTotalAnual)}`}
              sublabel={`Tipo efectivo: ${formatPercent(tipoEfectivoIRPF)}`}
              negative
            />
            {resultado.irpfEstatalAnual > 0 && (
              <>
                <FilaTabla
                  label="  · IRPF estatal"
                  value={`-${formatEuros(resultado.irpfEstatalAnual)}`}
                  indent
                />
                <FilaTabla
                  label="  · IRPF autonómico"
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
              label="Salario neto anual"
              value={formatEuros(netoAnual)}
              bold
              highlight
            />
            <FilaTabla
              label={`Neto mensual (${pagas} pagas)`}
              value={formatEuros(netoMensual)}
              bold
              highlight
            />
            <FilaTabla
              label="Retención total efectiva"
              value={formatPercent(tipoEfectivoTotal)}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarraDesglose({ resultado }: { resultado: DesgloseSueldo }) {
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
          title={`Neto: ${pctNeto.toFixed(1)}%`}
        >
          Neto
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
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Neto {pctNeto.toFixed(1)}%
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
