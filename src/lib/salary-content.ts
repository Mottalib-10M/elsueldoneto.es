/**
 * salary-content.ts \u2014 Generates UNIQUE text content for each salary amount page.
 *
 * Key technique: Uses variationIndex = Math.floor(amount / 1000) % N to select
 * different sentence structures, combined with per-salary calculations that embed
 * values mathematically unique to each amount.
 *
 * All text in Spanish (es-ES). Uses Unicode escapes for special characters.
 */

import type { DesgloseSueldo } from './irpf-engine';
import type { SalaryPageConfig } from '../data/salary-pages-config';
import { formatAmountSpanish } from '../data/salary-pages-config';
import { formatEuros, formatEurosRound } from './format-es';
import { seguridadSocial2026 } from '../data/seguridad-social-2026';
import { CURRENT_FISCAL_YEAR } from '../config';

// \u2500\u2500 Constants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const MEDIANA_SALARIAL = 24_395;
const SMI_ANUAL = seguridadSocial2026.smiAnual14Pagas;
const HORAS_LABORABLES_ANIO = 1_764; // 220 days * 8h
const DIAS_LABORABLES_ANIO = 220;

// \u2500\u2500 Helper: variation index \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function getVariation(amount: number, modulo: number): number {
  // Use a prime-based hash to ensure even adjacent amounts get different variations
  const seed = amount * 31 + Math.floor(amount / 100) * 7 + Math.floor(amount / 1000) * 127;
  return ((seed >>> 0) % (modulo * 1009)) % modulo;
}

// \u2500\u2500 Per-salary calculations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function calcDailyGross(annualGross: number): number {
  return annualGross / DIAS_LABORABLES_ANIO;
}

function calcHourlyGross(annualGross: number): number {
  return annualGross / HORAS_LABORABLES_ANIO;
}

function calcHourlyNet(netoAnual: number): number {
  return netoAnual / HORAS_LABORABLES_ANIO;
}

function calcDailyNet(netoAnual: number): number {
  return netoAnual / DIAS_LABORABLES_ANIO;
}

function calcWeeklyNet(netoAnual: number): number {
  return netoAnual / 52;
}

function percentAboveMedian(annualGross: number): number {
  return ((annualGross - MEDIANA_SALARIAL) / MEDIANA_SALARIAL) * 100;
}

function percentAboveSMI(annualGross: number): number {
  return ((annualGross - SMI_ANUAL) / SMI_ANUAL) * 100;
}

function marginTaxSavingIfLower(amount: number, result: DesgloseSueldo): number {
  // Estimate: if you earned 1000 less, how much less tax would you pay
  const effectiveRate = result.tipoEfectivoTotal;
  return 1000 * effectiveRate;
}

// \u2500\u2500 getBandContext \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getBandContext(amount: number, result: DesgloseSueldo): string {
  const annualGross = result.brutoAnual;
  const hourlyGross = calcHourlyGross(annualGross);
  const hourlyNet = calcHourlyNet(result.netoAnual);
  const dailyGross = calcDailyGross(annualGross);
  const dailyNet = calcDailyNet(result.netoAnual);
  const weeklyNet = calcWeeklyNet(result.netoAnual);
  const pctMedian = percentAboveMedian(annualGross);
  const pctSMI = percentAboveSMI(annualGross);
  const ratioSMI = (annualGross / SMI_ANUAL).toFixed(2);
  const v = getVariation(amount, 10);

  const hourlyGrossStr = formatEuros(hourlyGross);
  const hourlyNetStr = formatEuros(hourlyNet);
  const dailyGrossStr = formatEuros(dailyGross);
  const dailyNetStr = formatEuros(dailyNet);
  const weeklyNetStr = formatEuros(weeklyNet);
  const pctMedianStr = Math.abs(pctMedian).toFixed(1);
  const pctSMIStr = pctSMI.toFixed(1);
  const monthlyGrossStr = formatEuros(annualGross / 14);
  const biweeklyNetStr = formatEuros(result.netoAnual / 26);

  const introVariants = [
    `Desglosando ${formatAmountSpanish(annualGross)} \u20ac brutos anuales en unidades m\u00e1s peque\u00f1as: tu salario bruto por hora laborable es de ${hourlyGrossStr}, lo que equivale a ${dailyGrossStr} por jornada completa de 8 horas. Despu\u00e9s de impuestos, tu hora neta de trabajo vale ${hourlyNetStr} y cada d\u00eda laborable generas ${dailyNetStr} netos para tu bolsillo.`,
    `Si traduces tu salario de ${formatAmountSpanish(annualGross)} \u20ac brutos al a\u00f1o a cifras diarias, cada jornada laboral te aporta ${dailyGrossStr} en bruto (${dailyNetStr} netos). Por hora, esto supone ${hourlyGrossStr} brutos o ${hourlyNetStr} una vez descontados IRPF y Seguridad Social. Semanalmente dispones de ${weeklyNetStr} netos.`,
    `Tu retribuci\u00f3n de ${formatAmountSpanish(annualGross)} \u20ac anuales brutos se descompone en ${hourlyGrossStr} por cada hora trabajada (sobre ${HORAS_LABORABLES_ANIO} horas/a\u00f1o). El neto real por hora es ${hourlyNetStr}, es decir, cada semana laboral de 40 horas te deja ${weeklyNetStr} limpios de impuestos.`,
    `Con un bruto anual de ${formatAmountSpanish(annualGross)} \u20ac, tu tarifa diaria efectiva es ${dailyGrossStr} en ${DIAS_LABORABLES_ANIO} d\u00edas laborables. Tras deducciones, la cifra neta diaria queda en ${dailyNetStr}. Si lo miras por hora (jornada de 8h), cobras ${hourlyGrossStr} brutos que se convierten en ${hourlyNetStr} netos.`,
    `Expresado por unidad de tiempo, ${formatAmountSpanish(annualGross)} \u20ac brutos anuales significan: ${hourlyGrossStr}/hora bruta, ${dailyGrossStr}/d\u00eda laborable bruto, ${weeklyNetStr}/semana neta. Tu hora neta real, descontando toda la carga fiscal, es exactamente ${hourlyNetStr}.`,
    `Cada minuto que trabajas con ${formatAmountSpanish(annualGross)} \u20ac brutos anuales genera ${formatEuros(hourlyGross / 60)} brutos (${formatEuros(hourlyNet / 60)} netos). Al d\u00eda eso se acumula hasta ${dailyGrossStr} brutos y ${dailyNetStr} limpios. Tu ingreso neto quincenal es de ${biweeklyNetStr}, suficiente para ${dailyNet > 80 ? 'cubrir la mayor\u00eda de gastos fijos mensuales en una sola quincena' : 'cubrir los gastos b\u00e1sicos de medio mes'}.`,
    `Pens\u00e1ndolo en t\u00e9rminos de tu jornada laboral, ${formatAmountSpanish(annualGross)} \u20ac brutos anuales se traducen en ${dailyGrossStr} por d\u00eda trabajado (antes de impuestos) y ${dailyNetStr} netos que realmente ingresan en tu cuenta. Con una jornada de 8 horas, tu hora bruta sale a ${hourlyGrossStr} y la neta a ${hourlyNetStr}. Cada semana sumas ${weeklyNetStr} netos.`,
    `Para ${formatAmountSpanish(annualGross)} \u20ac brutos al a\u00f1o, la aritm\u00e9tica es reveladora: divides entre ${HORAS_LABORABLES_ANIO} horas laborables y obtienes ${hourlyGrossStr} brutos/hora; despu\u00e9s de la retenci\u00f3n del IRPF y las cotizaciones, te quedan ${hourlyNetStr} netos por hora. Semanalmente ingresas ${weeklyNetStr} y quincenalmente ${biweeklyNetStr}.`,
    `Radiograf\u00eda temporal de tu salario de ${formatAmountSpanish(annualGross)} \u20ac: por cada paga de 14 recibes ${monthlyGrossStr} brutos. En el d\u00eda a d\u00eda, cada hora de trabajo genera ${hourlyGrossStr} brutos que el sistema fiscal transforma en ${hourlyNetStr} netos. Tu jornada laborable produce ${dailyNetStr} limpios y la semana cierra en ${weeklyNetStr}.`,
    `Las cifras de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales cobran otra perspectiva al expresarlas por hora: ${hourlyGrossStr} brutos, ${hourlyNetStr} netos. Eso es ${dailyNetStr} al d\u00eda y ${weeklyNetStr} a la semana. Cada quincena laboral (10 d\u00edas), acumulas ${formatEuros(dailyNet * 10)} netos en tu cuenta bancaria.`,
  ];

  const comparisonVariants = [
    pctMedian >= 0
      ? `Este salario supera la mediana salarial espa\u00f1ola en un ${pctMedianStr}%, lo que significa que ganas m\u00e1s que la mayor\u00eda de los trabajadores por cuenta ajena en Espa\u00f1a. Respecto al SMI (${formatAmountSpanish(SMI_ANUAL)} \u20ac), tu sueldo es ${ratioSMI} veces superior, un ${pctSMIStr}% por encima del m\u00ednimo legal.`
      : `Este salario est\u00e1 un ${pctMedianStr}% por debajo de la mediana salarial espa\u00f1ola (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac brutos/a\u00f1o). Aun as\u00ed, representa ${ratioSMI} veces el SMI actual (${formatAmountSpanish(SMI_ANUAL)} \u20ac), es decir, un ${pctSMIStr}% por encima del salario m\u00ednimo interprofesional.`,
    pctMedian >= 0
      ? `En t\u00e9rminos relativos, ${formatAmountSpanish(annualGross)} \u20ac brutos sit\u00faan tu n\u00f3mina un ${pctMedianStr}% por encima de lo que cobra el trabajador mediano en Espa\u00f1a. Comparado con el Salario M\u00ednimo Interprofesional de ${CURRENT_FISCAL_YEAR}, multiplicas el SMI por ${ratioSMI} (${pctSMIStr}% m\u00e1s).`
      : `Con ${formatAmountSpanish(annualGross)} \u20ac brutos anuales, tu salario queda un ${pctMedianStr}% por debajo de la mediana nacional. No obstante, equivale a ${ratioSMI} veces el SMI de ${CURRENT_FISCAL_YEAR}, superando el m\u00ednimo legal en un ${pctSMIStr}%.`,
    pctMedian >= 0
      ? `Posicionamiento salarial: tu bruto anual excede en ${pctMedianStr}% la mediana (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac seg\u00fan INE). Frente al SMI de ${formatAmountSpanish(SMI_ANUAL)} \u20ac anuales, tu ingreso es ${ratioSMI}x mayor, una diferencia de ${pctSMIStr} puntos porcentuales.`
      : `Posicionamiento salarial: tu bruto anual es un ${pctMedianStr}% inferior a la mediana nacional (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac). Sin embargo, supera el SMI en ${pctSMIStr}% (${ratioSMI}x el m\u00ednimo interprofesional de ${formatAmountSpanish(SMI_ANUAL)} \u20ac).`,
    pctMedian >= 0
      ? `Estad\u00edsticamente, este sueldo de ${formatAmountSpanish(annualGross)} \u20ac te coloca ${pctMedianStr}% por encima del salario mediano del pa\u00eds y representa ${ratioSMI} veces lo que marca el SMI vigente (${pctSMIStr}% m\u00e1s que los ${formatAmountSpanish(SMI_ANUAL)} \u20ac del m\u00ednimo).`
      : `Estad\u00edsticamente, ${formatAmountSpanish(annualGross)} \u20ac brutos se sit\u00faan ${pctMedianStr}% bajo la mediana salarial, aunque multiplican por ${ratioSMI} el SMI actual. La distancia al m\u00ednimo legal es de ${pctSMIStr} puntos porcentuales.`,
    pctMedian >= 0
      ? `\u00bfD\u00f3nde te sit\u00faas? Con ${formatAmountSpanish(annualGross)} \u20ac, tu salario est\u00e1 ${pctMedianStr}% por encima de la mediana espa\u00f1ola. En relaci\u00f3n al SMI (${formatAmountSpanish(SMI_ANUAL)} \u20ac/a\u00f1o), ganas ${ratioSMI} veces m\u00e1s, un diferencial del ${pctSMIStr}%.`
      : `\u00bfD\u00f3nde te sit\u00faas? Con ${formatAmountSpanish(annualGross)} \u20ac brutos est\u00e1s ${pctMedianStr}% bajo la mediana, pero ${pctSMIStr}% sobre el SMI. Tu sueldo equivale a ${ratioSMI} veces el m\u00ednimo interprofesional de ${formatAmountSpanish(SMI_ANUAL)} \u20ac.`,
    pctMedian >= 0
      ? `Seg\u00fan datos del INE, la mediana salarial en Espa\u00f1a es de ${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac brutos. Con ${formatAmountSpanish(annualGross)} \u20ac la superas en un ${pctMedianStr}%, posicion\u00e1ndote por encima de m\u00e1s de la mitad de los asalariados. Tu sueldo multiplica el SMI por ${ratioSMI} (${pctSMIStr}% m\u00e1s).`
      : `Seg\u00fan datos del INE, tu salario de ${formatAmountSpanish(annualGross)} \u20ac queda un ${pctMedianStr}% por debajo de la mediana de ${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac. Aun as\u00ed, superas el SMI en ${pctSMIStr}%, equivaliendo a ${ratioSMI} veces el m\u00ednimo interprofesional vigente.`,
    pctMedian >= 0
      ? `En el mapa salarial espa\u00f1ol, ${formatAmountSpanish(annualGross)} \u20ac brutos te posicionan un ${pctMedianStr}% sobre el salario mediano. Si comparas con el suelo legal (SMI de ${formatAmountSpanish(SMI_ANUAL)} \u20ac), tu retribuci\u00f3n lo multiplica por ${ratioSMI}, una ventaja del ${pctSMIStr}% que refleja tu cualificaci\u00f3n y experiencia.`
      : `En el mapa salarial espa\u00f1ol, ${formatAmountSpanish(annualGross)} \u20ac brutos se sit\u00faan un ${pctMedianStr}% bajo la mediana. No obstante, representan ${ratioSMI}x el SMI (${pctSMIStr}% m\u00e1s que el m\u00ednimo de ${formatAmountSpanish(SMI_ANUAL)} \u20ac), lo que indica margen de progresi\u00f3n salarial.`,
    pctMedian >= 0
      ? `Tu salario anual de ${formatAmountSpanish(annualGross)} \u20ac aventaja la mediana nacional en ${pctMedianStr} puntos porcentuales. Frente al SMI del ${CURRENT_FISCAL_YEAR} (${formatAmountSpanish(SMI_ANUAL)} \u20ac), cobras ${ratioSMI} veces m\u00e1s, una distancia del ${pctSMIStr}% que posiciona tu retribuci\u00f3n en la mitad superior de la distribuci\u00f3n.`
      : `Tu salario de ${formatAmountSpanish(annualGross)} \u20ac se sit\u00faa un ${pctMedianStr}% bajo la mediana de ${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac, pero sigue siendo ${ratioSMI} veces el SMI. La diferencia respecto al m\u00ednimo legal (${pctSMIStr}%) indica que hay margen de mejora pero tu posici\u00f3n no es precaria.`,
    pctMedian >= 0
      ? `Contexto nacional: ${formatAmountSpanish(annualGross)} \u20ac brutos anuales superan la mediana en ${pctMedianStr}% y el SMI en ${pctSMIStr}% (${ratioSMI}x los ${formatAmountSpanish(SMI_ANUAL)} \u20ac del m\u00ednimo). Esto sit\u00faa tu n\u00f3mina en una posici\u00f3n favorable frente al grueso del mercado laboral espa\u00f1ol.`
      : `Contexto nacional: con ${formatAmountSpanish(annualGross)} \u20ac brutos, est\u00e1s ${pctMedianStr}% bajo la mediana salarial pero ${pctSMIStr}% sobre el SMI (${ratioSMI}x el m\u00ednimo de ${formatAmountSpanish(SMI_ANUAL)} \u20ac). La formaci\u00f3n continua y el cambio de sector son las v\u00edas m\u00e1s directas para acercarte a la mediana.`,
    pctMedian >= 0
      ? `Comparativa ${CURRENT_FISCAL_YEAR}: con ${formatAmountSpanish(annualGross)} \u20ac brutos ganas un ${pctMedianStr}% m\u00e1s que el trabajador mediano espa\u00f1ol y ${ratioSMI} veces lo que establece el Salario M\u00ednimo Interprofesional. Tu distancia respecto al SMI es de ${pctSMIStr} puntos porcentuales, reflejo de la cualificaci\u00f3n exigida para tu perfil profesional.`
      : `Comparativa ${CURRENT_FISCAL_YEAR}: ${formatAmountSpanish(annualGross)} \u20ac brutos quedan un ${pctMedianStr}% por debajo de la mediana (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac), aunque superan el SMI en un ${pctSMIStr}%. Multiplicas el m\u00ednimo legal por ${ratioSMI}, lo que a\u00fan te deja en una posici\u00f3n con recorrido alcista.`,
  ];

  return introVariants[v] + ' ' + comparisonVariants[getVariation(amount, 10)];
}

// \u2500\u2500 getCareerDescription \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getCareerDescription(amount: number): string {
  const v = getVariation(amount, 6);
  const annualGross = amount; // Assume we pass annualGross
  const hourlyGross = calcHourlyGross(annualGross);
  const hourlyStr = formatEuros(hourlyGross);
  const monthlyGross = formatEuros(annualGross / 12);

  if (annualGross <= 17094) {
    const variants = [
      `Un salario de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales (${monthlyGross}/mes, ${hourlyStr}/hora) es caracter\u00edstico de puestos de entrada en hosteler\u00eda, comercio minorista y servicios b\u00e1sicos. A este nivel, pr\u00f3ximo al SMI, la negociaci\u00f3n de complementos salariales (nocturnidad, festivos, antig\u00fcedad) cobra especial relevancia para mejorar el ingreso total.`,
      `Con ${hourlyStr} brutos por hora trabajada (${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o), este nivel retributivo corresponde a contratos a media jornada, empleos en limpieza, log\u00edstica b\u00e1sica o atenci\u00f3n al cliente sin experiencia previa. La formaci\u00f3n profesional reglada es la v\u00eda m\u00e1s directa para progresar desde este punto.`,
      `${formatAmountSpanish(annualGross)} \u20ac anuales (${monthlyGross} mensuales brutos) sit\u00faan al trabajador en la franja del Salario M\u00ednimo Interprofesional. Perfiles t\u00edpicos: auxiliares administrativos, dependientes, operarios no cualificados y personal de reparto en fase inicial.`,
      `La retribuci\u00f3n de ${hourlyStr}/hora bruta (${formatAmountSpanish(annualGross)} \u20ac anuales) es frecuente en primer empleo juvenil, contratos de formaci\u00f3n y sectores con alta temporalidad. La clave para progresar: certificaciones profesionales, idiomas y disponibilidad geogr\u00e1fica.`,
      `Con un bruto mensual de ${monthlyGross} (${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o), este salario se da en roles de apoyo administrativo, atenci\u00f3n telef\u00f3nica, ayudantes de cocina y puestos de mantenimiento b\u00e1sico. El convenio colectivo del sector suele marcar la referencia m\u00ednima.`,
      `A ${hourlyStr} la hora bruta, ${formatAmountSpanish(annualGross)} \u20ac anuales representan la base del mercado laboral. Es habitual en contratos parciales, primer empleo y sectores como agricultura, hosteler\u00eda de temporada y servicios dom\u00e9sticos.`,
    ];
    return variants[v];
  }

  if (annualGross <= 25000) {
    const variants = [
      `Con ${hourlyStr} brutos/hora (${formatAmountSpanish(annualGross)} \u20ac al a\u00f1o), este salario es t\u00edpico de posiciones junior con 1-3 a\u00f1os de experiencia: t\u00e9cnicos administrativos, programadores junior, enfermeros reci\u00e9n graduados, profesores interinos y t\u00e9cnicos de laboratorio. La progresi\u00f3n natural lleva a los 28.000-32.000 \u20ac en 2-4 a\u00f1os.`,
      `${formatAmountSpanish(annualGross)} \u20ac anuales (${monthlyGross}/mes brutos, ${hourlyStr}/hora) corresponden a perfiles como analistas junior, t\u00e9cnicos de RRHH, dise\u00f1adores gr\u00e1ficos con poca antig\u00fcedad, contables y gestores de cuentas en PYMES. El siguiente salto salarial suele requerir especializaci\u00f3n o cambio de empresa.`,
      `La franja de ${formatAmountSpanish(annualGross)} \u20ac brutos (${hourlyStr}/hora efectiva) agrupa a oficiales de primera en industria, comerciales sin variable, t\u00e9cnicos de mantenimiento, educadores sociales y auxiliares de enfermer\u00eda con antig\u00fcedad. Representa el grueso del empleo estable en Espa\u00f1a.`,
      `A ${monthlyGross} mensuales brutos (${hourlyStr}/hora), ${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o es un sueldo frecuente para graduados universitarios en sus primeros 2-4 a\u00f1os laborales, especialmente en ciudades medianas. Marketing, periodismo, trabajo social y ense\u00f1anza concertada se mueven en esta banda.`,
      `Un salario anual de ${formatAmountSpanish(annualGross)} \u20ac (${hourlyStr} brutos cada hora trabajada) abarca roles como t\u00e9cnico de soporte IT, aparejador junior, dietista-nutricionista, fisioterapeuta empleado y coordinador de eventos. Es el tramo donde la experiencia acumulada empieza a marcar diferencias retributivas claras.`,
      `${monthlyGross} al mes brutos (${formatAmountSpanish(annualGross)} \u20ac anuales, ${hourlyStr}/hora) definen el segmento medio-bajo: secretar\u00eda de direcci\u00f3n, t\u00e9cnicos de calidad, desarrolladores web en agencia, personal de banca de base y delineantes industriales.`,
    ];
    return variants[v];
  }

  if (annualGross <= 40000) {
    const variants = [
      `${formatAmountSpanish(annualGross)} \u20ac brutos anuales (${hourlyStr}/hora, ${monthlyGross}/mes) se\u00f1alan a profesionales consolidados: ingenieros con 5+ a\u00f1os, product managers, m\u00e9dicos residentes de \u00faltimo a\u00f1o, abogados en bufete mediano y analistas de datos senior. En Madrid y Barcelona, es la franja que permite independencia econ\u00f3mica plena.`,
      `Con un hourly rate de ${hourlyStr} (${formatAmountSpanish(annualGross)} \u20ac anuales), este nivel retributivo es propio de team leads t\u00e9cnicos, consultores con 4-7 a\u00f1os, farmac\u00e9uticos titulares asalariados, project managers y controllers financieros. La retribuci\u00f3n variable empieza a complementar la fija en este segmento.`,
      `La banda de ${formatAmountSpanish(annualGross)} \u20ac (${monthlyGross} brutos mensuales, ${hourlyStr} por hora) re\u00fane perfiles como DevOps engineers, arquitectos t\u00e9cnicos, responsables de marketing, jefes de secci\u00f3n en retail grande y pilotos comerciales en formaci\u00f3n avanzada.`,
      `A ${hourlyStr}/hora bruta, ${formatAmountSpanish(annualGross)} \u20ac anuales recompensan la experiencia s\u00f3lida: enfermeros especializados, profesores titulares, desarrolladores full-stack senior, gestores de proyectos PMP y coordinadores de log\u00edstica en multinacional.`,
      `${formatAmountSpanish(annualGross)} \u20ac brutos al a\u00f1o (${hourlyStr}/hora efectiva, ${monthlyGross}/mes) corresponden al segmento medio-alto del empleo cualificado: auditores senior en Big4, data scientists con 3-5 a\u00f1os, directores de tienda en gran distribuci\u00f3n y m\u00e9dicos adjuntos.`,
      `Con ${monthlyGross} mensuales brutos y una tarifa horaria impl\u00edcita de ${hourlyStr}, un salario de ${formatAmountSpanish(annualGross)} \u20ac es el objetivo habitual de los profesionales que pasan de junior a senior en sectores como IT, ingenier\u00eda, finanzas y sanidad privada.`,
    ];
    return variants[v];
  }

  if (annualGross <= 65000) {
    const variants = [
      `${formatAmountSpanish(annualGross)} \u20ac brutos (${hourlyStr}/hora, ${monthlyGross}/mes) identifican a l\u00edderes t\u00e9cnicos y mandos medios-altos: engineering managers, directores de \u00e1rea en empresas medianas, m\u00e9dicos especialistas con antig\u00fcedad, socios junior en consultor\u00eda y key account managers en multinacional.`,
      `A este nivel de ${hourlyStr}/hora bruta (${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o), la retribuci\u00f3n incluye habitualmente componentes variables (bonus del 10-20%), beneficios sociales (seguro m\u00e9dico, coche) y stock options en tecnol\u00f3gicas. Perfiles: VP en startup scale-up, directores comerciales regionales y arquitectos de software.`,
      `Con ${monthlyGross} brutos mensuales (${formatAmountSpanish(annualGross)} \u20ac anuales, ${hourlyStr}/hora), este tramo salarial es caracter\u00edstico de senior managers en banca, directores de ingenier\u00eda con equipos de 10+, notarios de primera y pilotos comerciales con tipo y antig\u00fcedad.`,
      `${formatAmountSpanish(annualGross)} \u20ac anuales (${hourlyStr} la hora) sit\u00faan al profesional en el percentil 80+ de la distribuci\u00f3n salarial. Roles t\u00edpicos: head of product, directores financieros de PYME, cirujanos en privada, y socios de despacho jur\u00eddico mediano.`,
      `La retribuci\u00f3n de ${monthlyGross}/mes (${formatAmountSpanish(annualGross)} \u20ac brutos anuales, ${hourlyStr}/hora) indica experiencia superior a 10 a\u00f1os en sectores competitivos: partners en consultor\u00eda estrat\u00e9gica, CTOs de PYME, directores de operaciones industriales y country managers.`,
      `A ${hourlyStr} brutos por hora efectiva (${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o), los profesionales en este nivel gestionan presupuestos, equipos y P&L. Incluye directores de marketing digital en multinacional, responsables de planta fabril, y senior principals en tecnol\u00f3gicas.`,
    ];
    return variants[v];
  }

  // alto: > 65000
  const variants = [
    `${formatAmountSpanish(annualGross)} \u20ac brutos anuales (${hourlyStr}/hora, ${monthlyGross}/mes brutos) corresponden a alta direcci\u00f3n y perfiles excepcionales: CEOs de mediana empresa, directores generales de multinacional en Espa\u00f1a, managing directors en banca de inversi\u00f3n, y CxOs de scale-ups tecnol\u00f3gicas con funding Serie B+.`,
    `A ${hourlyStr}/hora bruta (${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o), este nivel retributivo se complementa casi siempre con paquetes de bonus (30-100% del base), LTIP/stock options y beneficios como veh\u00edculo, seguro premium y contribuci\u00f3n extra a pensi\u00f3n. Perfiles: partners en Big4, VPs en FAANG para Espa\u00f1a, y directores m\u00e9dicos de hospital privado.`,
    `Con ${monthlyGross} brutos al mes (${formatAmountSpanish(annualGross)} \u20ac/a\u00f1o), el salario base es solo una parte del paquete total. La remuneraci\u00f3n variable, diferida y en especie puede sumar un 40-80% adicional. Habitual en: fundadores con salario, directivos de IBEX 35 (niveles N-2/N-3), y especialistas m\u00e9dicos con consulta privada.`,
    `${formatAmountSpanish(annualGross)} \u20ac anuales brutos (${hourlyStr} por hora laborable) representan el top 3-5% de los salarios en Espa\u00f1a. La planificaci\u00f3n fiscal y patrimonial se vuelve esencial: sociedades holding, retribuci\u00f3n en especie optimizada y posible r\u00e9gimen de impatriados (Beckham) para perfiles internacionales.`,
    `La banda de ${monthlyGross}/mes brutos (${formatAmountSpanish(annualGross)} \u20ac anuales, ${hourlyStr}/hora) agrupa a los ejecutivos de primer nivel: consejeros delegados, socios de bufetes magic circle, directores de inversi\u00f3n en PE/VC, y CTO/CPO en unicornios tecnol\u00f3gicos con sede en Espa\u00f1a.`,
    `A ${hourlyStr} la hora bruta (${formatAmountSpanish(annualGross)} \u20ac brutos/a\u00f1o), la competencia por talento a nivel global marca las negociaciones. Estos paquetes incluyen relocation, tax equalization, signing bonus y garant\u00edas de variable m\u00ednimo durante los primeros a\u00f1os.`,
  ];
  return variants[v];
}

// \u2500\u2500 getTaxTips \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getTaxTips(amount: number, result: DesgloseSueldo): string {
  const v = getVariation(amount, 10);
  const annualGross = result.brutoAnual;
  const tipoEfectivo = (result.tipoEfectivoIRPF * 100).toFixed(2);
  const tipoTotal = (result.tipoEfectivoTotal * 100).toFixed(2);
  const ssAnual = formatEuros(result.seguridadSocialAnual);
  const irpfAnual = formatEuros(result.irpfTotalAnual);
  const retencionMes = formatEuros(result.retencionMensual);
  const ssMes = formatEuros(result.ssMensual);
  const ahorroPensiones = Math.min(1500, annualGross * 0.3);
  const ahorroFiscalPensiones = formatEuros(ahorroPensiones * result.tipoEfectivoIRPF);
  const ticketRestaurante = Math.min(11 * 22, annualGross * 0.05);
  const ahorroTicket = formatEuros(ticketRestaurante * result.tipoEfectivoIRPF);
  const totalDeduccionesAnual = formatEuros(result.seguridadSocialAnual + result.irpfTotalAnual);
  const totalDeduccionesMes = formatEuros(result.retencionMensual + result.ssMensual);
  const ahorroCombo = formatEuros(ahorroPensiones * result.tipoEfectivoIRPF + ticketRestaurante * result.tipoEfectivoIRPF + 150);

  const paragraphs = [
    [
      `Con un tipo efectivo total del ${tipoTotal}% (${tipoEfectivo}% de IRPF + cotizaciones sociales), cada mes se deducen ${retencionMes} de IRPF y ${ssMes} de Seguridad Social de tu n\u00f3mina.`,
      `Optimizaci\u00f3n inmediata: si aportas el m\u00e1ximo a un plan de pensiones (1.500 \u20ac/a\u00f1o), reduces tu base imponible y ahorras aproximadamente ${ahorroFiscalPensiones} en IRPF este ejercicio.`,
      `Otra v\u00eda: el ticket restaurante exento (hasta 11 \u20ac/d\u00eda laborable) puede suponer un ahorro fiscal anual de ${ahorroTicket}. Consulta si tu empresa ofrece retribuci\u00f3n flexible.`,
    ],
    [
      `Tu carga fiscal total asciende a ${totalDeduccionesAnual} al a\u00f1o: ${ssAnual} en cotizaciones sociales y ${irpfAnual} de IRPF (tipo efectivo ${tipoEfectivo}%). Mensualmente, esto se traduce en ${retencionMes} de retenci\u00f3n + ${ssMes} de SS.`,
      `Estrategia clave para tu tramo: maximizar las aportaciones a planes de pensiones genera un ahorro directo de ~${ahorroFiscalPensiones}. Adem\u00e1s, combinar seguro m\u00e9dico (exento hasta 500 \u20ac/persona/a\u00f1o) con ticket transporte multiplica el beneficio sin coste adicional para la empresa.`,
      `Revisa tu borrador de la renta: con ${formatAmountSpanish(annualGross)} \u20ac brutos, las deducciones auton\u00f3micas por alquiler, hijos o inversiones pueden reducir la cuota final entre 200 y 1.200 \u20ac adicionales seg\u00fan tu CCAA.`,
    ],
    [
      `Desglose de tu carga fiscal con ${formatAmountSpanish(annualGross)} \u20ac brutos: pagas ${irpfAnual} de IRPF al a\u00f1o (tipo efectivo ${tipoEfectivo}%) y ${ssAnual} de Seguridad Social. El tipo total que soportas es del ${tipoTotal}%, lo que deja en tu cuenta ${retencionMes} menos cada mes solo por IRPF.`,
      `Para reducir esta carga, tres palancas principales: (1) Plan de pensiones \u2192 ahorro de ${ahorroFiscalPensiones}; (2) Retribuci\u00f3n flexible en ticket restaurante \u2192 ahorro de ${ahorroTicket}; (3) Deducci\u00f3n por maternidad/paternidad si aplica (hasta 1.200 \u20ac/a\u00f1o por hijo < 3 a\u00f1os).`,
      `Consejo adicional: si la retenci\u00f3n comunicada a tu empresa no refleja tu situaci\u00f3n real (hijos, hipoteca pre-2013, discapacidad), presenta el modelo 145 actualizado para ajustar la retenci\u00f3n mensual y no financiar a Hacienda sin inter\u00e9s.`,
    ],
    [
      `Cada mes, Hacienda retiene ${retencionMes} de IRPF de tu n\u00f3mina de ${formatAmountSpanish(annualGross)} \u20ac brutos, m\u00e1s ${ssMes} de cotizaciones. Al a\u00f1o: ${irpfAnual} en IRPF (${tipoEfectivo}% efectivo) y ${ssAnual} en SS. Tu presi\u00f3n fiscal total: ${tipoTotal}%.`,
      `Ahorro tangible: plan de pensiones a tope \u2192 ${ahorroFiscalPensiones} menos de IRPF. Ticket restaurante \u2192 ${ahorroTicket} de ahorro fiscal. Seguro m\u00e9dico de empresa \u2192 ~150 \u20ac de ahorro por persona cubierta. Combinados, pueden mejorar tu neto efectivo en m\u00e1s de ${ahorroCombo}/a\u00f1o.`,
      `Planificaci\u00f3n temporal: si esperas un bonus o paga extra, recuerda que tributar\u00e1 al tipo marginal (superior al ${tipoEfectivo}% efectivo). Valorar el diferimiento mediante plan de pensiones del exceso puede ser rentable.`,
    ],
    [
      `La presi\u00f3n fiscal sobre tus ${formatAmountSpanish(annualGross)} \u20ac brutos se descompone en dos grandes partidas: ${ssAnual} de cotizaciones sociales (fijas, proporcionales a tu base) y ${irpfAnual} de IRPF (progresivo, tipo efectivo del ${tipoEfectivo}%). En total, el ${tipoTotal}% de tu bruto se destina a contribuciones obligatorias.`,
      `La herramienta m\u00e1s directa para reducir esa carga es el plan de pensiones: aportando 1.500 \u20ac anuales reduces tu base imponible y recuperas ~${ahorroFiscalPensiones} en la declaraci\u00f3n. El ticket restaurante a\u00f1ade otro ${ahorroTicket} de ahorro fiscal sin esfuerzo.`,
      `Adem\u00e1s, comprueba si te corresponden deducciones auton\u00f3micas: por alquiler (hasta 600-1.000 \u20ac seg\u00fan CCAA), familia numerosa (1.200-2.400 \u20ac) o inversi\u00f3n en startups (hasta 30% de la inversi\u00f3n, con l\u00edmite de 60.000 \u20ac de base).`,
    ],
    [
      `Retenciones mensuales con ${formatAmountSpanish(annualGross)} \u20ac brutos: cada n\u00f3mina pierde ${totalDeduccionesMes} (${retencionMes} de IRPF + ${ssMes} de SS). Anualmente suman ${totalDeduccionesAnual}, lo que supone un tipo combinado del ${tipoTotal}%.`,
      `Estrategia de optimizaci\u00f3n para tu tramo: aportaci\u00f3n al plan de pensiones (ahorro: ${ahorroFiscalPensiones}) + ticket restaurante (ahorro: ${ahorroTicket}) + seguro m\u00e9dico familiar por empresa (hasta ~300 \u20ac de ahorro fiscal). Resultado combinado: m\u00e1s de ${ahorroCombo} de ahorro anual real.`,
      `Punto clave: verifica que tu empresa aplica correctamente los m\u00ednimos personales y familiares en el c\u00e1lculo de la retenci\u00f3n. Un hijo no comunicado o un cambio de situaci\u00f3n personal no actualizado puede costarte cientos de euros en retenciones excesivas durante el a\u00f1o.`,
    ],
    [
      `Tu factura fiscal anual con ${formatAmountSpanish(annualGross)} \u20ac brutos: pagas ${irpfAnual} de IRPF (tipo efectivo ${tipoEfectivo}%) y ${ssAnual} de Seguridad Social, un ${tipoTotal}% en total. Mensualmente: ${retencionMes} + ${ssMes} = ${totalDeduccionesMes} de deducciones.`,
      `\u00bfC\u00f3mo mejorar? Plan de pensiones al m\u00e1ximo (ahorro de ${ahorroFiscalPensiones}), retribuci\u00f3n flexible (ticket restaurante: ${ahorroTicket}; guarder\u00eda: hasta 1.000 \u20ac exentos; transporte: 1.500 \u20ac exentos) y seguro m\u00e9dico de empresa (500 \u20ac/persona exentos).`,
      `Recuerda: las aportaciones a planes de pensiones de empleo (hechas por tu empresa) no cuentan en tu l\u00edmite de 1.500 \u20ac y pueden alcanzar 8.500 \u20ac anuales adicionales. Es una de las herramientas m\u00e1s potentes de ahorro fiscal para asalariados.`,
    ],
    [
      `Con ${formatAmountSpanish(annualGross)} \u20ac brutos, tu tipo efectivo de IRPF es del ${tipoEfectivo}%. Esto significa que cada euro adicional que puedas deducir te devuelve aproximadamente ${(result.tipoEfectivoIRPF * 100).toFixed(0)} c\u00e9ntimos en la declaraci\u00f3n. Las cotizaciones sociales (${ssAnual}/a\u00f1o) son fijas y no tienen optimizaci\u00f3n posible.`,
      `Acciones concretas: (1) aportar 1.500 \u20ac al plan de pensiones = ${ahorroFiscalPensiones} de ahorro; (2) pedir ticket restaurante = ${ahorroTicket} de ahorro; (3) revisar deducciones auton\u00f3micas (alquiler, hijos, formaci\u00f3n) que muchos contribuyentes desconocen.`,
      `Calendario fiscal: presenta siempre la declaraci\u00f3n (abril-junio), incluso si no est\u00e1s obligado. Con retenciones de ${retencionMes}/mes, es habitual que la liquidaci\u00f3n salga a devolver si tienes derecho a m\u00ednimos familiares, deducciones auton\u00f3micas o aportaciones a planes.`,
    ],
    [
      `Visi\u00f3n general de tu fiscalidad con ${formatAmountSpanish(annualGross)} \u20ac brutos anuales: la Seguridad Social (${ssAnual}/a\u00f1o, ${ssMes}/mes) es una contribuci\u00f3n fija que financia pensi\u00f3n, sanidad y desempleo. El IRPF (${irpfAnual}/a\u00f1o, ${retencionMes}/mes, tipo ${tipoEfectivo}%) es la parte optimizable.`,
      `Las tres v\u00edas de ahorro m\u00e1s efectivas para tu tramo: plan de pensiones individual (${ahorroFiscalPensiones}/a\u00f1o), retribuci\u00f3n flexible (ticket restaurante + transporte + seguro: hasta ${ahorroCombo}/a\u00f1o), y deducciones personales (hijos, vivienda pre-2013, donaciones, cuotas sindicales).`,
      `Si tu empresa no ofrece retribuci\u00f3n flexible, prop\u00f3nselo: a la empresa no le cuesta m\u00e1s (mismo coste laboral) y t\u00fa ganas neto real. Es una negociaci\u00f3n win-win que a menudo se pasa por alto en la revisi\u00f3n salarial anual.`,
    ],
    [
      `Radiograf\u00eda fiscal de ${formatAmountSpanish(annualGross)} \u20ac brutos: de cada paga mensual, ${retencionMes} van a la Agencia Tributaria (IRPF al ${tipoEfectivo}% efectivo) y ${ssMes} a la Seguridad Social. El total anual de deducciones alcanza ${totalDeduccionesAnual} (${tipoTotal}% de tu bruto).`,
      `Tu plan de acci\u00f3n fiscal: maximiza el plan de pensiones (ahorro: ${ahorroFiscalPensiones}), activa el ticket restaurante si tu empresa lo permite (ahorro: ${ahorroTicket}), y no olvides el seguro m\u00e9dico de empresa (exento hasta 500 \u20ac/persona).`,
      `Tip avanzado: si tienes rendimientos del ahorro (dividendos, intereses), puedes compensar p\u00e9rdidas patrimoniales con el 25% de los rendimientos positivos del capital mobiliario, y viceversa. Esta compensaci\u00f3n cruzada reduce la factura fiscal total m\u00e1s all\u00e1 del IRPF del trabajo.`,
    ],
  ];

  return paragraphs[v].join(' ');
}

// \u2500\u2500 buildFaqs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface FaqEntry {
  question: string;
  answer: string;
}

export function buildFaqs(amount: number, result: DesgloseSueldo): FaqEntry[] {
  const annualGross = result.brutoAnual;
  const amtStr = formatAmountSpanish(annualGross);
  const hourlyNet = formatEuros(calcHourlyNet(result.netoAnual));
  const hourlyGross = formatEuros(calcHourlyGross(annualGross));
  const dailyNet = formatEuros(calcDailyNet(result.netoAnual));
  const weeklyNet = formatEuros(calcWeeklyNet(result.netoAnual));
  const netoMes = formatEuros(result.netoMensual);
  const tipoEfectivo = (result.tipoEfectivoIRPF * 100).toFixed(1);
  const tipoTotal = (result.tipoEfectivoTotal * 100).toFixed(1);
  const irpfAnual = formatEuros(result.irpfTotalAnual);
  const ssAnual = formatEuros(result.seguridadSocialAnual);
  const neto12 = formatEuros(result.netoAnual / 12);
  const pctMedian = percentAboveMedian(annualGross);
  const pctMedianStr = Math.abs(pctMedian).toFixed(1);
  const ratioSMI = (annualGross / SMI_ANUAL).toFixed(1);

  const v = getVariation(amount, 3);

  const faqs: FaqEntry[] = [
    {
      question: `\u00bfCu\u00e1nto cobro neto al mes con ${amtStr} \u20ac brutos anuales?`,
      answer: v === 0
        ? `Con ${amtStr} \u20ac brutos al a\u00f1o, tu sueldo neto mensual en Madrid (soltero/a, 14 pagas) es de ${netoMes}. Con 12 pagas ser\u00eda ${neto12}/mes. Esto equivale a ${weeklyNet} semanales o ${dailyNet} por d\u00eda laborable.`
        : v === 1
        ? `Tu neto mensual con ${amtStr} \u20ac brutos es ${netoMes} (14 pagas, Madrid). Desglosado: ${weeklyNet}/semana, ${dailyNet}/d\u00eda laboral, ${hourlyNet}/hora neta. Si optas por 12 pagas, el mensual sube a ${neto12}.`
        : `Partiendo de ${amtStr} \u20ac brutos anuales, recibes ${netoMes} netos al mes con 14 pagas en Madrid. Tu hora neta real es ${hourlyNet} (sobre ${HORAS_LABORABLES_ANIO}h/a\u00f1o). Con 12 pagas: ${neto12}/mes.`,
    },
    {
      question: `\u00bfCu\u00e1nto IRPF pago con un sueldo de ${amtStr} \u20ac?`,
      answer: v === 0
        ? `El IRPF total con ${amtStr} \u20ac brutos es de ${irpfAnual} al a\u00f1o (tipo efectivo ${tipoEfectivo}%). Sumando Seguridad Social (${ssAnual}), tu presi\u00f3n fiscal total alcanza el ${tipoTotal}%. La retenci\u00f3n mensual en n\u00f3mina es de ${formatEuros(result.retencionMensual)}.`
        : v === 1
        ? `Con ${amtStr} \u20ac brutos, Hacienda retiene ${irpfAnual} de IRPF al a\u00f1o, un tipo efectivo del ${tipoEfectivo}%. Adem\u00e1s, cotizas ${ssAnual} a la Seguridad Social. Total de deducciones: ${tipoTotal}% de tu bruto. Mensualmente: ${formatEuros(result.retencionMensual)} de IRPF + ${formatEuros(result.ssMensual)} de SS.`
        : `Tu IRPF anual con ${amtStr} \u20ac brutos asciende a ${irpfAnual} (${tipoEfectivo}% efectivo). La Seguridad Social a\u00f1ade ${ssAnual}. Entre ambos conceptos, se retiene el ${tipoTotal}% de tu salario bruto, dejando ${formatEuros(result.netoAnual)} netos anuales.`,
    },
    {
      question: `\u00bfCu\u00e1nto es ${amtStr} \u20ac brutos por hora?`,
      answer: `${amtStr} \u20ac brutos anuales equivalen a ${hourlyGross} brutos por hora (${HORAS_LABORABLES_ANIO} horas laborables/a\u00f1o). Despu\u00e9s de impuestos y cotizaciones, tu hora neta real es ${hourlyNet}. Esto supone ${dailyNet} netos por cada jornada completa de 8 horas.`,
    },
    {
      question: `\u00bfEs buen sueldo ${amtStr} \u20ac brutos en Espa\u00f1a ${CURRENT_FISCAL_YEAR}?`,
      answer: pctMedian >= 0
        ? `${amtStr} \u20ac brutos anuales est\u00e1n un ${pctMedianStr}% por encima de la mediana salarial espa\u00f1ola (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac seg\u00fan INE). Equivale a ${ratioSMI}x el SMI. ${annualGross > 40000 ? 'Se sit\u00faa en el cuartil superior de la distribuci\u00f3n salarial.' : 'Es un salario competitivo que permite vivir c\u00f3modamente en la mayor\u00eda de ciudades espa\u00f1olas.'}`
        : `${amtStr} \u20ac brutos est\u00e1n un ${pctMedianStr}% bajo la mediana (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac), pero suponen ${ratioSMI}x el SMI. Es un salario habitual en posiciones de entrada o en regiones con menor coste de vida, donde el poder adquisitivo relativo puede ser aceptable.`,
    },
    {
      question: `\u00bfC\u00f3mo puedo aumentar mi neto con ${amtStr} \u20ac brutos?`,
      answer: v === 0
        ? `Tres v\u00edas principales: (1) Retribuci\u00f3n flexible (ticket restaurante, transporte, guarder\u00eda) que no tributa en IRPF; (2) Plan de pensiones (hasta 1.500 \u20ac/a\u00f1o deducibles, ahorro estimado: ${formatEuros(1500 * result.tipoEfectivoIRPF)}); (3) Negociar en especie: seguro m\u00e9dico (exento hasta 500 \u20ac/persona), formaci\u00f3n pagada por empresa.`
        : v === 1
        ? `Con un tipo efectivo del ${tipoEfectivo}%, las opciones para mejorar tu neto incluyen: maximizar plan de pensiones (\u2248${formatEuros(1500 * result.tipoEfectivoIRPF)} de ahorro), solicitar ticket restaurante a tu empresa (\u2248${formatEuros(11 * 220 * result.tipoEfectivoIRPF)} de ahorro fiscal), y revisar deducciones auton\u00f3micas aplicables.`
        : `Para optimizar ${amtStr} \u20ac brutos: plan de pensiones a tope ahorra ~${formatEuros(1500 * result.tipoEfectivoIRPF)} en IRPF; la retribuci\u00f3n flexible (comida, transporte, guarder\u00eda) puede sumar otros ${formatEuros(3000 * result.tipoEfectivoIRPF)}; y las deducciones por alquiler o hijos (seg\u00fan CCAA) a\u00f1aden 200-800 \u20ac m\u00e1s.`,
    },
    {
      question: `\u00bfCu\u00e1nto me queda a la semana con ${amtStr} \u20ac brutos?`,
      answer: `Con ${amtStr} \u20ac brutos anuales, tu neto semanal es ${weeklyNet} (${formatEuros(result.netoAnual)} anuales / 52 semanas). D\u00eda a d\u00eda, dispones de ${dailyNet} netos en d\u00edas laborables o ${formatEuros(result.netoAnual / 365)} si cuentas los 365 d\u00edas del a\u00f1o.`,
    },
  ];

  return faqs;
}

// \u2500\u2500 getRaiseSimulation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface RaiseScenario {
  raisePercent: number;
  newGross: number;
  newNetMonthly: number;
  netGainMonthly: number;
  netGainAnnual: number;
  effectiveTaxOnRaise: number;
}

export function getRaiseSimulation(amount: number, result: DesgloseSueldo): {
  intro: string;
  scenarios: RaiseScenario[];
  conclusion: string;
} {
  const v = getVariation(amount, 8);
  const annualGross = result.brutoAnual;

  // We need to import the calculation function - but since this is a library,
  // we'll compute inline with simplified marginal estimation
  const raisePercents = [3, 5, 10, 15, 20];
  const scenarios: RaiseScenario[] = raisePercents.map(pct => {
    const raiseAmount = annualGross * pct / 100;
    const newGross = annualGross + raiseAmount;
    // Estimate new net using effective rate (simplified)
    // Marginal rate is higher than effective, estimate it
    const marginalRate = Math.min(0.47, result.tipoEfectivoTotal + 0.08);
    const netGainAnnual = raiseAmount * (1 - marginalRate);
    const newNetAnnual = result.netoAnual + netGainAnnual;
    const newNetMonthly = newNetAnnual / 14;
    return {
      raisePercent: pct,
      newGross: Math.round(newGross),
      newNetMonthly: Math.round(newNetMonthly * 100) / 100,
      netGainMonthly: Math.round(netGainAnnual / 14 * 100) / 100,
      netGainAnnual: Math.round(netGainAnnual),
      effectiveTaxOnRaise: Math.round(marginalRate * 100),
    };
  });

  const effectiveStr = (result.tipoEfectivoIRPF * 100).toFixed(1);
  const totalEffStr = (result.tipoEfectivoTotal * 100).toFixed(1);
  const marginalStr = scenarios[0].effectiveTaxOnRaise;
  const raise10bruto = formatEuros(annualGross * 0.10);
  const raise10netoAnual = formatEuros(scenarios[2].netGainAnnual);
  const raise10netoMes = formatEuros(scenarios[2].netGainMonthly);
  const raise5netoMes = formatEuros(scenarios[1].netGainMonthly);

  const introVariants = [
    `\u00bfQu\u00e9 pasa si consigues un aumento desde ${formatAmountSpanish(annualGross)} \u20ac brutos? Debido a la progresividad del IRPF, cada euro adicional tributa a un tipo marginal superior a tu tipo efectivo actual del ${effectiveStr}%. A continuaci\u00f3n simulamos el impacto real de distintos incrementos:`,
    `Simulaci\u00f3n de subida salarial partiendo de ${formatAmountSpanish(annualGross)} \u20ac brutos. Tu tipo efectivo actual es ${totalEffStr}%, pero los euros adicionales tributan al marginal (estimado ~${marginalStr}%). Veamos cu\u00e1nto llegar\u00eda realmente a tu bolsillo:`,
    `Si negociases un aumento sobre tus ${formatAmountSpanish(annualGross)} \u20ac brutos actuales, \u00bfcu\u00e1nto m\u00e1s cobrar\u00edas neto? La respuesta no es lineal: el tipo marginal aplicable a los euros extra (~${marginalStr}%) supera tu tipo efectivo (${totalEffStr}%). Aqu\u00ed tienes la estimaci\u00f3n:`,
    `Proyecci\u00f3n de incremento salarial desde ${formatAmountSpanish(annualGross)} \u20ac brutos anuales. El sistema fiscal progresivo hace que un aumento del 10% en bruto no suponga un 10% m\u00e1s de neto: tu tipo marginal (~${marginalStr}%) absorbe m\u00e1s que el tipo efectivo actual (${totalEffStr}%). Detalle:`,
    `\u00bfCu\u00e1nto notar\u00edas en tu cuenta si te subieran el sueldo? Partiendo de ${formatAmountSpanish(annualGross)} \u20ac brutos con un tipo efectivo del ${totalEffStr}%, los euros adicionales estar\u00edan gravados al ~${marginalStr}% marginal. Simulamos cinco escenarios de subida:`,
    `Escenarios de aumento desde ${formatAmountSpanish(annualGross)} \u20ac brutos: la brecha entre tu tipo efectivo (${totalEffStr}%) y el marginal (~${marginalStr}%) determina cu\u00e1ntos c\u00e9ntimos de cada euro extra llegan realmente a tu bolsillo. Aproximadamente ${100 - marginalStr} de cada 100 \u20ac brutos extra se convierten en neto:`,
    `Tabla de subidas salariales sobre ${formatAmountSpanish(annualGross)} \u20ac brutos. Atenci\u00f3n: con un tipo IRPF efectivo del ${effectiveStr}% y un marginal estimado del ~${marginalStr}%, la diferencia entre ganar m\u00e1s en bruto y cobrar m\u00e1s en neto es sustancial. Estos son los n\u00fameros reales:`,
    `An\u00e1lisis de subida salarial para quien cobra ${formatAmountSpanish(annualGross)} \u20ac brutos: tu tipo efectivo total es ${totalEffStr}%, pero Hacienda grava cada euro adicional al ~${marginalStr}%. \u00bfResultado? De cada 100 \u20ac de aumento bruto, solo ~${100 - marginalStr} \u20ac llegan a tu cuenta. Veamos el impacto por tramos:`,
  ];

  const conclusionVariants = [
    `Como se observa, un aumento del ${raisePercents[2]}% en bruto (+${raise10bruto}) se traduce en solo +${raise10netoAnual} netos al a\u00f1o, porque el ${scenarios[2].effectiveTaxOnRaise}% del incremento se destina a impuestos y cotizaciones. Aun as\u00ed, cada subida mejora tu base de cotizaci\u00f3n futura (pensi\u00f3n, desempleo).`,
    `En resumen: de un aumento del 10% (${raise10bruto} brutos extra), ganar\u00edas ${raise10netoAnual} netos anuales (+${raise10netoMes}/mes). La presi\u00f3n marginal del ${scenarios[2].effectiveTaxOnRaise}% reduce el impacto, pero el neto siempre crece y mejoras tu protecci\u00f3n social.`,
    `Conclusi\u00f3n: aunque la progresividad fiscal absorbe parte de la subida (~${scenarios[2].effectiveTaxOnRaise}% de cada euro extra), siempre sale a cuenta ganar m\u00e1s. Un +10% bruto desde ${formatAmountSpanish(annualGross)} \u20ac a\u00f1ade ${raise10netoMes} a tu n\u00f3mina mensual. Adem\u00e1s, la base reguladora para prestaciones (jubilaci\u00f3n, baja) tambi\u00e9n se incrementa.`,
    `Dato clave para tu negociaci\u00f3n: un 5% de subida bruta a\u00f1ade ${raise5netoMes} netos al mes; un 10% te da ${raise10netoMes} m\u00e1s mensuales. El tipo marginal del ${scenarios[2].effectiveTaxOnRaise}% se lleva una parte importante, pero tu prestaci\u00f3n futura por jubilaci\u00f3n y desempleo tambi\u00e9n mejora proporcionalmente.`,
    `Resultado: con una subida del 10% sobre ${formatAmountSpanish(annualGross)} \u20ac, cobrar\u00edas ${raise10netoMes} m\u00e1s al mes (${raise10netoAnual}/a\u00f1o netos). De los ${raise10bruto} de incremento bruto, Hacienda y la SS absorben ~${formatEuros(annualGross * 0.10 - scenarios[2].netGainAnnual)}. Sin embargo, el efecto compuesto a 10 a\u00f1os de esos ${raise10netoAnual} anuales extra invertidos al 7% superar\u00eda los ${formatEuros(scenarios[2].netGainAnnual * 14)}.`,
    `La progresi\u00f3n salarial desde ${formatAmountSpanish(annualGross)} \u20ac muestra un patr\u00f3n claro: por cada 1% de subida bruta, tu neto mensual crece en ~${formatEuros(scenarios[0].netGainMonthly / 3)}. Un aumento del 10% a\u00f1ade ${raise10netoMes}/mes a tu n\u00f3mina. Consejo: si puedes elegir entre aumento en bruto o beneficios exentos (ticket restaurante, seguro m\u00e9dico), los segundos tributan menos.`,
    `\u00bfMerece la pena negociar? Siempre. Incluso con el ${scenarios[2].effectiveTaxOnRaise}% de presi\u00f3n marginal, un +10% bruto supone ${raise10netoMes} m\u00e1s al mes netos (+${raise10netoAnual}/a\u00f1o). Adem\u00e1s, tu base de cotizaci\u00f3n sube, mejorando prestaciones como la pensi\u00f3n de jubilaci\u00f3n (calculada sobre los \u00faltimos 25 a\u00f1os cotizados).`,
    `Perspectiva: un aumento del 10% desde ${formatAmountSpanish(annualGross)} \u20ac genera ${raise10netoAnual} netos extra al a\u00f1o (${raise10netoMes}/mes). El ${scenarios[2].effectiveTaxOnRaise}% de presi\u00f3n marginal puede parecer alto, pero recuerda que esa cotizaci\u00f3n adicional tambi\u00e9n aumenta tu pensi\u00f3n futura, tu prestaci\u00f3n por desempleo y tu cobertura sanitaria.`,
  ];

  return {
    intro: introVariants[v],
    scenarios,
    conclusion: conclusionVariants[v],
  };
}

// \u2500\u2500 getBudgetBreakdown \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface BudgetCategory {
  categoria: string;
  porcentaje: number;
  eurosMes: number;
  nota: string;
}

export function getBudgetBreakdown(netMonthly: number): {
  intro: string;
  categories: BudgetCategory[];
  conclusion: string;
} {
  const v = getVariation(Math.round(netMonthly), 4);

  // Salary-level-adaptive percentages instead of fixed 50/30/20
  let pctVivienda: number;
  let pctAlimentacion: number;
  let pctTransporte: number;
  let pctSuministros: number;
  let pctSeguros: number;
  let pctOcio: number;
  let pctRopa: number;
  let pctAhorro: number;
  let pctEmergencia: number;
  let budgetModel: string;
  let notaVivienda: string;
  let notaAhorro: string;
  let notaOcio: string;

  if (netMonthly < 1200) {
    // Muy bajo: vivienda consume mucho, ahorro m\u00ednimo
    pctVivienda = 40; pctAlimentacion = 18; pctTransporte = 10;
    pctSuministros = 8; pctSeguros = 3; pctOcio = 8;
    pctRopa = 3; pctAhorro = 5; pctEmergencia = 5;
    budgetModel = '65/22/13';
    notaVivienda = `Con ${formatEuros(netMonthly)} netos, busca opciones de alquiler compartido o zonas perif\u00e9ricas`;
    notaAhorro = 'Incluso peque\u00f1as cantidades importan: el h\u00e1bito es m\u00e1s valioso que la cifra';
    notaOcio = 'Prioriza ocio gratuito: parques, bibliotecas, eventos municipales';
  } else if (netMonthly < 1500) {
    // Bajo: vivienda alta, ahorro ajustado
    pctVivienda = 35; pctAlimentacion = 15; pctTransporte = 9;
    pctSuministros = 7; pctSeguros = 3; pctOcio = 10;
    pctRopa = 3; pctAhorro = 10; pctEmergencia = 8;
    budgetModel = '60/22/18';
    notaVivienda = `L\u00edmite estricto: no superar ${formatEuros(netMonthly * 0.35)} para evitar estr\u00e9s financiero`;
    notaAhorro = `Objetivo m\u00ednimo: ${formatEuros(netMonthly * 0.10)} mensuales en fondo indexado de bajo coste`;
    notaOcio = `Unos ${formatEuros(netMonthly * 0.10 / 4)}/semana para restaurantes y entretenimiento`;
  } else if (netMonthly < 2000) {
    // Medio-bajo: empieza a haber margen
    pctVivienda = 32; pctAlimentacion = 13; pctTransporte = 8;
    pctSuministros = 6; pctSeguros = 4; pctOcio = 12;
    pctRopa = 4; pctAhorro = 13; pctEmergencia = 8;
    budgetModel = '55/25/20';
    notaVivienda = `Recomendado: no superar ${formatEuros(netMonthly * 0.32)}, buscando equilibrio ubicaci\u00f3n/precio`;
    notaAhorro = `${formatEuros(netMonthly * 0.13 * 12)} anuales invertidos al 7% generan ~${formatEuros(netMonthly * 0.13 * 12 * 14)} en 10 a\u00f1os`;
    notaOcio = `Unos ${formatEuros(netMonthly * 0.12 / 4)}/semana para ocio y restaurantes`;
  } else if (netMonthly < 2500) {
    // Medio: regla cl\u00e1sica adaptada
    pctVivienda = 30; pctAlimentacion = 12; pctTransporte = 7;
    pctSuministros = 5; pctSeguros = 4; pctOcio = 13;
    pctRopa = 4; pctAhorro = 18; pctEmergencia = 7;
    budgetModel = '50/25/25';
    notaVivienda = `M\u00e1ximo recomendado: ${formatEuros(netMonthly * 0.30)}, incluyendo comunidad y seguro hogar`;
    notaAhorro = `${formatEuros(netMonthly * 0.18 * 12)} al a\u00f1o: suficiente para plan de pensiones + fondo indexado`;
    notaOcio = `Unos ${formatEuros(netMonthly * 0.13 / 4)}/semana para restaurantes, viajes y entretenimiento`;
  } else if (netMonthly < 3200) {
    // Medio-alto: mayor margen de ahorro
    pctVivienda = 27; pctAlimentacion = 10; pctTransporte = 7;
    pctSuministros = 4; pctSeguros = 4; pctOcio = 13;
    pctRopa = 4; pctAhorro = 22; pctEmergencia = 9;
    budgetModel = '45/22/33';
    notaVivienda = `Puedes aspirar a vivienda de mejor calidad sin superar el 27% (${formatEuros(netMonthly * 0.27)})`;
    notaAhorro = `Prioriza inversi\u00f3n en fondos indexados: ${formatEuros(netMonthly * 0.22 * 12)} anuales aceleran tu independencia financiera`;
    notaOcio = `Unos ${formatEuros(netMonthly * 0.13 / 4)}/semana para ocio de calidad`;
  } else {
    // Alto: inversi\u00f3n agresiva, vivienda proporcionalmente menor
    pctVivienda = 22; pctAlimentacion = 8; pctTransporte = 6;
    pctSuministros = 3; pctSeguros = 4; pctOcio = 12;
    pctRopa = 4; pctAhorro = 28; pctEmergencia = 13;
    budgetModel = '40/18/42';
    notaVivienda = `A este nivel, la vivienda no deber\u00eda superar el 22% (${formatEuros(netMonthly * 0.22)}): la diferencia va a patrimonio`;
    notaAhorro = `${formatEuros(netMonthly * 0.28 * 12)} anuales: diversifica entre fondos indexados, plan de pensiones y renta fija`;
    notaOcio = `Unos ${formatEuros(netMonthly * 0.12 / 4)}/semana con margen para experiencias premium`;
  }

  // Calculate absolute values
  const vivienda = netMonthly * pctVivienda / 100;
  const alimentacion = netMonthly * pctAlimentacion / 100;
  const transporte = netMonthly * pctTransporte / 100;
  const suministros = netMonthly * pctSuministros / 100;
  const seguros = netMonthly * pctSeguros / 100;
  const ocioDetalle = netMonthly * pctOcio / 100;
  const ropa = netMonthly * pctRopa / 100;
  const ahorroInversion = netMonthly * pctAhorro / 100;
  const fondoEmergencia = netMonthly * pctEmergencia / 100;

  // High-level buckets for intro text
  const necesidades = vivienda + alimentacion + transporte + suministros + seguros;
  const ocio = ocioDetalle + ropa;
  const ahorro = ahorroInversion + fondoEmergencia;

  const pctNecesidades = Math.round(necesidades / netMonthly * 100);
  const pctOcioTotal = Math.round(ocio / netMonthly * 100);
  const pctAhorroTotal = Math.round(ahorro / netMonthly * 100);

  const categories: BudgetCategory[] = [
    { categoria: 'Vivienda (alquiler/hipoteca)', porcentaje: pctVivienda, eurosMes: Math.round(vivienda), nota: notaVivienda },
    { categoria: 'Alimentaci\u00f3n y supermercado', porcentaje: pctAlimentacion, eurosMes: Math.round(alimentacion), nota: `Unos ${formatEuros(alimentacion / 30)}/d\u00eda` },
    { categoria: 'Transporte', porcentaje: pctTransporte, eurosMes: Math.round(transporte), nota: netMonthly < 1500 ? 'Prioriza abono transporte p\u00fablico sobre coche propio' : 'Incluye gasolina, abono transporte o cuota coche' },
    { categoria: 'Suministros (luz, agua, gas, internet)', porcentaje: pctSuministros, eurosMes: Math.round(suministros), nota: netMonthly < 1500 ? 'Busca tarifa social de electricidad y bono social t\u00e9rmico' : 'Estimaci\u00f3n media nacional' },
    { categoria: 'Seguros y salud', porcentaje: pctSeguros, eurosMes: Math.round(seguros), nota: netMonthly < 1500 ? 'Seguro hogar b\u00e1sico; la sanidad p\u00fablica cubre lo esencial' : netMonthly > 3200 ? 'Seguro m\u00e9dico privado completo + dental + hogar' : 'Seguro hogar, dental, copagos' },
    { categoria: 'Ocio y restaurantes', porcentaje: pctOcio, eurosMes: Math.round(ocioDetalle), nota: notaOcio },
    { categoria: 'Ropa y cuidado personal', porcentaje: pctRopa, eurosMes: Math.round(ropa), nota: 'Media anual prorrateada' },
    { categoria: 'Ahorro e inversi\u00f3n', porcentaje: pctAhorro, eurosMes: Math.round(ahorroInversion), nota: notaAhorro },
    { categoria: 'Fondo de emergencia', porcentaje: pctEmergencia, eurosMes: Math.round(fondoEmergencia), nota: `Objetivo: ${formatEuros(necesidades * 6)} (6 meses de gastos fijos)` },
  ];

  const introVariants = [
    `Con ${formatEuros(netMonthly)} netos al mes, la distribuci\u00f3n \u00f3ptima no es la gen\u00e9rica 50/30/20 sino una adaptada a tu nivel de ingresos: ${budgetModel} (necesidades/ocio/ahorro). Esto significa destinar ${formatEuros(necesidades)} a gastos esenciales (${pctNecesidades}%), ${formatEuros(ocio)} a gastos discrecionales (${pctOcioTotal}%) y ${formatEuros(ahorro)} al ahorro e inversi\u00f3n (${pctAhorroTotal}%):`,
    `Tu neto mensual de ${formatEuros(netMonthly)} requiere un presupuesto adaptado a tu realidad. En lugar de la regla est\u00e1ndar, proponemos un ${budgetModel}: ${formatEuros(necesidades)} para lo esencial, ${formatEuros(ocio)} para ocio y ${formatEuros(ahorro)} para construir patrimonio. Detallamos cada partida:`,
    `\u00bfC\u00f3mo distribuir ${formatEuros(netMonthly)} netos al mes? A tu nivel salarial, los expertos recomiendan un reparto ${budgetModel} (necesidades/discrecional/ahorro), diferente de la regla gen\u00e9rica 50/30/20 que no tiene en cuenta el nivel de ingresos. Veamos:`,
    `Presupuesto personalizado sobre ${formatEuros(netMonthly)} netos: con tus ingresos, el ratio \u00f3ptimo es ${budgetModel}. Esto reserva ${formatEuros(ahorro)} para ahorro/inversi\u00f3n (${pctAhorroTotal}%), limita necesidades a ${formatEuros(necesidades)} (${pctNecesidades}%) y deja ${formatEuros(ocio)} para ocio (${pctOcioTotal}%). Desglose:`,
  ];

  const conclusionVariants = [
    `Con esta distribuci\u00f3n, en 12 meses habr\u00edas acumulado ${formatEuros(ahorroInversion * 12)} en inversiones m\u00e1s ${formatEuros(fondoEmergencia * 12)} en fondo de emergencia. En 5 a\u00f1os (sin contar rentabilidad), tu patrimonio l\u00edquido crecer\u00eda en ${formatEuros((ahorroInversion + fondoEmergencia) * 60)}.`,
    `Si mantienes este presupuesto durante un a\u00f1o, ahorras ${formatEuros(ahorro * 12)} (${formatEuros(ahorroInversion * 12)} inversi\u00f3n + ${formatEuros(fondoEmergencia * 12)} emergencia). Con una rentabilidad media del 7% anual en fondos indexados, en 10 a\u00f1os podr\u00edas acumular m\u00e1s de ${formatEuros(ahorroInversion * 12 * 14)}.`,
    `Resultado anual: ${formatEuros(ahorro * 12)} ahorrados (${pctAhorroTotal}% de tu neto anual). Tu fondo de emergencia alcanzar\u00eda ${formatEuros(fondoEmergencia * 12)} tras 12 meses, cubriendo ${(fondoEmergencia * 12 / necesidades).toFixed(1)} meses de gastos fijos.`,
    `Total ahorro anual estimado: ${formatEuros(ahorro * 12)}. Si destinas los ${formatEuros(ahorroInversion)} mensuales a un fondo indexado global (rentabilidad hist\u00f3rica ~7-8%), en 20 a\u00f1os podr\u00edas haber generado un capital superior a ${formatEuros(ahorroInversion * 12 * 35)} (inter\u00e9s compuesto incluido).`,
  ];

  return {
    intro: introVariants[v],
    categories,
    conclusion: conclusionVariants[v],
  };
}

// \u2500\u2500 getUniqueComparisons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface ComparisonPoint {
  label: string;
  value: string;
  diff: string;
}

export function getUniqueComparisons(amount: number, result: DesgloseSueldo): {
  intro: string;
  comparisons: ComparisonPoint[];
  analysis: string;
} {
  const annualGross = result.brutoAnual;
  const v = getVariation(amount, 10);

  // Adjacent salary amounts for comparison
  const lowerAmount = Math.max(SMI_ANUAL, annualGross - 5000);
  const higherAmount = annualGross + 5000;
  const doubleAmount = annualGross * 2;

  // Percentage differences
  const diffToLower = annualGross - lowerAmount;
  const pctDiffNet5k = ((result.netoAnual - (result.netoAnual - diffToLower * (1 - result.tipoEfectivoTotal))) / result.netoAnual * 100).toFixed(1);
  const netGainFor5kMore = 5000 * (1 - Math.min(0.47, result.tipoEfectivoTotal + 0.08));

  const hourlyGross = calcHourlyGross(annualGross);
  const hourlyNet = calcHourlyNet(result.netoAnual);
  const dailyNet = calcDailyNet(result.netoAnual);
  const minuteNet = hourlyNet / 60;
  const marginalRate = Math.round((result.tipoEfectivoTotal + 0.08) * 100);
  const effectiveRate = (result.tipoEfectivoTotal * 100).toFixed(1);
  const netGainMes = formatEuros(netGainFor5kMore / 14);
  const netGainAnual = formatEuros(netGainFor5kMore);
  const weeklyNet = formatEuros(result.netoAnual / 52);

  const comparisons: ComparisonPoint[] = [
    {
      label: `vs. ${formatAmountSpanish(lowerAmount)} \u20ac brutos`,
      value: `+${formatEuros(diffToLower)} brutos/a\u00f1o`,
      diff: `\u2248+${formatEuros(diffToLower * (1 - result.tipoEfectivoTotal))} netos/a\u00f1o`,
    },
    {
      label: `vs. ${formatAmountSpanish(higherAmount)} \u20ac brutos`,
      value: `-5.000 \u20ac brutos/a\u00f1o`,
      diff: `\u2248-${netGainAnual} netos/a\u00f1o respecto al superior`,
    },
    {
      label: `vs. Mediana (${formatAmountSpanish(MEDIANA_SALARIAL)} \u20ac)`,
      value: annualGross >= MEDIANA_SALARIAL ? `+${formatEuros(annualGross - MEDIANA_SALARIAL)}` : `-${formatEuros(MEDIANA_SALARIAL - annualGross)}`,
      diff: `${Math.abs(percentAboveMedian(annualGross)).toFixed(1)}% ${annualGross >= MEDIANA_SALARIAL ? 'por encima' : 'por debajo'}`,
    },
    {
      label: `vs. SMI (${formatAmountSpanish(SMI_ANUAL)} \u20ac)`,
      value: `+${formatEuros(annualGross - SMI_ANUAL)}`,
      diff: `${(annualGross / SMI_ANUAL).toFixed(2)}x el m\u00ednimo legal`,
    },
    {
      label: `Tu minuto de trabajo`,
      value: formatEuros(minuteNet),
      diff: `${formatEuros(hourlyNet)}/hora neta, ${formatEuros(dailyNet)}/d\u00eda`,
    },
  ];

  const introVariants = [
    `Para contextualizar tu salario de ${formatAmountSpanish(annualGross)} \u20ac brutos, veamos c\u00f3mo se compara con referencias clave del mercado laboral espa\u00f1ol y con salarios adyacentes:`,
    `\u00bfCu\u00e1nto supone realmente la diferencia entre ${formatAmountSpanish(annualGross)} \u20ac y otros niveles salariales? Las cifras brutas no cuentan toda la historia, porque la progresividad del IRPF distorsiona los incrementos netos:`,
    `Comparativa salarial desde ${formatAmountSpanish(annualGross)} \u20ac brutos: qu\u00e9 diferencia real habr\u00eda si ganaras algo m\u00e1s o algo menos, y c\u00f3mo te posicionas frente a la mediana y el SMI:`,
    `Posicionamiento de ${formatAmountSpanish(annualGross)} \u20ac brutos en el mapa salarial espa\u00f1ol. Cada comparaci\u00f3n incluye el impacto neto real (descontando impuestos al tipo marginal correspondiente):`,
    `Tu salario de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales no existe en el vac\u00edo. Estas comparaciones muestran cu\u00e1nto ganar\u00edas de m\u00e1s (o de menos) con salarios vecinos, despu\u00e9s de aplicar la progresividad fiscal:`,
    `Entender d\u00f3nde se sit\u00faan ${formatAmountSpanish(annualGross)} \u20ac brutos en el mercado espa\u00f1ol requiere comparar con el SMI, la mediana y salarios adyacentes. La progresividad fiscal hace que las diferencias brutas no se trasladen linealmente al neto:`,
    `\u00bfC\u00f3mo de lejos est\u00e1s de otros niveles salariales? Con ${formatAmountSpanish(annualGross)} \u20ac brutos, la siguiente tabla cuantifica la distancia real (en euros netos, no brutos) frente a puntos de referencia del mercado:`,
    `An\u00e1lisis comparativo de ${formatAmountSpanish(annualGross)} \u20ac brutos: cada fila muestra la diferencia con un salario de referencia, expresada tanto en bruto como en su impacto neto real, teniendo en cuenta que el tipo marginal (~${marginalRate}%) supera tu efectivo (${effectiveRate}%):`,
    `Benchmark salarial: con ${formatAmountSpanish(annualGross)} \u20ac brutos anuales (${formatEuros(hourlyNet)} netos/hora), \u00bfcu\u00e1nto te separa de la mediana, del SMI y de sueldos cercanos? La respuesta en euros netos reales:`,
    `Tabla comparativa desde ${formatAmountSpanish(annualGross)} \u20ac brutos anuales. Recuerda: cada euro adicional que ganes tributa al marginal (~${marginalRate}%), no al efectivo (${effectiveRate}%), por lo que las diferencias netas son menores de lo que cabr\u00eda esperar:`,
  ];

  const analysisVariants = [
    `Observa que ganar 5.000 \u20ac m\u00e1s brutos no se traduce en 5.000 \u20ac m\u00e1s netos: esos euros extra tributan al marginal (~${marginalRate}%), generando solo ~${netGainAnual} netos adicionales al a\u00f1o (${netGainMes}/mes con 14 pagas). Cada minuto que trabajas genera ${formatEuros(minuteNet)} netos en tu bolsillo.`,
    `La clave es el tipo marginal: mientras tu tipo efectivo es ${effectiveRate}%, los pr\u00f3ximos euros que ganes tributan al ~${marginalRate}%. As\u00ed, 5.000 \u20ac brutos extra generan ~${netGainAnual} netos (+${netGainMes}/mes). Tu trabajo vale ${formatEuros(minuteNet)} netos por minuto.`,
    `A nivel pr\u00e1ctico: si tu empresa te ofreciera un aumento de 5.000 \u20ac brutos anuales, ver\u00edas ~${netGainMes} m\u00e1s al mes en tu cuenta (${netGainAnual}/a\u00f1o netos). La diferencia entre tu bruto y tu neto refleja que tu hora de trabajo genera ${formatEuros(hourlyGross)} brutos pero solo ${formatEuros(hourlyNet)} netos (${formatEuros(minuteNet)}/minuto).`,
    `Perspectiva temporal: cada hora que trabajas con ${formatAmountSpanish(annualGross)} \u20ac brutos vale ${formatEuros(hourlyNet)} netos (${formatEuros(minuteNet)}/minuto). Si ascendieras 5.000 \u20ac en bruto, a\u00f1adir\u00edas ~${formatEuros(netGainFor5kMore / HORAS_LABORABLES_ANIO)} netos por hora m\u00e1s (total estimado: ${formatEuros(hourlyNet + netGainFor5kMore / HORAS_LABORABLES_ANIO)}/hora neta).`,
    `El efecto tijera fiscal se hace evidente: con un tipo marginal estimado del ~${marginalRate}%, un incremento de 5.000 \u20ac brutos se reduce a ~${netGainAnual} netos (${netGainMes}/mes). Dicho de otro modo, de cada 100 \u20ac extra de bruto, solo ${100 - marginalRate} \u20ac llegan a tu cuenta. Aun as\u00ed, tu poder adquisitivo semanal (${weeklyNet} netos) seguir\u00eda siendo superior al de la mayor\u00eda.`,
    `En t\u00e9rminos de valor del tiempo: con ${formatAmountSpanish(annualGross)} \u20ac brutos, generas ${formatEuros(hourlyGross)} brutos por hora pero solo recibes ${formatEuros(hourlyNet)} netos (${formatEuros(minuteNet)}/minuto). Un aumento de 5.000 \u20ac incrementar\u00eda tu hora neta en apenas ${formatEuros(netGainFor5kMore / HORAS_LABORABLES_ANIO)} por la presi\u00f3n marginal del ${marginalRate}%.`,
    `Lecci\u00f3n clave de esta comparativa: la progresividad fiscal espa\u00f1ola hace que ganar 5.000 \u20ac m\u00e1s en bruto solo a\u00f1ada ${netGainMes} netos a tu paga mensual (${netGainAnual}/a\u00f1o). Sin embargo, el aumento tambi\u00e9n eleva tu base de cotizaci\u00f3n para la pensi\u00f3n y la prestaci\u00f3n por desempleo, beneficios que no se reflejan en el neto inmediato.`,
    `\u00bfMerece la pena ganar m\u00e1s? Absolutamente, pero con expectativas realistas. De 5.000 \u20ac brutos adicionales, ~${formatEuros(5000 - netGainFor5kMore)} se quedan en impuestos y cotizaciones (tipo marginal del ~${marginalRate}%). Tu neto mensual subir\u00eda ${netGainMes} y tu valor horario pasar\u00eda de ${formatEuros(hourlyNet)} a ${formatEuros(hourlyNet + netGainFor5kMore / HORAS_LABORABLES_ANIO)}.`,
    `Datos para la negociaci\u00f3n salarial: con tu tipo marginal del ~${marginalRate}%, necesitas un aumento bruto de ~${formatEuros(100 * 14 / (1 - (result.tipoEfectivoTotal + 0.08)))} para ver 100 \u20ac m\u00e1s netos al mes. Un incremento de 5.000 \u20ac se traduce en ${netGainMes}/mes netos. Tu minuto de trabajo actual rinde ${formatEuros(minuteNet)} netos.`,
    `Resumen de la comparativa: frente a la mediana nacional, tu salario de ${formatAmountSpanish(annualGross)} \u20ac est\u00e1 ${Math.abs(percentAboveMedian(annualGross)).toFixed(1)}% ${annualGross >= MEDIANA_SALARIAL ? 'por encima' : 'por debajo'}. Un salto de 5.000 \u20ac brutos a\u00f1adir\u00eda ${netGainMes}/mes netos a tu n\u00f3mina. El valor de tu tiempo: ${formatEuros(hourlyNet)} netos/hora, ${formatEuros(dailyNet)}/d\u00eda laborable.`,
  ];

  return {
    intro: introVariants[v],
    comparisons,
    analysis: analysisVariants[v],
  };
}

// \u2500\u2500 getTimeToEarn \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface TimeToEarnItem {
  concepto: string;
  coste: number;
  horasNetas: string;
  diasLaborables: string;
}

export function getTimeToEarn(result: DesgloseSueldo): {
  intro: string;
  items: TimeToEarnItem[];
  conclusion: string;
} {
  const hourlyNet = result.netoAnual / HORAS_LABORABLES_ANIO;
  const dailyNet = result.netoAnual / DIAS_LABORABLES_ANIO;
  const netoMensual = result.netoMensual;
  const v = getVariation(Math.round(result.brutoAnual / 100), 3);

  function buildItem(concepto: string, coste: number): TimeToEarnItem {
    return {
      concepto,
      coste,
      horasNetas: (coste / hourlyNet).toFixed(1),
      diasLaborables: coste / dailyNet < 10 ? (coste / dailyNet).toFixed(2) : (coste / dailyNet).toFixed(1),
    };
  }

  // Salary-level-appropriate expense items
  let items: TimeToEarnItem[];
  let referenceCost: number;
  let referenceLabel: string;

  if (netoMensual < 1200) {
    // Low salary: basic necessities focus
    referenceCost = 550;
    referenceLabel = 'habitaci\u00f3n en piso compartido';
    items = [
      buildItem('Compra semanal (supermercado b\u00e1sico)', 50),
      buildItem('Abono de transporte mensual', 40),
      buildItem('Factura de m\u00f3vil (tarifa b\u00e1sica)', 15),
      buildItem('Factura de luz mensual', 55),
      buildItem('Men\u00fa del d\u00eda en bar', 14),
      buildItem('Consulta dentista (revisi\u00f3n)', 35),
      buildItem('Habitaci\u00f3n en piso compartido (mes)', 550),
      buildItem('Zapatillas deportivas', 65),
    ];
  } else if (netoMensual < 1500) {
    // Low-medium: still necessity-focused but slightly broader
    referenceCost = 650;
    referenceLabel = 'alquiler de habitaci\u00f3n o estudio';
    items = [
      buildItem('Compra semanal (supermercado)', 65),
      buildItem('Abono transporte mensual', 55),
      buildItem('Factura m\u00f3vil + internet', 45),
      buildItem('Factura de luz + gas mensual', 80),
      buildItem('Cena en pizzer\u00eda', 25),
      buildItem('Suscripci\u00f3n streaming (anual)', 70),
      buildItem('Alquiler estudio/habitaci\u00f3n (mes)', 650),
      buildItem('Escapada fin de semana (bus + hostal)', 120),
    ];
  } else if (netoMensual < 2000) {
    // Medium-low: mixed necessities and some comfort
    referenceCost = 750;
    referenceLabel = 'alquiler medio en ciudad secundaria';
    items = [
      buildItem('Compra semanal (supermercado)', 75),
      buildItem('Cuota gimnasio mensual', 40),
      buildItem('Factura m\u00f3vil + fibra', 55),
      buildItem('Cena para dos en restaurante', 50),
      buildItem('Tanque de gasolina (50L)', 85),
      buildItem('Smartphone gama media', 350),
      buildItem('Alquiler piso peque\u00f1o (mes)', 750),
      buildItem('Escapada de fin de semana (tren + hotel)', 200),
    ];
  } else if (netoMensual < 2500) {
    // Medium: balanced lifestyle items
    referenceCost = 850;
    referenceLabel = 'alquiler medio en Espa\u00f1a';
    items = [
      buildItem('Compra semanal (supermercado)', 85),
      buildItem('Cuota gimnasio + clase dirigida', 55),
      buildItem('Factura m\u00f3vil + fibra + streaming', 65),
      buildItem('Cena para dos (restaurante medio)', 65),
      buildItem('Vuelo ida/vuelta nacional', 120),
      buildItem('Port\u00e1til nuevo (gama media-alta)', 899),
      buildItem('Alquiler mensual (media Espa\u00f1a)', 850),
      buildItem('Seguro coche anual (a terceros ampliado)', 400),
    ];
  } else if (netoMensual < 3200) {
    // Medium-high: comfort and some aspirational items
    referenceCost = 1100;
    referenceLabel = 'alquiler en Madrid/Barcelona (fuera del centro)';
    items = [
      buildItem('Compra semanal (supermercado premium)', 100),
      buildItem('Cuota gimnasio premium + spa', 80),
      buildItem('Cena para dos (restaurante gastron\u00f3mico)', 110),
      buildItem('Vuelo europeo ida/vuelta', 180),
      buildItem('iPhone nuevo (gama alta)', 1299),
      buildItem('Alquiler Madrid/BCN extrarradio (mes)', 1100),
      buildItem('Cuota de coche nuevo (leasing mensual)', 350),
      buildItem('Fin de semana en hotel rural (2 noches)', 280),
    ];
  } else {
    // High: aspirational and investment-oriented items
    referenceCost = 1500;
    referenceLabel = 'alquiler en zona prime de gran ciudad';
    items = [
      buildItem('Compra semanal (gourmet + ecol\u00f3gico)', 130),
      buildItem('Seguro m\u00e9dico privado familiar (mes)', 200),
      buildItem('Cena de celebraci\u00f3n (restaurante estrella)', 200),
      buildItem('Vuelo internacional (ida/vuelta business)', 1200),
      buildItem('Rel\u00f3j de calidad', 2500),
      buildItem('Alquiler zona prime gran ciudad (mes)', 1500),
      buildItem('Cuota mensual coche premium (leasing)', 550),
      buildItem('Aportaci\u00f3n mensual a cartera de inversi\u00f3n', 1000),
    ];
  }

  const introVariants = [
    `\u00bfCu\u00e1nto tiempo de trabajo real necesitas para pagar gastos cotidianos? Con tu hora neta de ${formatEuros(hourlyNet)} (${formatEuros(dailyNet)}/d\u00eda laborable), aqu\u00ed tienes la equivalencia en tiempo trabajado para gastos relevantes a tu nivel salarial:`,
    `Para entender el valor real de tu tiempo con ${formatAmountSpanish(result.brutoAnual)} \u20ac brutos: cada hora tuya genera ${formatEuros(hourlyNet)} netos. Veamos cu\u00e1ntas horas de trabajo cuestan los gastos m\u00e1s habituales para alguien con tu neto de ${formatEuros(netoMensual)}/mes:`,
    `Tu hora de trabajo neta vale ${formatEuros(hourlyNet)} y tu jornada completa ${formatEuros(dailyNet)}. Esta tabla te muestra exactamente cu\u00e1ntas horas (o d\u00edas) necesitas trabajar para cubrir cada gasto t\u00edpico de tu franja de ingresos:`,
  ];

  const conclusionVariants = [
    `En resumen: tu ${referenceLabel} te cuesta ${(referenceCost / dailyNet).toFixed(1)} jornadas laborables de las ${(DIAS_LABORABLES_ANIO / 12).toFixed(0)} que trabajas al mes. ${referenceCost / netoMensual > 0.35 ? 'Esto supera el 35% recomendado de tu neto, lo que puede limitar tu capacidad de ahorro.' : 'Esto se mantiene dentro del rango recomendado, dejando margen para ahorro e inversi\u00f3n.'}`,
    `Perspectiva pr\u00e1ctica: de las ~${(DIAS_LABORABLES_ANIO / 12).toFixed(0)} jornadas laborables mensuales, ${(referenceCost / dailyNet).toFixed(1)} se destinan solo a vivienda. ${hourlyNet > 15 ? 'Tu hora neta de ' + formatEuros(hourlyNet) + ' te permite un nivel de vida c\u00f3modo si controlas los gastos discrecionales.' : 'Con ' + formatEuros(hourlyNet) + '/hora neta, cada gasto impulsivo supone un esfuerzo significativo en horas de trabajo.'}`,
    `Cada d\u00eda que trabajas con este sueldo genera ${formatEuros(dailyNet)} netos. Eso significa que una compra impulsiva de ${netoMensual < 1500 ? '50' : netoMensual < 2500 ? '100' : '200'} \u20ac te cuesta ${(((netoMensual < 1500 ? 50 : netoMensual < 2500 ? 100 : 200)) / hourlyNet).toFixed(1)} horas de tu vida laboral. Pensar en t\u00e9rminos de \u201choras de trabajo\u201d suele ser la mejor herramienta para controlar el gasto.`,
  ];

  return {
    intro: introVariants[v],
    items,
    conclusion: conclusionVariants[v],
  };
}

// \u2500\u2500 getAnnualTimeline \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getAnnualTimeline(result: DesgloseSueldo): {
  intro: string;
  lines: string[];
} {
  const annualGross = result.brutoAnual;
  const v = getVariation(Math.round(annualGross / 500), 4);
  const dailyGross = annualGross / 365;
  const dailyNet = result.netoAnual / 365;

  // Tax Freedom Day: how many days you work just for taxes
  const totalTax = result.seguridadSocialAnual + result.irpfTotalAnual;
  const taxDays = Math.round(totalTax / dailyGross);
  const taxFreedomDate = new Date(2026, 0, 1 + taxDays);
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const taxFreedomStr = `${taxFreedomDate.getDate()} de ${months[taxFreedomDate.getMonth()]}`;

  // How much you earn while sleeping (8h/day)
  const earnSleeping = (result.netoAnual / 365 / 24 * 8);

  // Seconds to earn 1 euro net
  const secondsPerEuro = 3600 / (result.netoAnual / HORAS_LABORABLES_ANIO);

  const introVariants = [
    `Visualizando tu salario de ${formatAmountSpanish(annualGross)} \u20ac brutos en el calendario: tu \u201cD\u00eda de Liberaci\u00f3n Fiscal\u201d cae el ${taxFreedomStr}. Hasta esa fecha, todo lo que ganas se destina \u00edntegramente a impuestos y cotizaciones (${taxDays} d\u00edas naturales). A partir de ah\u00ed, cada euro es tuyo.`,
    `Con ${formatAmountSpanish(annualGross)} \u20ac brutos, trabajas los primeros ${taxDays} d\u00edas del a\u00f1o solo para Hacienda y la Seguridad Social. Tu D\u00eda de Liberaci\u00f3n Fiscal es el ${taxFreedomStr}. Desde esa fecha, cada c\u00e9ntimo que generas va directamente a tu cuenta bancaria.`,
    `Tu calendario fiscal con ${formatAmountSpanish(annualGross)} \u20ac brutos: del 1 de enero al ${taxFreedomStr} (${taxDays} d\u00edas), tu salario va \u00edntegro a impuestos. Esto supone que dedicas el ${(taxDays / 365 * 100).toFixed(1)}% del a\u00f1o a financiar servicios p\u00fablicos antes de empezar a cobrar para ti.`,
    `Dato revelador: con tu salario de ${formatAmountSpanish(annualGross)} \u20ac, necesitas ${taxDays} d\u00edas naturales (hasta el ${taxFreedomStr}) para cubrir toda tu carga fiscal anual. El ${(100 - taxDays / 365 * 100).toFixed(1)}% restante del a\u00f1o es ingreso neto efectivo.`,
  ];

  const lines = [
    `Ganas ${formatEuros(dailyNet)} netos cada d\u00eda del a\u00f1o (incluidos fines de semana y festivos, prorrateando tu salario anual).`,
    `Cada segundo de trabajo efectivo genera ${(1/secondsPerEuro).toFixed(4)} \u20ac netos. Necesitas ${secondsPerEuro.toFixed(0)} segundos para ganar 1 \u20ac limpio.`,
    `Mientras duermes 8 horas, tu salario prorrateado equivale a \u201cganar\u201d ${formatEuros(earnSleeping)} (es decir, esa es la parte proporcional de tu neto diario durante el sue\u00f1o).`,
    `Tu IRPF total (${formatEuros(result.irpfTotalAnual)}) equivale a ${(result.irpfTotalAnual / dailyGross).toFixed(0)} d\u00edas de trabajo \u00edntegros destinados al impuesto sobre la renta.`,
    `Tus cotizaciones sociales (${formatEuros(result.seguridadSocialAnual)}) financian ${(result.seguridadSocialAnual / dailyGross).toFixed(0)} d\u00edas de salario bruto, que van a tu futura pensi\u00f3n, desempleo y sanidad p\u00fablica.`,
  ];

  return { intro: introVariants[v], lines };
}

// \u2500\u2500 getSalaryMilestones \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getSalaryMilestones(amount: number, result: DesgloseSueldo): string {
  const annualGross = result.brutoAnual;
  const v = getVariation(amount, 5);
  const netPerYear = result.netoAnual;

  // Savings milestones
  const savingsRate20 = result.netoMensual * 0.20;
  const monthsTo10k = Math.ceil(10000 / savingsRate20);
  const monthsTo50k = Math.ceil(50000 / savingsRate20);
  const yearsTo100k = (100000 / (savingsRate20 * 12)).toFixed(1);

  // Purchasing power milestones
  const monthsForCar = Math.ceil(20000 / savingsRate20);
  const yearsForDownPayment = (40000 / (savingsRate20 * 12)).toFixed(1);

  // Career earnings over time
  const earningsIn5Years = formatEurosRound(netPerYear * 5);
  const earningsIn10Years = formatEurosRound(netPerYear * 10);
  const earningsIn20Years = formatEurosRound(netPerYear * 20);

  const variants = [
    `Hitos financieros con ${formatAmountSpanish(annualGross)} \u20ac brutos (ahorrando el 20% de tu neto = ${formatEuros(savingsRate20)}/mes): alcanzar\u00edas 10.000 \u20ac ahorrados en ${monthsTo10k} meses, 50.000 \u20ac en ${monthsTo50k} meses, y la barrera de 100.000 \u20ac en ${yearsTo100k} a\u00f1os (sin contar rentabilidad de inversiones). Para una entrada de vivienda de 40.000 \u20ac necesitar\u00edas aproximadamente ${yearsForDownPayment} a\u00f1os ahorrando al 20%. En total, a lo largo de tu carrera cobrar\u00e1s ${earningsIn10Years} netos en 10 a\u00f1os y ${earningsIn20Years} en 20, sin contar subidas salariales.`,
    `Proyecci\u00f3n de ahorro partiendo de ${formatAmountSpanish(annualGross)} \u20ac brutos: destinando ${formatEuros(savingsRate20)} al mes (20% del neto), en ${monthsTo10k} meses tendr\u00e1s un colch\u00f3n de 10.000 \u20ac. Un coche de 20.000 \u20ac requerir\u00eda ${monthsForCar} meses de ahorro disciplinado. Si inviertes ese ahorro al 7% anual, en 10 a\u00f1os tu capital crecer\u00eda a unos ${formatEurosRound(savingsRate20 * 12 * 10 * 1.4)} (vs. ${formatEurosRound(savingsRate20 * 12 * 10)} sin rentabilidad). Tu ingreso neto acumulado en 5 a\u00f1os: ${earningsIn5Years}.`,
    `Mapa temporal de tu dinero con ${formatAmountSpanish(annualGross)} \u20ac brutos: el 20% de tu neto mensual es ${formatEuros(savingsRate20)}. Con esa disciplina: 10.000 \u20ac en ${monthsTo10k} meses, entrada de piso (40.000 \u20ac) en ${yearsForDownPayment} a\u00f1os, y 100.000 \u20ac de patrimonio acumulado en ${yearsTo100k} a\u00f1os. A lo largo de una d\u00e9cada, tu trabajo generar\u00e1 ${earningsIn10Years} netos totales, y en dos d\u00e9cadas ${earningsIn20Years}.`,
    `Con ${formatEuros(savingsRate20)}/mes de ahorro (20% del neto con ${formatAmountSpanish(annualGross)} \u20ac brutos), tus hitos ser\u00edan: fondo de emergencia de 6 meses (${formatEuros(result.netoMensual * 3)}) en ${Math.ceil(result.netoMensual * 3 / savingsRate20)} meses; primer pago de hipoteca ahorrado (40.000 \u20ac) en ${yearsForDownPayment} a\u00f1os; independencia financiera b\u00e1sica (25x gastos anuales) posiblemente inalcanzable solo con ahorro, necesitas inversi\u00f3n. Ingresos netos acumulados en 20 a\u00f1os: ${earningsIn20Years}.`,
    `Perspectiva a largo plazo desde ${formatAmountSpanish(annualGross)} \u20ac brutos: tu neto anual de ${formatEuros(netPerYear)} te permite ahorrar ${formatEuros(savingsRate20 * 12)} al a\u00f1o si mantienes el 20%. Primer objetivo (fondo de emergencia ${formatEuros(result.netoMensual * 6)}): ${Math.ceil(result.netoMensual * 6 / savingsRate20)} meses. Segundo objetivo (inversi\u00f3n de 50.000 \u20ac): ${monthsTo50k} meses. Ingresos netos vitalicios estimados (35 a\u00f1os de carrera): ${formatEurosRound(netPerYear * 35)}.`,
  ];

  return variants[v];
}

// \u2500\u2500 getCCAAInsight \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500 getDetailedDeductionAnalysis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getDetailedDeductionAnalysis(amount: number, result: DesgloseSueldo): string {
  const v = getVariation(amount, 10);
  const annualGross = result.brutoAnual;
  const ssAnual = result.seguridadSocialAnual;
  const irpfTotal = result.irpfTotalAnual;
  const irpfEstatal = result.irpfEstatalAnual;
  const irpfCCAA = result.irpfAutonomicoAnual;
  const totalDeducciones = ssAnual + irpfTotal;
  const netoAnual = result.netoAnual;

  const pctSS = (ssAnual / annualGross * 100).toFixed(2);
  const pctIRPF = (irpfTotal / annualGross * 100).toFixed(2);
  const pctTotal = (totalDeducciones / annualGross * 100).toFixed(2);
  const pctEstatal = (irpfEstatal / irpfTotal * 100).toFixed(1);
  const pctCCAA = (irpfCCAA / irpfTotal * 100).toFixed(1);

  const ssDiario = ssAnual / DIAS_LABORABLES_ANIO;
  const irpfDiario = irpfTotal / DIAS_LABORABLES_ANIO;
  const ssHora = ssAnual / HORAS_LABORABLES_ANIO;
  const irpfHora = irpfTotal / HORAS_LABORABLES_ANIO;

  const retencionPorPaga = irpfTotal / 14;
  const ssPorPaga = ssAnual / 12; // SS always /12
  const ssMinuto = ssHora / 60;
  const irpfMinuto = irpfHora / 60;
  const ssSemanal = ssAnual / 52;
  const irpfSemanal = irpfTotal / 52;

  const variants = [
    `An\u00e1lisis detallado de deducciones con ${formatAmountSpanish(annualGross)} \u20ac brutos: de cada jornada laboral que trabajas, ${formatEuros(ssDiario)} van a la Seguridad Social (cotizaciones que financian tu futura pensi\u00f3n, la sanidad p\u00fablica y la prestaci\u00f3n por desempleo) y ${formatEuros(irpfDiario)} al IRPF (${formatEuros(irpfDiario * parseFloat(pctEstatal) / 100)} para el Estado y ${formatEuros(irpfDiario * parseFloat(pctCCAA) / 100)} para tu comunidad aut\u00f3noma). En total, ${formatEuros(ssDiario + irpfDiario)} diarios de deducciones. Tu IRPF se divide en un ${pctEstatal}% estatal (${formatEuros(irpfEstatal)}/a\u00f1o) y un ${pctCCAA}% auton\u00f3mico (${formatEuros(irpfCCAA)}/a\u00f1o).`,
    `Desglose por hora de trabajo: con ${formatAmountSpanish(annualGross)} \u20ac brutos, cada hora laboral genera ${formatEuros(annualGross / HORAS_LABORABLES_ANIO)} brutos, de los cuales ${formatEuros(ssHora)} se destinan a cotizaciones sociales (${pctSS}%) y ${formatEuros(irpfHora)} a IRPF (${pctIRPF}%). Te quedan ${formatEuros(netoAnual / HORAS_LABORABLES_ANIO)} netos por hora. El reparto del IRPF entre administraciones: ${pctEstatal}% para la Hacienda estatal (tramos generales) y ${pctCCAA}% para la auton\u00f3mica (tramos de tu comunidad). En cada paga mensual, la retenci\u00f3n es de ${formatEuros(retencionPorPaga)} de IRPF y ${formatEuros(ssPorPaga)} de SS.`,
    `Tu estructura de deducciones con ${formatAmountSpanish(annualGross)} \u20ac brutos: el ${pctTotal}% total de tu salario se reparte entre Seguridad Social (${pctSS}%, es decir, ${formatEuros(ssAnual)} al a\u00f1o o ${formatEuros(ssHora)} por hora) e IRPF (${pctIRPF}%, ${formatEuros(irpfTotal)} anuales o ${formatEuros(irpfHora)}/hora). De tu IRPF, la parte estatal supone ${formatEuros(irpfEstatal)} (${pctEstatal}% del total IRPF) y la auton\u00f3mica ${formatEuros(irpfCCAA)} (${pctCCAA}%). En la n\u00f3mina mensual (14 pagas): ${formatEuros(retencionPorPaga)} de retenci\u00f3n + ${formatEuros(ssPorPaga)} de cotizaci\u00f3n.`,
    `Radiograf\u00eda fiscal de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales: tu empleador ingresa ${formatEuros(ssAnual)} al a\u00f1o a la SS en tu nombre (${pctSS}% de tu bruto) y retiene ${formatEuros(irpfTotal)} de IRPF (${pctIRPF}%). Cada d\u00eda laborable \u201ctrabajas\u201d ${formatEuros(ssDiario)} para la SS y ${formatEuros(irpfDiario)} para Hacienda antes de cobrar tus ${formatEuros(netoAnual / DIAS_LABORABLES_ANIO)} netos diarios. La cuota del IRPF se compone de ${formatEuros(irpfEstatal)} estatales y ${formatEuros(irpfCCAA)} auton\u00f3micos (proporciones: ${pctEstatal}%/${pctCCAA}%).`,
    `Con ${formatAmountSpanish(annualGross)} \u20ac brutos, el desglose fiscal hora a hora: ganas ${formatEuros(annualGross / HORAS_LABORABLES_ANIO)} brutos/hora, de los que ${formatEuros(ssHora)} van a cotizaciones (desempleo, jubilaci\u00f3n, contingencias comunes, MEI) y ${formatEuros(irpfHora)} a IRPF. Neto por hora: ${formatEuros(netoAnual / HORAS_LABORABLES_ANIO)}. Al mes (14 pagas): bruto ${formatEuros(annualGross / 14)}, SS ${formatEuros(ssPorPaga)}, IRPF ${formatEuros(retencionPorPaga)}, neto ${formatEuros(netoAnual / 14)}. El IRPF estatal (${formatEuros(irpfEstatal)}) y auton\u00f3mico (${formatEuros(irpfCCAA)}) suman el ${pctIRPF}% de presi\u00f3n sobre el bruto.`,
    `Cada minuto de trabajo con ${formatAmountSpanish(annualGross)} \u20ac brutos genera ${formatEuros(annualGross / HORAS_LABORABLES_ANIO / 60)} brutos, de los que ${formatEuros(ssMinuto)} van a cotizaciones y ${formatEuros(irpfMinuto)} a IRPF. Escalando: por hora son ${formatEuros(ssHora)} + ${formatEuros(irpfHora)} de deducciones, dejando ${formatEuros(netoAnual / HORAS_LABORABLES_ANIO)} netos. Al a\u00f1o, la SS absorbe ${formatEuros(ssAnual)} (${pctSS}%) y el IRPF ${formatEuros(irpfTotal)} (${pctIRPF}%, repartido ${pctEstatal}% estatal / ${pctCCAA}% auton\u00f3mico). Presi\u00f3n fiscal total: ${pctTotal}%.`,
    `Perspectiva semanal de deducciones con ${formatAmountSpanish(annualGross)} \u20ac brutos: cada semana laboral (40h) se deducen ${formatEuros(ssSemanal)} de Seguridad Social y ${formatEuros(irpfSemanal)} de IRPF. A nivel anual, eso supone ${formatEuros(ssAnual)} en cotizaciones (${pctSS}%) m\u00e1s ${formatEuros(irpfTotal)} en impuesto sobre la renta (${pctIRPF}%). El IRPF se reparte: ${formatEuros(irpfEstatal)} para el Estado (${pctEstatal}%) y ${formatEuros(irpfCCAA)} para tu comunidad (${pctCCAA}%). En tu n\u00f3mina mensual: ${formatEuros(ssPorPaga)} de SS + ${formatEuros(retencionPorPaga)} de IRPF.`,
    `Desglose de tus ${formatAmountSpanish(annualGross)} \u20ac en tres capas: primero, la Seguridad Social se lleva ${formatEuros(ssAnual)} anuales (${pctSS}% de tu bruto, o ${formatEuros(ssHora)} por hora trabajada). Segundo, el IRPF absorbe ${formatEuros(irpfTotal)} (${pctIRPF}%), dividido entre cuota estatal de ${formatEuros(irpfEstatal)} (${pctEstatal}%) y cuota auton\u00f3mica de ${formatEuros(irpfCCAA)} (${pctCCAA}%). Tercero, lo que recibes: ${formatEuros(netoAnual)} netos al a\u00f1o, ${formatEuros(netoAnual / 14)} por paga. En total, el ${pctTotal}% de tu trabajo se destina a contribuciones obligatorias.`,
    `\u00bfA d\u00f3nde va tu dinero con ${formatAmountSpanish(annualGross)} \u20ac brutos? De cada euro que generas, ${(parseFloat(pctSS) / 100).toFixed(2)} c\u00e9ntimos van a cotizaciones sociales (pensi\u00f3n, desempleo, sanidad, MEI) y ${(parseFloat(pctIRPF) / 100).toFixed(2)} c\u00e9ntimos a IRPF. Te quedan ${((100 - parseFloat(pctTotal)) / 100).toFixed(2)} c\u00e9ntimos netos. Diariamente: ${formatEuros(ssDiario)} a SS + ${formatEuros(irpfDiario)} a IRPF = ${formatEuros(ssDiario + irpfDiario)} de deducciones. El IRPF se distribuye: ${pctEstatal}% al Estado (${formatEuros(irpfEstatal)}/a\u00f1o) y ${pctCCAA}% a tu CCAA (${formatEuros(irpfCCAA)}/a\u00f1o).`,
    `Anatomizando las deducciones de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales: en la n\u00f3mina mensual (14 pagas) se descuentan ${formatEuros(ssPorPaga)} de Seguridad Social y ${formatEuros(retencionPorPaga)} de IRPF. A lo largo del a\u00f1o, las cotizaciones sociales suman ${formatEuros(ssAnual)} (${pctSS}%) y el IRPF ${formatEuros(irpfTotal)} (${pctIRPF}%). De ese IRPF, ${formatEuros(irpfEstatal)} financian los servicios del Estado central (${pctEstatal}%) y ${formatEuros(irpfCCAA)} los de tu comunidad aut\u00f3noma (${pctCCAA}%). Neto resultante: ${formatEuros(netoAnual / HORAS_LABORABLES_ANIO)}/hora, ${formatEuros(netoAnual / DIAS_LABORABLES_ANIO)}/d\u00eda, ${formatEuros(netoAnual / 14)}/paga.`,
  ];

  return variants[v];
}

// \u2500\u2500 getPayDayBreakdown \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getPayDayBreakdown(amount: number, result: DesgloseSueldo): string {
  const v = getVariation(amount, 10);
  const annualGross = result.brutoAnual;

  // 14 pagas: 12 ordinary + 2 extra (June + December)
  const brutoMesPaga = annualGross / 14;
  const netoMesPaga = result.netoMensual;
  const ssConMes = result.ssMensual;
  const irpfMes = result.retencionMensual;

  // 12 pagas: higher monthly but no extras
  const bruto12 = annualGross / 12;
  const neto12 = result.netoAnual / 12;

  // Paga extra: what lands in your account in June/December
  const pagaExtraBruto = annualGross / 14;
  const pagaExtraNeto = result.netoMensual; // Same as monthly in 14-pay system

  // Additional derived values for new variants
  const totalDeduccionesMes = ssConMes + irpfMes;
  const pctDeduccionMes = (totalDeduccionesMes / brutoMesPaga * 100).toFixed(1);
  const diff12vs14 = neto12 - netoMesPaga;
  const pagasExtraAnual = pagaExtraNeto * 2;

  const variants = [
    `D\u00eda de n\u00f3mina con ${formatAmountSpanish(annualGross)} \u20ac brutos (14 pagas): tu n\u00f3mina mensual muestra un bruto de ${formatEuros(brutoMesPaga)}, del que se descuentan ${formatEuros(ssConMes)} de Seguridad Social y ${formatEuros(irpfMes)} de IRPF. El ingreso en cuenta: ${formatEuros(netoMesPaga)} cada mes, m\u00e1s dos pagas extra id\u00e9nticas de ${formatEuros(pagaExtraNeto)} netos (habitualmente en junio y diciembre). Si prefieres 12 pagas: tu mensualidad subir\u00eda a ${formatEuros(neto12)}, pero sin las pagas extra. El total anual neto (${formatEuros(result.netoAnual)}) es el mismo en ambos casos.`,
    `As\u00ed queda tu n\u00f3mina de ${formatAmountSpanish(annualGross)} \u20ac brutos en 14 pagas: salario base mensual ${formatEuros(brutoMesPaga)} brutos \u2192 menos ${formatEuros(ssConMes)} de cotizaciones \u2192 menos ${formatEuros(irpfMes)} de retenci\u00f3n IRPF \u2192 transferencia bancaria de ${formatEuros(netoMesPaga)}. Adem\u00e1s, en junio y diciembre recibes ${formatEuros(pagaExtraNeto)} adicionales (la paga extra). Alternativa con 12 pagas: ${formatEuros(neto12)}/mes sin extras. El neto anual total (${formatEuros(result.netoAnual)}) no cambia; solo cambia el flujo de caja mensual.`,
    `Concepto a concepto en tu n\u00f3mina de ${formatAmountSpanish(annualGross)} \u20ac brutos/a\u00f1o, 14 pagas: devengos ${formatEuros(brutoMesPaga)}, deducci\u00f3n SS ${formatEuros(ssConMes)} (6,5% de la base), retenci\u00f3n IRPF ${formatEuros(irpfMes)} (tipo aplicado seg\u00fan tabla anual). L\u00edquido a percibir: ${formatEuros(netoMesPaga)}. Las pagas extraordinarias de junio y diciembre a\u00f1aden ${formatEuros(pagaExtraNeto)} netos cada una. \u00bfMejor 12 pagas? Cobrar\u00edas ${formatEuros(neto12)} al mes pero sin sorpresas extra; muchos expertos recomiendan 12 pagas para facilitar la gesti\u00f3n de ahorro mensual.`,
    `Desglose de tu n\u00f3mina mensual partiendo de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales: base mensual ${formatEuros(brutoMesPaga)} \u2212 SS (${formatEuros(ssConMes)}) \u2212 IRPF (${formatEuros(irpfMes)}) = ${formatEuros(netoMesPaga)} netos. Con 14 pagas, adem\u00e1s cobras ${formatEuros(pagaExtraNeto)} \u00d7 2 extras al a\u00f1o. Con 12 pagas el mensual ser\u00eda ${formatEuros(neto12)} (${formatEuros(diff12vs14)} m\u00e1s por mes, pero sin extras). Tip financiero: con 14 pagas, las extras pueden ir directamente a ahorro/inversi\u00f3n de forma autom\u00e1tica.`,
    `Tu n\u00f3mina de ${formatAmountSpanish(annualGross)} \u20ac brutos en detalle: cada mes ingresan ${formatEuros(netoMesPaga)} en tu cuenta, resultado de aplicar un ${pctDeduccionMes}% de deducciones (${formatEuros(totalDeduccionesMes)}) sobre el bruto mensual de ${formatEuros(brutoMesPaga)}. Con 14 pagas, las extraordinarias de junio y diciembre suman ${formatEuros(pagasExtraAnual)} netos al a\u00f1o. La alternativa de 12 pagas eleva el mensual a ${formatEuros(neto12)} (+${formatEuros(diff12vs14)}/mes), aunque pierdes las dos pagas extra.`,
    `El ciclo mensual de tu n\u00f3mina con ${formatAmountSpanish(annualGross)} \u20ac brutos: tu empresa abona ${formatEuros(brutoMesPaga)} brutos a la SS y a Hacienda en tu nombre. La Seguridad Social se queda ${formatEuros(ssConMes)}, Hacienda retiene ${formatEuros(irpfMes)} de IRPF, y t\u00fa recibes ${formatEuros(netoMesPaga)} limpios en cuenta. En junio y diciembre, una paga extra de ${formatEuros(pagaExtraNeto)} netos supone un impulso de ${formatEuros(pagasExtraAnual)} adicionales al a\u00f1o. Si negociaras 12 pagas, cobrar\u00edas ${formatEuros(neto12)}/mes de forma regular.`,
    `\u00bfQu\u00e9 ver\u00e1s en tu n\u00f3mina con ${formatAmountSpanish(annualGross)} \u20ac brutos? Devengos: ${formatEuros(brutoMesPaga)}. Deducciones: ${formatEuros(ssConMes)} de cotizaciones (contingencias comunes, desempleo, formaci\u00f3n, MEI) + ${formatEuros(irpfMes)} de retenci\u00f3n a cuenta del IRPF. L\u00edquido: ${formatEuros(netoMesPaga)}. Total deducciones mensuales: ${formatEuros(totalDeduccionesMes)} (${pctDeduccionMes}% del bruto). Pagas extras: 2 de ${formatEuros(pagaExtraNeto)} netos (junio y diciembre). Si dividimos en 12: ser\u00edan ${formatEuros(neto12)} mensuales constantes.`,
    `Simulaci\u00f3n de n\u00f3mina para ${formatAmountSpanish(annualGross)} \u20ac brutos anuales repartidos en 14 pagas: tu salario bruto mensual es ${formatEuros(brutoMesPaga)}, del que se restan ${formatEuros(ssConMes)} por cotizaciones a la Seguridad Social y ${formatEuros(irpfMes)} por la retenci\u00f3n del IRPF. La transferencia que recibes: ${formatEuros(netoMesPaga)} al mes, m\u00e1s dos ingresos extra de ${formatEuros(pagaExtraNeto)} en verano e invierno. Con 12 pagas: ${formatEuros(neto12)} fijos cada mes. La diferencia mensual entre ambos sistemas es de ${formatEuros(diff12vs14)}, pero el neto anual (${formatEuros(result.netoAnual)}) es id\u00e9ntico.`,
    `N\u00f3mina tipo con ${formatAmountSpanish(annualGross)} \u20ac brutos y 14 pagas: el bruto por paga (${formatEuros(brutoMesPaga)}) se reduce en ${formatEuros(ssConMes)} de SS (cotizaciones del trabajador) y ${formatEuros(irpfMes)} de retenci\u00f3n IRPF. El neto mensual resultante de ${formatEuros(netoMesPaga)} es lo que aparece en tu extracto bancario los meses ordinarios. Junio y diciembre traen ${formatEuros(pagaExtraNeto)} extra cada uno. Muchos trabajadores prefieren 12 pagas (${formatEuros(neto12)}/mes) para presupuestar mejor y evitar depender de las extras para gastos corrientes.`,
    `Estructura retributiva de ${formatAmountSpanish(annualGross)} \u20ac brutos en 14 pagas: los 12 meses ordinarios aportan ${formatEuros(netoMesPaga)} netos cada uno (${formatEuros(brutoMesPaga)} brutos menos ${formatEuros(totalDeduccionesMes)} de deducciones). Las dos pagas extras (junio y diciembre) a\u00f1aden ${formatEuros(pagaExtraNeto)} netos cada una, totalizando ${formatEuros(pagasExtraAnual)} adicionales. As\u00ed, tu neto anual de ${formatEuros(result.netoAnual)} llega en 14 tramos en vez de 12. Con prorrateadas (12 pagas), ganar\u00edas ${formatEuros(neto12)}/mes (+${formatEuros(diff12vs14)} respecto a 14 pagas).`,
  ];

  return variants[v];
}

export function getCCAAInsight(amount: number, maxCCAA: { nombre: string; neto: number }, minCCAA: { nombre: string; neto: number }, diffAnual: number): string {
  const v = getVariation(amount, 10);
  const diffMensual = diffAnual / 14;
  const diffStr = formatEuros(diffAnual);
  const diffMesStr = formatEuros(diffMensual);
  const pctDiff = (diffAnual / (maxCCAA.neto) * 100).toFixed(1);
  const diffSemanal = formatEuros(diffAnual / 52);
  const diffDiario = formatEuros(diffAnual / DIAS_LABORABLES_ANIO);
  const maxMes = formatEuros(maxCCAA.neto / 14);
  const minMes = formatEuros(minCCAA.neto / 14);

  const variants = [
    `Con este salario bruto, la diferencia geogr\u00e1fica entre ${maxCCAA.nombre} (${maxMes}/mes) y ${minCCAA.nombre} (${minMes}/mes) es de ${diffStr} al a\u00f1o, o ${diffMesStr} en cada paga. Eso es un ${pctDiff}% m\u00e1s de neto anual solo por residir en una comunidad diferente. En 10 a\u00f1os, la diferencia acumulada ser\u00eda de ${formatEuros(diffAnual * 10)}, suficiente para la entrada de un piso en muchas ciudades.`,
    `El factor CCAA importa: mudarte de ${minCCAA.nombre} a ${maxCCAA.nombre} con el mismo sueldo bruto te dar\u00eda ${diffMesStr} m\u00e1s al mes (${diffStr}/a\u00f1o, un ${pctDiff}% m\u00e1s). En 5 a\u00f1os acumular\u00edas ${formatEuros(diffAnual * 5)} m\u00e1s de neto. Sin embargo, debes considerar que el coste de vida (especialmente vivienda) puede neutralizar esta ventaja fiscal.`,
    `La brecha fiscal entre comunidades con este salario es notable: ${diffStr} anuales (${diffMesStr}/mes) separan a ${maxCCAA.nombre} de ${minCCAA.nombre}. El ${pctDiff}% de diferencia neta se debe exclusivamente a la pol\u00edtica fiscal auton\u00f3mica. En la pr\u00e1ctica, esta diferencia de ${formatEuros(diffAnual * 3)} en 3 a\u00f1os puede significar un viaje, un fondo de emergencia, o el anticipo de una inversi\u00f3n.`,
    `Impacto real del IRPF auton\u00f3mico: ${maxCCAA.nombre} te deja ${diffMesStr} m\u00e1s al mes que ${minCCAA.nombre} (${diffStr}/a\u00f1o). Esta diferencia del ${pctDiff}% se mantiene constante mientras no cambies de tramo. A largo plazo (20 a\u00f1os), son ${formatEuros(diffAnual * 20)} de diferencia patrimonial, sin contar el efecto del inter\u00e9s compuesto sobre ese ahorro adicional.`,
    `La autonom\u00eda fiscal tiene precio: con este salario bruto, vivir en ${maxCCAA.nombre} frente a ${minCCAA.nombre} supone ${diffDiario} m\u00e1s por cada d\u00eda laborable (${diffSemanal}/semana, ${diffMesStr}/mes). Al a\u00f1o, la diferencia alcanza ${diffStr}, un ${pctDiff}% m\u00e1s de neto. Sin embargo, hay que ponderar este ahorro fiscal con el coste real de vivienda, transporte y servicios en cada comunidad.`,
    `Comparativa territorial: ${maxCCAA.nombre} ofrece el mayor neto para este salario (${maxMes}/mes) y ${minCCAA.nombre} el menor (${minMes}/mes). La distancia de ${diffStr} anuales (${pctDiff}%) se explica por las diferentes escalas del IRPF auton\u00f3mico. Invertido al 7% anual, ese diferencial de ${diffStr} generar\u00eda ${formatEuros(diffAnual * 15)} en 10 a\u00f1os gracias al inter\u00e9s compuesto.`,
    `D\u00eda a d\u00eda, la diferencia entre residir en ${maxCCAA.nombre} o ${minCCAA.nombre} con este sueldo es de ${diffDiario} netos por jornada trabajada. Puede parecer poco, pero al sumar ${DIAS_LABORABLES_ANIO} d\u00edas laborables se convierte en ${diffStr} anuales (${pctDiff}% m\u00e1s). Las comunidades con r\u00e9gimen foral (Pa\u00eds Vasco, Navarra) y las que aplican deflactaci\u00f3n de tarifa suelen situarse en las posiciones m\u00e1s ventajosas.`,
    `Mapa fiscal de Espa\u00f1a para tu salario: el techo lo marca ${maxCCAA.nombre} con ${maxMes} netos/mes, y el suelo ${minCCAA.nombre} con ${minMes}/mes. La brecha de ${diffMesStr} mensuales (${diffStr}/a\u00f1o) proviene \u00edntegramente del tramo auton\u00f3mico del IRPF. En una carrera profesional de 30 a\u00f1os, esta diferencia acumular\u00eda ${formatEuros(diffAnual * 30)}, un factor relevante si valoras la movilidad geogr\u00e1fica.`,
    `\u00bfCu\u00e1nto pesa la comunidad aut\u00f3noma? Con este bruto, la diferencia entre la m\u00e1s favorable (${maxCCAA.nombre}, ${maxMes}/mes netos) y la menos favorable (${minCCAA.nombre}, ${minMes}/mes) asciende a ${diffStr} al a\u00f1o. Semanalmente son ${diffSemanal} m\u00e1s, y mensualmente ${diffMesStr}. El ${pctDiff}% de brecha se mantiene estable dentro de este tramo impositivo.`,
    `Efecto CCAA en tu bolsillo: residir en ${maxCCAA.nombre} en vez de ${minCCAA.nombre} te aportar\u00eda ${diffMesStr} adicionales cada mes (${diffStr}/a\u00f1o, ${pctDiff}% m\u00e1s de neto). En 5 a\u00f1os, la diferencia acumulada supera los ${formatEuros(diffAnual * 5)}, y en 15 a\u00f1os los ${formatEuros(diffAnual * 15)}. Eso s\u00ed, recuerda que comunidades con menor carga fiscal a veces tienen menos servicios p\u00fablicos o mayor coste de vida relativo.`,
  ];

  return variants[v];
}
