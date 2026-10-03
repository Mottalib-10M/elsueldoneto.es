/**
 * Calculadora de indemnización por despido y finiquito (ES / EN), motor `lib/despido-engine.ts`.
 * Hidratación (RECETTE §17.5): primer render con los valores por defecto y la fecha del build
 * (`hoy`, prop calculada en Astro); el enlace compartido y la fecha del día se aplican en useEffect.
 */
import { useEffect, useMemo, useState } from 'react';
import { calcularDespido, type TipoExtincion, type Pagas } from '../../lib/despido-engine';
import CampoNumero from '../ui/CampoNumero';

type L = 'es' | 'en';
interface Props { lang?: L; hoy: string; enfoque?: 'indemnizacion' | 'finiquito'; tipoInicial?: TipoExtincion; inicioInicial?: string; salarioInicial?: number }

const T = {
  es: {
    inicio: 'Fecha de alta en la empresa', fin: 'Último día trabajado', salario: 'Salario bruto anual', salarioAyuda: 'Con pagas extra y pluses fijos',
    tipo: 'Motivo de la extinción', pagas: 'Pagas extra',
    tipos: { improcedente: 'Despido improcedente', objetivo: 'Despido objetivo', ere: 'Despido colectivo (ERE)', 'fin-contrato': 'Fin de contrato temporal', voluntaria: 'Baja voluntaria', procedente: 'Despido disciplinario procedente' },
    pagas14: '14 pagas (extras aparte)', pagas12: '12 pagas (extras prorrateadas)',
    avanzadas: 'Opciones avanzadas: vacaciones, ERE, IRPF', vacAnual: 'Vacaciones al año', vacDisfr: 'Vacaciones ya disfrutadas este año', dias: 'días',
    ereDias: 'Días por año pactados en el ERE', ereTope: 'Tope pactado', mens: 'mensualidades', preaviso: 'Días de preaviso no concedidos',
    causa: 'Causa del despido objetivo', causaEco: 'Económica, técnica, organizativa o de producción (art. 52.c)', causaOtra: 'Otra causa (ineptitud, absentismo…)',
    concil: '¿Improcedencia reconocida en conciliación o sentencia?', si: 'Sí', no: 'No', mesCompleto: 'Fracción de mes', mesSi: 'Cuenta como mes completo', mesNo: 'Prorrateo por días',
    headInd: 'Indemnización por despido', headFin: 'Total a cobrar (finiquito + indemnización)', bruto: 'bruto',
    antig: 'Antigüedad', anios: 'años', meses: 'meses', diasInd: 'Días de indemnización', regla: 'Regla aplicada',
    reglas: { dias: 'Días por año de servicio, sin tope', tope24: 'Tope de 24 mensualidades (art. 56.1 ET)', tope720: 'Tope de 720 días (DT 11.ª ET)', topePre2012: 'Tope: los días generados antes del 12/02/2012 (DT 11.ª ET)', tope42: 'Tope absoluto de 42 mensualidades (DT 11.ª ET)', tope12: 'Tope de 12 mensualidades (art. 53.1.b ET)', topePactado: 'Tope pactado en el ERE', sin: 'Sin indemnización legal' },
    tramoA: 'Hasta el 11/02/2012, a 45 días', tramoB: 'Desde el 12/02/2012, a 33 días', diario: 'Salario diario (anual ÷ 365)',
    exenta: 'Exenta de IRPF', sujeta: 'Sujeta a IRPF', red: 'Reducción del 30 % (art. 18.2 LIRPF)',
    finiq: 'Finiquito', salPend: 'Salario del mes', vac: 'Vacaciones no disfrutadas', paga: { verano: 'Paga extra de verano (parte proporcional)', navidad: 'Paga extra de Navidad (parte proporcional)' }, pre: 'Preaviso no concedido',
    totFin: 'Total finiquito', total: 'Total bruto', ind: 'Indemnización',
    fechas: 'La fecha de fin es anterior a la de alta: revisa las fechas.',
    copiar: 'Copiar resultado', compartir: 'Copiar enlace', imprimir: 'Imprimir', copiado: 'Copiado',
    hip: 'Hipótesis: salario regulador = salario anual ÷ 365; pagas extra devengadas por semestre (verano de enero a junio, Navidad de julio a diciembre); el finiquito tributa como nómina. Estimación orientativa que no sustituye la carta de despido, el convenio ni el asesoramiento profesional.',
    metodo: 'Cómo calculamos', metodoHref: '/metodologia/',
  },
  en: {
    inicio: 'Start date at the company', fin: 'Last day worked', salario: 'Gross annual salary', salarioAyuda: 'Including extra payments and fixed bonuses',
    tipo: 'Reason the contract ended', pagas: 'Extra payments (pagas extra)',
    tipos: { improcedente: 'Unfair dismissal (improcedente)', objetivo: 'Objective dismissal (objetivo)', ere: 'Collective redundancy (ERE)', 'fin-contrato': 'End of temporary contract', voluntaria: 'Resignation', procedente: 'Fair disciplinary dismissal' },
    pagas14: '14 payments (extras paid separately)', pagas12: '12 payments (extras spread monthly)',
    avanzadas: 'Advanced options: holidays, ERE, income tax', vacAnual: 'Holiday entitlement per year', vacDisfr: 'Holiday days already taken this year', dias: 'days',
    ereDias: 'Days per year agreed in the ERE', ereTope: 'Agreed cap', mens: 'months’ pay', preaviso: 'Notice days not given',
    causa: 'Grounds for the objective dismissal', causaEco: 'Economic, technical, organisational or production (art. 52.c)', causaOtra: 'Other grounds (incapacity, absences…)',
    concil: 'Unfairness acknowledged at conciliation or in court?', si: 'Yes', no: 'No', mesCompleto: 'Part months', mesSi: 'Count as a full month', mesNo: 'Pro rata by days',
    headInd: 'Dismissal compensation', headFin: 'Total due (final pay + compensation)', bruto: 'gross',
    antig: 'Length of service', anios: 'years', meses: 'months', diasInd: 'Days of compensation', regla: 'Rule applied',
    reglas: { dias: 'Days per year of service, no cap reached', tope24: '24 months’ pay cap (art. 56.1 ET)', tope720: '720-day cap (transitional provision 11, ET)', topePre2012: 'Cap: the days earned before 12/02/2012 (TP 11, ET)', tope42: 'Absolute cap of 42 months’ pay (TP 11, ET)', tope12: '12 months’ pay cap (art. 53.1.b ET)', topePactado: 'Cap agreed in the ERE', sin: 'No statutory compensation' },
    tramoA: 'Up to 11/02/2012, at 45 days', tramoB: 'From 12/02/2012, at 33 days', diario: 'Daily salary (annual ÷ 365)',
    exenta: 'Exempt from income tax', sujeta: 'Taxable', red: '30% reduction (art. 18.2 IRPF Act)',
    finiq: 'Final pay (finiquito)', salPend: 'Salary for the month', vac: 'Untaken holidays', paga: { verano: 'Summer extra payment (accrued part)', navidad: 'Christmas extra payment (accrued part)' }, pre: 'Notice not given',
    totFin: 'Total final pay', total: 'Total gross', ind: 'Compensation',
    fechas: 'The end date is before the start date: check the dates.',
    copiar: 'Copy result', compartir: 'Copy link', imprimir: 'Print', copiado: 'Copied',
    hip: 'Assumptions: daily salary = annual salary ÷ 365; extra payments accrue by half-year (summer January to June, Christmas July to December); final pay is taxed like a payslip. An estimate that does not replace the dismissal letter, your collective agreement or professional advice.',
    metodo: 'How we calculate', metodoHref: '/en/methodology/',
  },
};

const sel = 'h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-charcoal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

export default function IndemnizacionDespido({ lang = 'es', hoy, enfoque = 'indemnizacion', tipoInicial = 'improcedente', inicioInicial = '2018-03-01', salarioInicial = 28000 }: Props) {
  const t = T[lang];
  const loc = lang === 'en' ? 'en-GB' : 'es-ES';
  const eur = (x: number) => new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(x);
  const num = (x: number, d = 0) => new Intl.NumberFormat(loc, { maximumFractionDigits: d }).format(x);

  const [inicio, setInicio] = useState(inicioInicial);
  const [fin, setFin] = useState(hoy);
  const [salario, setSalario] = useState(salarioInicial);
  const [tipo, setTipo] = useState<TipoExtincion>(tipoInicial);
  const [pagas, setPagas] = useState<Pagas>('14');
  const [vacAnual, setVacAnual] = useState(30);
  const [vacDisfr, setVacDisfr] = useState(0);
  const [ereDias, setEreDias] = useState(20);
  const [ereTope, setEreTope] = useState(12);
  const [preaviso, setPreaviso] = useState(0);
  const [causaEco, setCausaEco] = useState(true);
  const [concil, setConcil] = useState(true);
  const [mesCompleto, setMesCompleto] = useState(true);
  const [aviso, setAviso] = useState('');

  // Fecha del día y enlace compartido: después de la hidratación (RECETTE §17.5)
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const d = new Date(); const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setFin(h.get('fin') ?? iso);
    if (h.get('ini')) setInicio(h.get('ini')!);
    if (h.get('s')) setSalario(Math.min(5_000_000, Number(h.get('s')) || 0));
    const tp = h.get('t') as TipoExtincion | null;
    if (tp && tp in T.es.tipos) setTipo(tp);
    if (h.get('p') === '12') setPagas('12');
  }, []);

  const r = useMemo(() => calcularDespido({
    inicio, fin, salarioAnual: salario, tipo, pagas, vacacionesAnuales: vacAnual, vacacionesDisfrutadas: vacDisfr,
    ereDias, ereTopeMensualidades: ereTope, preavisoOmitido: preaviso, causaEconomica: causaEco, reconocidaConciliacion: concil, mesCompleto,
  }), [inicio, fin, salario, tipo, pagas, vacAnual, vacDisfr, ereDias, ereTope, preaviso, causaEco, concil, mesCompleto]);

  const head = enfoque === 'finiquito' ? t.headFin : t.headInd;
  const headVal = enfoque === 'finiquito' ? r.total : r.indemnizacion;
  const aniosEnteros = Math.floor(r.mesesServicio / 12);
  const mesesResto = Math.round(r.mesesServicio - aniosEnteros * 12);
  const pctInd = r.total > 0 ? (r.indemnizacion / r.total) * 100 : 0;

  const enlace = () => `${window.location.origin}${window.location.pathname}#${new URLSearchParams({ ini: inicio, fin, s: String(salario), t: tipo, p: pagas }).toString()}`;
  const copiar = async (txt: string) => { try { await navigator.clipboard.writeText(txt); setAviso(t.copiado); setTimeout(() => setAviso(''), 1500); } catch { /* sin portapapeles */ } };
  const resumen = () => `${head}: ${eur(headVal)} (${t.antig.toLowerCase()} ${aniosEnteros} ${t.anios} ${mesesResto} ${t.meses}; ${t.ind.toLowerCase()} ${eur(r.indemnizacion)}; ${t.finiq.toLowerCase()} ${eur(r.finiquito)})`;

  const fila = (k: string, v: string, fuerte = false) => (
    <tr className="border-t border-gray-100 dark:border-gray-700">
      <td className={`px-4 py-2 ${fuerte ? 'font-semibold text-charcoal dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>{k}</td>
      <td className={`px-4 py-2 text-right tabular-nums ${fuerte ? 'font-bold text-charcoal dark:text-gray-100' : 'font-medium text-charcoal dark:text-gray-200'}`}>{v}</td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        <div className="flex h-full flex-col">
          <label htmlFor="dsp-inicio" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.inicio}</label>
          <input id="dsp-inicio" type="date" value={inicio} min="1960-01-01" max={fin} onChange={(e) => e.target.value && setInicio(e.target.value)} className={sel} />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <div className="flex h-full flex-col">
          <label htmlFor="dsp-fin" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.fin}</label>
          <input id="dsp-fin" type="date" value={fin} min={inicio} max="2045-12-31" onChange={(e) => e.target.value && setFin(e.target.value)} className={sel} />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <CampoNumero id="dsp-salario" label={t.salario} value={salario} onChange={setSalario} suffix={lang === 'en' ? '€/year' : '€/año'} max={5_000_000} locale={loc} help={t.salarioAyuda} />
        <div className="flex h-full flex-col">
          <label htmlFor="dsp-tipo" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.tipo}</label>
          <select id="dsp-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoExtincion)} className={sel}>
            {(Object.keys(t.tipos) as TipoExtincion[]).map((k) => <option key={k} value={k}>{t.tipos[k]}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <div className="flex h-full flex-col">
          <label htmlFor="dsp-pagas" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.pagas}</label>
          <select id="dsp-pagas" value={pagas} onChange={(e) => setPagas(e.target.value as Pagas)} className={sel}>
            <option value="14">{t.pagas14}</option><option value="12">{t.pagas12}</option>
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <CampoNumero id="dsp-vacdisfr" label={t.vacDisfr} value={vacDisfr} onChange={setVacDisfr} suffix={t.dias} max={60} locale={loc} />
      </form>

      <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <summary className="cursor-pointer text-sm font-medium text-charcoal dark:text-gray-200">{t.avanzadas}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CampoNumero id="dsp-vacanual" label={t.vacAnual} value={vacAnual} onChange={setVacAnual} suffix={t.dias} max={60} locale={loc} />
          <CampoNumero id="dsp-preaviso" label={t.preaviso} value={preaviso} onChange={setPreaviso} suffix={t.dias} max={15} locale={loc} />
          <div className="flex h-full flex-col">
            <label htmlFor="dsp-mes" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.mesCompleto}</label>
            <select id="dsp-mes" value={mesCompleto ? '1' : '0'} onChange={(e) => setMesCompleto(e.target.value === '1')} className={sel}>
              <option value="1">{t.mesSi}</option><option value="0">{t.mesNo}</option>
            </select>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
          </div>
          <CampoNumero id="dsp-eredias" label={t.ereDias} value={ereDias} onChange={setEreDias} suffix={t.dias} max={90} locale={loc} />
          <CampoNumero id="dsp-eretope" label={t.ereTope} value={ereTope} onChange={setEreTope} suffix={t.mens} max={60} locale={loc} />
          <div className="flex h-full flex-col">
            <label htmlFor="dsp-causa" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.causa}</label>
            <select id="dsp-causa" value={causaEco ? '1' : '0'} onChange={(e) => setCausaEco(e.target.value === '1')} className={sel}>
              <option value="1">{t.causaEco}</option><option value="0">{t.causaOtra}</option>
            </select>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
          </div>
          <div className="flex h-full flex-col">
            <label htmlFor="dsp-concil" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.concil}</label>
            <select id="dsp-concil" value={concil ? '1' : '0'} onChange={(e) => setConcil(e.target.value === '1')} className={sel}>
              <option value="1">{t.si}</option><option value="0">{t.no}</option>
            </select>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
          </div>
        </div>
      </details>

      <div aria-live="polite" className="space-y-4">
        {!r.valido ? (
          <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">{t.fechas}</p>
        ) : (
          <>
            <div className="rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-900/30">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{head}, {t.bruto}</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-emerald-900 dark:text-emerald-200">{eur(headVal)}</p>
              <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-200">{t.regla}: {t.reglas[r.regla as keyof typeof t.reglas] ?? r.regla}</p>
              {r.total > 0 && (
                <div className="mx-auto mt-4 flex h-3 max-w-md overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-800" aria-hidden="true">
                  <div className="h-full bg-emerald-700" style={{ width: `${pctInd}%` }} />
                </div>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full text-sm">
                <caption className="sr-only">{head}</caption>
                <tbody>
                  {fila(t.antig, `${aniosEnteros} ${t.anios} ${mesesResto} ${t.meses}`)}
                  {fila(t.diario, eur(r.salarioDiario))}
                  {r.tramoAnterior2012 && tipo === 'improcedente' && fila(t.tramoA, `${num(r.tramoAnterior2012.meses)} ${t.meses} · ${num(r.tramoAnterior2012.dias, 1)} ${t.dias}`)}
                  {r.tramoPosterior2012 && r.tramoAnterior2012 && tipo === 'improcedente' && fila(t.tramoB, `${num(r.tramoPosterior2012.meses)} ${t.meses} · ${num(r.tramoPosterior2012.dias, 1)} ${t.dias}`)}
                  {fila(t.diasInd, `${num(r.diasIndemnizacion, 1)} ${t.dias}`)}
                  {fila(t.ind, eur(r.indemnizacion), true)}
                  {r.indemnizacion > 0 && fila(t.exenta, eur(r.exenta))}
                  {r.indemnizacion > 0 && fila(t.sujeta, eur(r.sujeta))}
                  {r.reduccion30 > 0 && fila(t.red, `−${eur(r.reduccion30)}`)}
                  {fila(t.salPend, eur(r.salarioPendiente))}
                  {fila(`${t.vac} (${num(r.vacacionesPendientesDias, 1)} ${t.dias})`, eur(r.vacacionesImporte))}
                  {r.pagaExtraNombre && fila(t.paga[r.pagaExtraNombre], eur(r.pagaExtraImporte))}
                  {r.preavisoImporte > 0 && fila(t.pre, eur(r.preavisoImporte))}
                  {fila(t.totFin, eur(r.finiquito), true)}
                  {fila(t.total, eur(r.total), true)}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button type="button" onClick={() => copiar(resumen())} className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-charcoal hover:border-brand dark:border-gray-600 dark:text-gray-100">{t.copiar}</button>
              <button type="button" onClick={() => copiar(enlace())} className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-charcoal hover:border-brand dark:border-gray-600 dark:text-gray-100">{t.compartir}</button>
              <button type="button" onClick={() => window.print()} className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-charcoal hover:border-brand dark:border-gray-600 dark:text-gray-100">{t.imprimir}</button>
              <span role="status" className="text-emerald-800 dark:text-emerald-300">{aviso}</span>
            </div>
          </>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-400">{t.hip} <a href={t.metodoHref} className="underline hover:text-brand">{t.metodo}</a></p>
      </div>
    </div>
  );
}
