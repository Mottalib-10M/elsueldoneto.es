/**
 * Simulador de pensión de jubilación (ES / EN), motor `lib/jubilacion-engine.ts`.
 * Hidratación (RECETTE §17.5): el mes de referencia llega como prop calculada en el build (`hoy`)
 * y el mes real se aplica en useEffect.
 */
import { useEffect, useMemo, useState } from 'react';
import { calcularJubilacion, PARAMS_JUBILACION as PJ, type Situacion } from '../../lib/jubilacion-engine';
import CampoNumero from '../ui/CampoNumero';

type L = 'es' | 'en';
type Cuando = 'ordinaria' | 'voluntaria' | 'involuntaria' | 'demorada';
interface Props { lang?: L; hoy: string; cuandoInicial?: Cuando }

const T = {
  es: {
    anio: 'Año de nacimiento', mes: 'Mes de nacimiento', cotA: 'Años cotizados hasta hoy', cotM: 'Meses adicionales', base: 'Base de cotización mensual actual',
    baseAyuda: 'En tu nómina: «base contingencias comunes»', crec: 'Evolución real de tu base', crecAyuda: 'Por año, sobre la inflación; 0 si no lo sabes',
    sigue: 'Hasta la jubilación', sigueSi: 'Sigo cotizando', sigueNo: 'Dejo de cotizar desde hoy', cuando: 'Cuándo te jubilas',
    cuandos: { ordinaria: 'A la edad ordinaria', voluntaria: 'Anticipada voluntaria', involuntaria: 'Anticipada por despido o ERE', demorada: 'Demorada (más tarde)' },
    mesesMov: 'Meses de adelanto o de demora', sit: 'Situación familiar', sits: { unipersonal: 'Sin cónyuge a cargo', conyugeACargo: 'Con cónyuge a cargo', conyugeNoACargo: 'Con cónyuge no a cargo' },
    avanz: 'Opciones avanzadas: brecha de género, lagunas', hijos: 'Hijos (complemento de brecha de género)', hijosAyuda: 'Lo cobra un solo progenitor, con requisitos', refz: 'Lagunas', refzNo: 'Integración general', refzSi: 'Integración reforzada (DT 41.ª: mujeres)',
    meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    head: 'Pensión de jubilación estimada', mesUd: 'al mes, 14 pagas', anual: 'al año', anios: 'años', y: 'y', m: 'meses',
    edadOrd: 'Tu edad ordinaria de jubilación', fecha: 'Fecha de jubilación simulada', edadJ: 'Edad al jubilarte', cotJ: 'Cotizado al jubilarte', pct: 'Porcentaje por años cotizados',
    brA: 'Base reguladora, fórmula de 2023 (300 meses ÷ 350)', brN: (m: number, b: number, d: string) => `Base reguladora, fórmula ${'nueva'} (${b} mejores de ${m} meses ÷ ${d})`,
    brApl: 'Base reguladora aplicada (la más favorable)', coef: 'Coeficiente reductor', coefTope: 'Coeficiente sobre la pensión máxima (DT 34.ª)', demora: 'Porcentaje adicional por demora',
    calc: 'Pensión contributiva', maxima: 'limitada a la pensión máxima', minimos: 'Complemento a mínimos', minAyuda: (x: string) => `Si tus otros ingresos no superan ${x} al año`, brecha: 'Complemento de brecha de género', compDem: 'Pago anual por demora no absorbida',
    sinDerecho: { carencia: 'Con menos de 15 años cotizados no hay pensión contributiva de jubilación. Puede corresponder la pensión no contributiva, de', carenciaEspecifica: 'No se reúnen 2 años cotizados dentro de los 15 anteriores a la jubilación (carencia específica): no hay pensión contributiva en esa fecha.' },
    avisos: { mesesCotizados: 'No reúnes los años cotizados que exige esta jubilación anticipada (35 la voluntaria, 33 la involuntaria): se muestra la ordinaria.', demasiadoPronto: 'El adelanto pedido supera el máximo legal (24 meses la voluntaria, 48 la involuntaria): se muestra la ordinaria.', pensionMinima: 'La anticipada voluntaria exige que la pensión supere la mínima a los 65 años: se muestra la ordinaria.' },
    hip: 'Importes en euros de 2026: bases pasadas actualizadas por el IPC y sin inflación futura; carrera continua hasta hoy; lagunas anteriores integradas por la base mínima. Estimación orientativa: la cifra oficial es la de la Seguridad Social (Tu Seguridad Social, informe de bases).',
    metodo: 'Cómo calculamos', metodoHref: '/metodologia/', copiar: 'Copiar resultado', compartir: 'Copiar enlace', imprimir: 'Imprimir', copiado: 'Copiado',
  },
  en: {
    anio: 'Year of birth', mes: 'Month of birth', cotA: 'Years of contributions so far', cotM: 'Extra months', base: 'Current monthly contribution base',
    baseAyuda: 'Shown on your payslip', crec: 'Real growth of your base', crecAyuda: 'Per year, above inflation; 0 if unsure',
    sigue: 'Until retirement', sigueSi: 'I keep contributing', sigueNo: 'I stop contributing from today', cuando: 'When you retire',
    cuandos: { ordinaria: 'At the ordinary age', voluntaria: 'Voluntary early retirement', involuntaria: 'Early, after dismissal or ERE', demorada: 'Deferred (later)' },
    mesesMov: 'Months earlier or later', sit: 'Household', sits: { unipersonal: 'No dependent spouse', conyugeACargo: 'Dependent spouse', conyugeNoACargo: 'Spouse not dependent' },
    avanz: 'Advanced options: gender-gap supplement, gaps', hijos: 'Children (gender-gap supplement)', hijosAyuda: 'Paid to one parent only, conditions apply', refz: 'Contribution gaps', refzNo: 'Standard filling', refzSi: 'Enhanced filling (TP 41: women)',
    meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    head: 'Estimated state retirement pension', mesUd: 'per month, 14 payments', anual: 'per year', anios: 'years', y: 'and', m: 'months',
    edadOrd: 'Your ordinary retirement age', fecha: 'Simulated retirement date', edadJ: 'Age at retirement', cotJ: 'Contributions at retirement', pct: 'Percentage for years contributed',
    brA: 'Regulatory base, 2023 formula (300 months ÷ 350)', brN: (m: number, b: number, d: string) => `Regulatory base, new formula (best ${b} of ${m} months ÷ ${d})`,
    brApl: 'Regulatory base applied (the higher one)', coef: 'Reduction coefficient', coefTope: 'Coefficient on the maximum pension (TP 34)', demora: 'Extra percentage for deferral',
    calc: 'Contributory pension', maxima: 'capped at the maximum pension', minimos: 'Top-up to the minimum', minAyuda: (x: string) => `If your other income stays below ${x} a year`, brecha: 'Gender-gap supplement', compDem: 'Annual deferral payment above the cap',
    sinDerecho: { carencia: 'With under 15 years of contributions there is no contributory retirement pension. The non-contributory pension may apply, at', carenciaEspecifica: 'You do not have 2 years of contributions within the 15 years before retiring (specific qualifying period): no contributory pension at that date.' },
    avisos: { mesesCotizados: 'You do not have the contribution years this early retirement requires (35 voluntary, 33 involuntary): the ordinary pension is shown.', demasiadoPronto: 'The requested advance exceeds the legal maximum (24 months voluntary, 48 involuntary): the ordinary pension is shown.', pensionMinima: 'Voluntary early retirement requires a pension above the minimum at 65: the ordinary pension is shown.' },
    hip: 'Amounts in 2026 euros: past bases updated for inflation, no future inflation; continuous career up to today; earlier gaps filled with the minimum base. An estimate: the official figure is the one from Social Security (Tu Seguridad Social, contribution record).',
    metodo: 'How we calculate', metodoHref: '/en/methodology/', copiar: 'Copy result', compartir: 'Copy link', imprimir: 'Print', copiado: 'Copied',
  },
};
const sel = 'h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-charcoal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

export default function Jubilacion({ lang = 'es', hoy, cuandoInicial = 'ordinaria' }: Props) {
  const t = T[lang];
  const loc = lang === 'en' ? 'en-GB' : 'es-ES';
  const eur = (x: number) => new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(x);
  const pctf = (x: number, d = 2) => `${new Intl.NumberFormat(loc, { maximumFractionDigits: d }).format(x)} %`;
  const edadTxt = (m: number) => `${Math.floor(m / 12)} ${t.anios}${m % 12 ? ` ${t.y} ${m % 12} ${t.m}` : ''}`;

  const [ref, setRef] = useState({ hoyAnio: +hoy.slice(0, 4), hoyMes: +hoy.slice(5, 7) });
  const [anio, setAnio] = useState(1964);
  const [mes, setMes] = useState(6);
  const [cotA, setCotA] = useState(35);
  const [cotM, setCotM] = useState(0);
  const [base, setBase] = useState(2400);
  const [crec, setCrec] = useState(0);
  const [sigue, setSigue] = useState(true);
  const [cuando, setCuando] = useState<Cuando>(cuandoInicial);
  const [mov, setMov] = useState(cuandoInicial === 'ordinaria' ? 0 : cuandoInicial === 'demorada' ? 12 : 24);
  const [sit, setSit] = useState<Situacion>('unipersonal');
  const [hijos, setHijos] = useState(0);
  const [refz, setRefz] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const d = new Date(); setRef({ hoyAnio: d.getFullYear(), hoyMes: d.getMonth() + 1 });
    const h = new URLSearchParams(window.location.hash.slice(1));
    if (h.get('a')) setAnio(Math.min(2010, Math.max(1940, Number(h.get('a')) || 1964)));
    if (h.get('c')) setCotA(Math.min(60, Number(h.get('c')) || 0));
    if (h.get('b')) setBase(Math.min(100000, Number(h.get('b')) || 0));
    const q = h.get('q') as Cuando | null; if (q && q in T.es.cuandos) setCuando(q);
    if (h.get('n')) setMov(Math.min(120, Number(h.get('n')) || 0));
  }, []);

  const entrada = { anioNacimiento: anio, mesNacimiento: mes, mesesCotizadosHoy: cotA * 12 + cotM, baseActual: base, crecimientoReal: crec, sigueCotizando: sigue, situacion: sit, hijosBrecha: hijos, lagunasReforzadas: refz, ...ref };
  const r = useMemo(() => {
    const ord = calcularJubilacion({ ...entrada, edadDeseadaMeses: 0, involuntaria: false });
    if (cuando === 'ordinaria' || mov <= 0) return ord;
    const edadOrd = cuando === 'demorada' ? ord.edadOrdinariaMeses : calcularJubilacion({ ...entrada, sigueCotizando: true, edadDeseadaMeses: 0 }).edadOrdinariaMeses;
    const deseada = cuando === 'demorada' ? edadOrd + mov : edadOrd - mov;
    return calcularJubilacion({ ...entrada, edadDeseadaMeses: deseada, involuntaria: cuando === 'involuntaria' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, mes, cotA, cotM, base, crec, sigue, cuando, mov, sit, hijos, refz, ref.hoyAnio, ref.hoyMes]);

  const B = PJ.baseReguladora;
  const nueva = (B.nueva as Record<string, number[]>)[String(r.anioHecho)] ?? B.nuevaDefinitiva;
  const dec = (x: number) => new Intl.NumberFormat(loc, { maximumFractionDigits: 2 }).format(x);
  const fila = (k: string, v: string, fuerte = false) => (
    <tr className="border-t border-gray-100 dark:border-gray-700">
      <td className={`px-4 py-2 ${fuerte ? 'font-semibold text-charcoal dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>{k}</td>
      <td className={`px-4 py-2 text-right tabular-nums ${fuerte ? 'font-bold text-charcoal dark:text-gray-100' : 'font-medium text-charcoal dark:text-gray-200'}`}>{v}</td>
    </tr>
  );
  const enlace = () => `${window.location.origin}${window.location.pathname}#${new URLSearchParams({ a: String(anio), c: String(cotA), b: String(base), q: cuando, n: String(mov) }).toString()}`;
  const copiar = async (txt: string) => { try { await navigator.clipboard.writeText(txt); setAviso(t.copiado); setTimeout(() => setAviso(''), 1500); } catch { /* sin portapapeles */ } };

  return (
    <div className="space-y-6">
      <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero id="jub-anio" label={t.anio} value={anio} onChange={(v) => setAnio(Math.round(v))} max={2010} locale={loc} agrupar={false} />
        <div className="flex h-full flex-col">
          <label htmlFor="jub-mes" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.mes}</label>
          <select id="jub-mes" value={mes} onChange={(e) => setMes(Number(e.target.value))} className={sel}>
            {t.meses.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <CampoNumero id="jub-base" label={t.base} value={base} onChange={setBase} suffix={lang === 'en' ? '€/month' : '€/mes'} max={100000} locale={loc} help={t.baseAyuda} />
        <CampoNumero id="jub-cota" label={t.cotA} value={cotA} onChange={(v) => setCotA(Math.round(v))} suffix={t.anios} max={60} locale={loc} />
        <CampoNumero id="jub-cotm" label={t.cotM} value={cotM} onChange={(v) => setCotM(Math.round(v))} suffix={t.m} max={11} locale={loc} />
        <div className="flex h-full flex-col">
          <label htmlFor="jub-sigue" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.sigue}</label>
          <select id="jub-sigue" value={sigue ? '1' : '0'} onChange={(e) => setSigue(e.target.value === '1')} className={sel}>
            <option value="1">{t.sigueSi}</option><option value="0">{t.sigueNo}</option>
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <div className="flex h-full flex-col">
          <label htmlFor="jub-cuando" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.cuando}</label>
          <select id="jub-cuando" value={cuando} onChange={(e) => { const c = e.target.value as Cuando; setCuando(c); if (c !== 'ordinaria' && mov === 0) setMov(c === 'demorada' ? 12 : 24); }} className={sel}>
            {(Object.keys(t.cuandos) as Cuando[]).map((k) => <option key={k} value={k}>{t.cuandos[k]}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
        <CampoNumero id="jub-mov" label={t.mesesMov} value={cuando === 'ordinaria' ? 0 : mov} onChange={(v) => setMov(Math.round(v))} suffix={t.m} max={120} locale={loc} />
        <div className="flex h-full flex-col">
          <label htmlFor="jub-sit" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.sit}</label>
          <select id="jub-sit" value={sit} onChange={(e) => setSit(e.target.value as Situacion)} className={sel}>
            {(Object.keys(t.sits) as Situacion[]).map((k) => <option key={k} value={k}>{t.sits[k]}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
        </div>
      </form>

      <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <summary className="cursor-pointer text-sm font-medium text-charcoal dark:text-gray-200">{t.avanz}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CampoNumero id="jub-crec" label={t.crec} value={crec} onChange={setCrec} suffix="%" max={10} decimals={1} locale={loc} help={t.crecAyuda} />
          <CampoNumero id="jub-hijos" label={t.hijos} value={hijos} onChange={(v) => setHijos(Math.round(v))} max={20} locale={loc} help={t.hijosAyuda} />
          <div className="flex h-full flex-col">
            <label htmlFor="jub-refz" className="mb-1 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t.refz}</label>
            <select id="jub-refz" value={refz ? '1' : '0'} onChange={(e) => setRefz(e.target.value === '1')} className={sel}>
              <option value="0">{t.refzNo}</option><option value="1">{t.refzSi}</option>
            </select>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{' '}</p>
          </div>
        </div>
      </details>

      <div aria-live="polite" className="space-y-4">
        {r.avisoAnticipada && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">{t.avisos[r.avisoAnticipada]}</p>}
        <div className="rounded-xl bg-blue-50 p-6 text-center dark:bg-blue-900/30">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{t.head}</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-blue-900 dark:text-blue-100">{eur(r.pensionMensual)}</p>
          <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">{r.derecho ? `${t.mesUd} · ${eur(r.pensionAnual)} ${t.anual}` : (r.motivo === 'carencia' ? `${t.sinDerecho.carencia} ${eur(PJ.pensionNoContributivaAnual / 14)} × 14.` : t.sinDerecho.carenciaEspecifica)}</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="w-full text-sm">
            <caption className="sr-only">{t.head}</caption>
            <tbody>
              {fila(t.edadOrd, edadTxt(r.edadOrdinariaMeses))}
              {fila(t.fecha, `${t.meses[r.mesHecho - 1]} ${r.anioHecho}`)}
              {fila(t.edadJ, edadTxt(r.edadJubilacionMeses))}
              {fila(t.cotJ, edadTxt(r.mesesCotizados))}
              {fila(t.pct, pctf(r.porcentaje))}
              {r.baseAntigua !== null && fila(t.brA, eur(r.baseAntigua))}
              {fila(t.brN(nueva[0], nueva[1], dec(nueva[2])), eur(r.baseNueva))}
              {fila(t.brApl, eur(r.baseReguladora), true)}
              {r.coeficiente > 0 && fila(r.coeficienteSobreTope ? t.coefTope : t.coef, `−${pctf(r.coeficiente * 100)} · ${r.mesesAnticipo} ${t.m}`)}
              {r.porcentajeDemora > 0 && fila(t.demora, `+${pctf(r.porcentajeDemora, 0)}`)}
              {r.derecho && fila(`${t.calc}${r.limitadaPorMaxima ? `, ${t.maxima}` : ''}`, eur(r.pensionCalculada))}
              {r.complementoMinimos > 0 && fila(`${t.minimos} (${t.minAyuda(eur(sit === 'conyugeACargo' ? PJ.limiteIngresosMinimos.conConyuge : PJ.limiteIngresosMinimos.sinConyuge))})`, `+${eur(r.complementoMinimos)}`)}
              {r.brecha > 0 && fila(t.brecha, `+${eur(r.brecha)}`)}
              {r.complementoDemoraAnual > 0 && fila(t.compDem, eur(r.complementoDemoraAnual))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => copiar(`${t.head}: ${eur(r.pensionMensual)} ${t.mesUd}`)} className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-charcoal hover:border-brand dark:border-gray-600 dark:text-gray-100">{t.copiar}</button>
          <button type="button" onClick={() => copiar(enlace())} className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-charcoal hover:border-brand dark:border-gray-600 dark:text-gray-100">{t.compartir}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-charcoal hover:border-brand dark:border-gray-600 dark:text-gray-100">{t.imprimir}</button>
          <span role="status" className="text-emerald-800 dark:text-emerald-300">{aviso}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{t.hip} <a href={t.metodoHref} className="underline hover:text-brand">{t.metodo}</a></p>
      </div>
    </div>
  );
}
