/**
 * Motor de la pensión de jubilación contributiva (Régimen General, España).
 *
 * Reglas leídas en el BOE consolidado el 2026-10-03 (ver `data/params-jubilacion-2026.json`):
 * - Edad ordinaria: DT 7.ª LGSS (2026: 65 años con 38 años y 3 meses cotizados, si no 66 años y
 *   10 meses; desde 2027: 65 con 38 años y 6 meses, si no 67).
 * - Base reguladora: se calculan las dos fórmulas y se aplica la más favorable (DT 4.ª.7 LGSS,
 *   hechos causantes de 2026 a 2040): la de 2023 (300 bases ÷ 350) y la transitoria de la DT 40.ª
 *   (2026: las 302 mejores bases de los 304 meses ÷ 352,33; 2037 en adelante, art. 209.1: las 324
 *   mejores de 348 ÷ 378). Lagunas: 48 meses a la base mínima y el resto al 50 % (art. 209.1.b),
 *   reforzadas para mujeres (DT 41.ª).
 * - Porcentaje: 50 % por 15 años y escala de la DT 9.ª (2023-2026: 49 meses a 0,21 y 209 a 0,19;
 *   desde 2027: 248 a 0,19 y 16 a 0,18), máximo 100 %.
 * - Anticipada: coeficientes por mes de los arts. 207 (involuntaria, hasta 48 meses, 33 años
 *   cotizados) y 208 (voluntaria, hasta 24 meses, 35 años); si la pensión supera la máxima, la
 *   voluntaria aplica sobre la máxima los coeficientes de la DT 34.ª del año.
 * - Demora: 4 % por año completo, 2 % por semestre a partir del segundo año (art. 210.2).
 * - Pensión máxima 3359,60 €/mes y mínimas del anexo I del RDL 3/2026.
 *
 * Importes en euros de 2026: las bases pasadas se suponen actualizadas por el IPC (lo que hace la
 * Seguridad Social salvo en los 24 últimos meses) y la inflación futura no se proyecta.
 */
import P from '../data/params-jubilacion-2026.json';
import { seguridadSocial2026 } from '../data/seguridad-social-2026';

export type Situacion = 'conyugeACargo' | 'unipersonal' | 'conyugeNoACargo';
export type Modalidad = 'ordinaria' | 'voluntaria' | 'involuntaria' | 'demorada';

export interface EntradaJubilacion {
  anioNacimiento: number;
  /** 1 a 12 */
  mesNacimiento: number;
  /** Meses cotizados hasta hoy */
  mesesCotizadosHoy: number;
  /** Base de cotización mensual actual */
  baseActual: number;
  /** Evolución real anual de la base en %, hacia atrás y hacia delante */
  crecimientoReal?: number;
  /** Sigue cotizando hasta la jubilación (si no, laguna desde hoy) */
  sigueCotizando?: boolean;
  /** Edad de jubilación deseada en meses; 0 o ausente = edad ordinaria */
  edadDeseadaMeses?: number;
  /** Cese involuntario (despido, ERE...) para la anticipada */
  involuntaria?: boolean;
  situacion?: Situacion;
  /** Hijos para el complemento de brecha de género (lo percibe un progenitor, con requisitos) */
  hijosBrecha?: number;
  /** Integración reforzada de lagunas (DT 41.ª) */
  lagunasReforzadas?: boolean;
  /** Mes de referencia (hoy): año y mes 1-12 */
  hoyAnio: number;
  hoyMes: number;
}

export interface ResultadoJubilacion {
  derecho: boolean;
  motivo?: 'carencia' | 'carenciaEspecifica';
  avisoAnticipada?: 'mesesCotizados' | 'demasiadoPronto' | 'pensionMinima';
  modalidad: Modalidad;
  edadOrdinariaMeses: number;
  edadJubilacionMeses: number;
  anioHecho: number;
  mesHecho: number;
  mesesCotizados: number;
  porcentaje: number;
  porcentajeDemora: number;
  baseAntigua: number | null;
  baseNueva: number;
  metodo: 'antigua' | 'nueva';
  baseReguladora: number;
  mesesAnticipo: number;
  coeficiente: number;
  coeficienteSobreTope: boolean;
  pensionCalculada: number;
  limitadaPorMaxima: boolean;
  complementoDemoraAnual: number;
  complementoMinimos: number;
  minimaAplicable: number;
  brecha: number;
  pensionMensual: number;
  pensionAnual: number;
}

const idx = (anio: number, mes: number) => anio * 12 + (mes - 1);
const BMIN = seguridadSocial2026.baseMinimaMensual;
const BMAX = seguridadSocial2026.baseMaximaMensual;
const A = P.anticipada;

/** Edad ordinaria (meses) según el año en que se alcanza y los meses cotizados a esa edad. */
export function edadOrdinaria(nacimiento: number, mesesCotizadosA: (edadMeses: number) => number): number {
  const reglas = (anioHecho: number) => (anioHecho <= 2026 ? P.edad['2026'] : P.edad['2027']);
  const a65 = Math.floor((nacimiento + 780) / 12);
  const r65 = reglas(a65);
  if (mesesCotizadosA(780) >= r65.umbralMeses) return 780;
  const a802 = Math.floor((nacimiento + P.edad['2026'].edadSinUmbralMeses) / 12);
  return a802 <= 2026 ? P.edad['2026'].edadSinUmbralMeses : P.edad['2027'].edadSinUmbralMeses;
}

/** Porcentaje aplicable a la base reguladora por meses cotizados (art. 210.1 y DT 9.ª). */
export function porcentajePorMeses(meses: number, anioHecho: number): number {
  const C = P.porcentaje;
  if (meses < C.mesesCarencia) return 0;
  const escala = anioHecho <= 2026 ? C['2026'] : C['2027'];
  let extra = meses - C.mesesCarencia, pct = C.base;
  for (const [n, r] of escala as number[][]) { const k = Math.min(extra, n); pct += k * r; extra -= k; if (extra <= 0) break; }
  return Math.min(100, Math.round(pct * 100) / 100);
}

/** Tramo de carrera de las tablas de coeficientes: 0 a 3. */
export function tramoCarrera(meses: number): number {
  const t = A.tramosMeses; return meses < t[0] ? 0 : meses < t[1] ? 1 : meses < t[2] ? 2 : 3;
}

export function coeficienteAnticipo(meses: number, mesesCotizados: number, involuntaria: boolean): number {
  if (meses <= 0) return 0;
  const tabla = (involuntaria ? A.coefInvoluntaria : A.coefVoluntaria) as Record<string, number[]>;
  const fila = tabla[String(Math.min(meses, involuntaria ? 48 : 24))];
  return fila ? fila[tramoCarrera(mesesCotizados)] / 100 : 0;
}

export function coeficienteSobreTope(meses: number, mesesCotizados: number, anio: number): number {
  const T = A.coefSobreTope as Record<string, Record<string, number[]>>;
  const col = T[String(Math.min(Math.max(anio, 2024), 2033))];
  if (anio > 2033) return coeficienteAnticipo(meses, mesesCotizados, false);
  return col[String(Math.min(meses, 24))][tramoCarrera(mesesCotizados)] / 100;
}

/**
 * Base reguladora a partir de una serie de bases mensuales (índice 0 = mes anterior al mes previo
 * al del hecho causante; null = mes sin obligación de cotizar).
 */
export function baseReguladora(serie: (number | null)[], anioHecho: number, reforzada = false) {
  const B = P.baseReguladora;
  // La DT 41.ª remite a la integración del art. 209.1 vigente desde 2026: solo se aplica a la fórmula nueva
  const integrar = (n: number, ref = false) => {
    const out: number[] = []; let lagunas = 0;
    for (let i = 0; i < n; i++) {
      const b = serie[i];
      if (b !== null && b !== undefined) { out.push(b); continue; }
      lagunas++;
      let f = lagunas <= B.lagunas.mesesBaseMinimaCompleta ? 1 : B.lagunas.fraccionResto;
      if (ref) {
        const R = B.lagunas.reforzada;
        if (lagunas >= R.desde && lagunas <= R.hasta) f = R.fraccion;
        else if (lagunas >= R.desde2 && lagunas <= R.hasta2) f = R.fraccion2;
      }
      out.push(BMIN * f);
    }
    return out;
  };
  const suma = (a: number[]) => a.reduce((s, x) => s + x, 0);
  // Fórmula nueva del año
  const nueva = (B.nueva as Record<string, number[]>)[String(anioHecho)] ?? (anioHecho < 2026 ? null : B.nuevaDefinitiva);
  let baseNueva = 0;
  if (nueva) {
    const [meses, mejores, divisor] = nueva;
    const v = integrar(meses, reforzada).sort((x, y) => y - x).slice(0, mejores);
    baseNueva = suma(v) / divisor;
  }
  // Fórmula de 2023 (300 ÷ 350), ampliada de 2041 a 2043
  let baseAntigua: number | null = null;
  if (anioHecho <= 2040) baseAntigua = suma(integrar(B.antigua.meses)) / B.antigua.divisor;
  else if (anioHecho <= B.opcionAntiguaHasta) {
    const [m, d] = (B.antiguaAmpliada as Record<string, number[]>)[String(anioHecho)];
    baseAntigua = suma(integrar(m)) / d;
  }
  const metodo: 'antigua' | 'nueva' = baseAntigua !== null && baseAntigua > baseNueva ? 'antigua' : 'nueva';
  return { baseAntigua, baseNueva, metodo, baseReguladora: metodo === 'antigua' ? baseAntigua! : baseNueva };
}

export function calcularJubilacion(e: EntradaJubilacion): ResultadoJubilacion {
  const nac = idx(e.anioNacimiento, e.mesNacimiento);
  const hoy = idx(e.hoyAnio, e.hoyMes);
  const sigue = e.sigueCotizando ?? true;
  const g = (e.crecimientoReal ?? 0) / 100;
  const base0 = Math.min(BMAX, Math.max(0, e.baseActual));
  const cotHoy = Math.max(0, Math.round(e.mesesCotizadosHoy));
  const cotizadosA = (mes: number, continuar = sigue) => cotHoy + (continuar ? Math.max(0, mes - hoy) : 0);

  // Edad ordinaria: para la anticipada se calcula como si se siguiera cotizando (arts. 207.2 y 208.2)
  const deseada = e.edadDeseadaMeses && e.edadDeseadaMeses > 0 ? Math.round(e.edadDeseadaMeses) : 0;
  const ordinariaReal = edadOrdinaria(nac, (m) => cotizadosA(nac + m));
  const ordinariaSiCotiza = edadOrdinaria(nac, (m) => cotizadosA(nac + m, true));
  let edad = deseada || ordinariaReal;
  let modalidad: Modalidad = 'ordinaria';
  let edadOrd = ordinariaReal;
  if (deseada && deseada < ordinariaReal) { edadOrd = ordinariaSiCotiza; modalidad = e.involuntaria ? 'involuntaria' : 'voluntaria'; }
  if (deseada && deseada > ordinariaReal) modalidad = 'demorada';
  if (modalidad !== 'demorada' && deseada && deseada >= edadOrd) modalidad = 'ordinaria';

  let hecho = Math.max(hoy, nac + edad);
  edad = hecho - nac;
  let mesesAnticipo = modalidad === 'voluntaria' || modalidad === 'involuntaria' ? Math.max(0, edadOrd - edad) : 0;
  let avisoAnticipada: ResultadoJubilacion['avisoAnticipada'];
  const maxAnt = modalidad === 'involuntaria' ? A.involuntaria.mesesMax : A.voluntaria.mesesMax;
  const minCot = modalidad === 'involuntaria' ? A.involuntaria.mesesCotizacionMin : A.voluntaria.mesesCotizacionMin;
  if (mesesAnticipo > 0 && (mesesAnticipo > maxAnt || cotizadosA(hecho) < minCot)) {
    avisoAnticipada = mesesAnticipo > maxAnt ? 'demasiadoPronto' : 'mesesCotizados';
    modalidad = 'ordinaria'; edadOrd = ordinariaReal; edad = ordinariaReal; hecho = Math.max(hoy, nac + edad); edad = hecho - nac; mesesAnticipo = 0;
  }

  const anioHecho = Math.floor(hecho / 12);
  const mesHecho = (hecho % 12) + 1;
  const meses = cotizadosA(hecho);

  // Serie de bases: índice 0 = mes hecho-2 (mes anterior al mes previo)
  const ultimoCotizado = sigue ? hecho - 1 : hoy;
  const primerCotizado = ultimoCotizado - meses + 1;
  const serie: (number | null)[] = [];
  for (let i = 0; i < 360; i++) {
    const t = hecho - 2 - i;
    if (t > ultimoCotizado || t < primerCotizado) { serie.push(null); continue; }
    const b = base0 * Math.pow(1 + g, (t - hoy) / 12);
    serie.push(Math.min(BMAX, Math.max(BMIN, b)));
  }
  const br = baseReguladora(serie, anioHecho, e.lagunasReforzadas ?? false);
  const pct = porcentajePorMeses(meses, anioHecho);

  // Carencia específica: 24 meses dentro de los 180 anteriores
  const ventanaIni = hecho - P.carencia.ventanaEspecifica;
  const enVentana = Math.max(0, Math.min(ultimoCotizado, hecho - 1) - Math.max(primerCotizado, ventanaIni) + 1);
  const situacion = e.situacion ?? 'unipersonal';
  const minimas = edad >= 780 ? P.minimasAnuales['65'] : P.minimasAnuales.menor65;
  const minimaAplicable = minimas[situacion] / P.pagasAnuales;
  const base: ResultadoJubilacion = {
    derecho: false, modalidad, edadOrdinariaMeses: edadOrd, edadJubilacionMeses: edad, anioHecho, mesHecho, mesesCotizados: meses,
    porcentaje: pct, porcentajeDemora: 0, ...br, mesesAnticipo, coeficiente: 0, coeficienteSobreTope: false,
    pensionCalculada: 0, limitadaPorMaxima: false, complementoDemoraAnual: 0, complementoMinimos: 0, minimaAplicable,
    brecha: 0, pensionMensual: 0, pensionAnual: 0, avisoAnticipada,
  };
  if (meses < P.carencia.mesesMinimos) return { ...base, motivo: 'carencia' };
  if (enVentana < P.carencia.mesesEspecificos) return { ...base, motivo: 'carenciaEspecifica' };

  const MAX = P.pensionMaximaMensual;
  let porcentajeDemora = 0;
  if (modalidad === 'demorada') {
    const sobre = edad - ordinariaReal;
    const anios = Math.floor(sobre / 12);
    porcentajeDemora = anios * P.demora.porcentajeAnual + (anios >= 2 && sobre % 12 > 6 ? P.demora.porcentajeSemestre : 0);
    // La demora exige haber reunido la carencia al cumplir la edad ordinaria
    if (cotizadosA(nac + ordinariaReal) < P.carencia.mesesMinimos) porcentajeDemora = 0;
  }
  const bruta = (br.baseReguladora * pct) / 100;
  let pension = bruta, coef = 0, sobreTope = false, complementoDemoraAnual = 0;
  if (modalidad === 'voluntaria' || modalidad === 'involuntaria') {
    coef = coeficienteAnticipo(mesesAnticipo, meses, modalidad === 'involuntaria');
    if (modalidad === 'voluntaria' && bruta > MAX) { coef = coeficienteSobreTope(mesesAnticipo, meses, anioHecho); pension = MAX * (1 - coef); sobreTope = true; }
    else pension = bruta * (1 - coef);
  } else if (porcentajeDemora > 0) {
    const conDemora = (br.baseReguladora * (pct + porcentajeDemora)) / 100;
    if (conDemora > MAX) {
      const usado = Math.max(0, (MAX / br.baseReguladora) * 100 - pct);
      const noUsado = Math.max(0, porcentajeDemora - usado);
      complementoDemoraAnual = Math.min(Math.ceil((MAX * P.pagasAnuales * noUsado) / 100), Math.max(0, BMAX * 12 - MAX * P.pagasAnuales));
    }
    pension = conDemora;
  }
  const limitada = pension > MAX;
  pension = Math.min(pension, MAX);
  // Anticipada voluntaria: la pensión debe superar la mínima a los 65 años (art. 208.1.c)
  if (modalidad === 'voluntaria' && pension <= P.minimasAnuales['65'][situacion] / P.pagasAnuales) {
    return { ...calcularJubilacion({ ...e, edadDeseadaMeses: 0 }), avisoAnticipada: 'pensionMinima' };
  }
  const pnc = P.pensionNoContributivaAnual / P.pagasAnuales;
  const complementoMinimos = pension < minimaAplicable ? Math.min(minimaAplicable - pension, pnc) : 0;
  const brecha = Math.min(Math.max(0, Math.round(e.hijosBrecha ?? 0)), P.complementoBrechaMaxHijos) * P.complementoBrechaMensualPorHijo;
  const total = pension + complementoMinimos + brecha + complementoDemoraAnual / P.pagasAnuales;
  return {
    ...base, derecho: true, porcentajeDemora, coeficiente: coef, coeficienteSobreTope: sobreTope,
    pensionCalculada: pension, limitadaPorMaxima: limitada, complementoDemoraAnual, complementoMinimos, brecha,
    pensionMensual: total, pensionAnual: total * P.pagasAnuales,
  };
}

/** Fecha de referencia (hoy) a partir de un AAAA-MM-DD. */
export function hoyDesde(iso: string) { return { hoyAnio: +iso.slice(0, 4), hoyMes: +iso.slice(5, 7) }; }

export const PARAMS_JUBILACION = P;
export const BASES_2026 = { minima: BMIN, maxima: BMAX };
