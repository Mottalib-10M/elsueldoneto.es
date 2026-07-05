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
  const v = getVariation(amount, 5);

  const hourlyGrossStr = formatEuros(hourlyGross);
  const hourlyNetStr = formatEuros(hourlyNet);
  const dailyGrossStr = formatEuros(dailyGross);
  const dailyNetStr = formatEuros(dailyNet);
  const weeklyNetStr = formatEuros(weeklyNet);
  const pctMedianStr = Math.abs(pctMedian).toFixed(1);
  const pctSMIStr = pctSMI.toFixed(1);

  const introVariants = [
    `Desglosando ${formatAmountSpanish(annualGross)} \u20ac brutos anuales en unidades m\u00e1s peque\u00f1as: tu salario bruto por hora laborable es de ${hourlyGrossStr}, lo que equivale a ${dailyGrossStr} por jornada completa de 8 horas. Despu\u00e9s de impuestos, tu hora neta de trabajo vale ${hourlyNetStr} y cada d\u00eda laborable generas ${dailyNetStr} netos para tu bolsillo.`,
    `Si traduces tu salario de ${formatAmountSpanish(annualGross)} \u20ac brutos al a\u00f1o a cifras diarias, cada jornada laboral te aporta ${dailyGrossStr} en bruto (${dailyNetStr} netos). Por hora, esto supone ${hourlyGrossStr} brutos o ${hourlyNetStr} una vez descontados IRPF y Seguridad Social. Semanalmente dispones de ${weeklyNetStr} netos.`,
    `Tu retribuci\u00f3n de ${formatAmountSpanish(annualGross)} \u20ac anuales brutos se descompone en ${hourlyGrossStr} por cada hora trabajada (sobre ${HORAS_LABORABLES_ANIO} horas/a\u00f1o). El neto real por hora es ${hourlyNetStr}, es decir, cada semana laboral de 40 horas te deja ${weeklyNetStr} limpios de impuestos.`,
    `Con un bruto anual de ${formatAmountSpanish(annualGross)} \u20ac, tu tarifa diaria efectiva es ${dailyGrossStr} en ${DIAS_LABORABLES_ANIO} d\u00edas laborables. Tras deducciones, la cifra neta diaria queda en ${dailyNetStr}. Si lo miras por hora (jornada de 8h), cobras ${hourlyGrossStr} brutos que se convierten en ${hourlyNetStr} netos.`,
    `Expresado por unidad de tiempo, ${formatAmountSpanish(annualGross)} \u20ac brutos anuales significan: ${hourlyGrossStr}/hora bruta, ${dailyGrossStr}/d\u00eda laborable bruto, ${weeklyNetStr}/semana neta. Tu hora neta real, descontando toda la carga fiscal, es exactamente ${hourlyNetStr}.`,
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
  ];

  return introVariants[v] + ' ' + comparisonVariants[getVariation(amount, 5)];
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
  const v = getVariation(amount, 4);
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

  const paragraphs = [
    [
      `Con un tipo efectivo total del ${tipoTotal}% (${tipoEfectivo}% de IRPF + cotizaciones sociales), cada mes se deducen ${retencionMes} de IRPF y ${ssMes} de Seguridad Social de tu n\u00f3mina.`,
      `Optimizaci\u00f3n inmediata: si aportas el m\u00e1ximo a un plan de pensiones (1.500 \u20ac/a\u00f1o), reduces tu base imponible y ahorras aproximadamente ${ahorroFiscalPensiones} en IRPF este ejercicio.`,
      `Otra v\u00eda: el ticket restaurante exento (hasta 11 \u20ac/d\u00eda laborable) puede suponer un ahorro fiscal anual de ${ahorroTicket}. Consulta si tu empresa ofrece retribuci\u00f3n flexible.`,
    ],
    [
      `Tu carga fiscal total asciende a ${formatEuros(result.seguridadSocialAnual + result.irpfTotalAnual)} al a\u00f1o: ${ssAnual} en cotizaciones sociales y ${irpfAnual} de IRPF (tipo efectivo ${tipoEfectivo}%). Mensualmente, esto se traduce en ${retencionMes} de retenci\u00f3n + ${ssMes} de SS.`,
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
      `Ahorro tangible: plan de pensiones a tope \u2192 ${ahorroFiscalPensiones} menos de IRPF. Ticket restaurante \u2192 ${ahorroTicket} de ahorro fiscal. Seguro m\u00e9dico de empresa \u2192 ~150 \u20ac de ahorro por persona cubierta. Combinados, pueden mejorar tu neto efectivo en m\u00e1s de ${formatEuros(ahorroPensiones * result.tipoEfectivoIRPF + ticketRestaurante * result.tipoEfectivoIRPF + 150)}/a\u00f1o.`,
      `Planificaci\u00f3n temporal: si esperas un bonus o paga extra, recuerda que tributar\u00e1 al tipo marginal (superior al ${tipoEfectivo}% efectivo). Valorar el diferimiento mediante plan de pensiones del exceso puede ser rentable.`,
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
  const v = getVariation(amount, 3);
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

  const introVariants = [
    `\u00bfQu\u00e9 pasa si consigues un aumento desde ${formatAmountSpanish(annualGross)} \u20ac brutos? Debido a la progresividad del IRPF, cada euro adicional tributa a un tipo marginal superior a tu tipo efectivo actual del ${(result.tipoEfectivoIRPF * 100).toFixed(1)}%. A continuaci\u00f3n simulamos el impacto real de distintos incrementos:`,
    `Simulaci\u00f3n de subida salarial partiendo de ${formatAmountSpanish(annualGross)} \u20ac brutos. Tu tipo efectivo actual es ${(result.tipoEfectivoTotal * 100).toFixed(1)}%, pero los euros adicionales tributan al marginal (estimado ~${scenarios[0].effectiveTaxOnRaise}%). Veamos cu\u00e1nto llegar\u00eda realmente a tu bolsillo:`,
    `Si negociases un aumento sobre tus ${formatAmountSpanish(annualGross)} \u20ac brutos actuales, \u00bfcu\u00e1nto m\u00e1s cobrar\u00edas neto? La respuesta no es lineal: el tipo marginal aplicable a los euros extra (~${scenarios[0].effectiveTaxOnRaise}%) supera tu tipo efectivo (${(result.tipoEfectivoTotal * 100).toFixed(1)}%). Aqu\u00ed tienes la estimaci\u00f3n:`,
  ];

  const conclusionVariants = [
    `Como se observa, un aumento del ${raisePercents[2]}% en bruto (+${formatEuros(annualGross * 0.10)}) se traduce en solo +${formatEuros(scenarios[2].netGainAnnual)} netos al a\u00f1o, porque el ${scenarios[2].effectiveTaxOnRaise}% del incremento se destina a impuestos y cotizaciones. Aun as\u00ed, cada subida mejora tu base de cotizaci\u00f3n futura (pensi\u00f3n, desempleo).`,
    `En resumen: de un aumento del 10% (${formatEuros(annualGross * 0.10)} brutos extra), ganar\u00edas ${formatEuros(scenarios[2].netGainAnnual)} netos anuales (+${formatEuros(scenarios[2].netGainMonthly)}/mes). La presi\u00f3n marginal del ${scenarios[2].effectiveTaxOnRaise}% reduce el impacto, pero el neto siempre crece y mejoras tu protecci\u00f3n social.`,
    `Conclusi\u00f3n: aunque la progresividad fiscal absorbe parte de la subida (~${scenarios[2].effectiveTaxOnRaise}% de cada euro extra), siempre sale a cuenta ganar m\u00e1s. Un +10% bruto desde ${formatAmountSpanish(annualGross)} \u20ac a\u00f1ade ${formatEuros(scenarios[2].netGainMonthly)} a tu n\u00f3mina mensual. Adem\u00e1s, la base reguladora para prestaciones (jubilaci\u00f3n, baja) tambi\u00e9n se incrementa.`,
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

  // 50/30/20 adapted
  const necesidades = netMonthly * 0.50;
  const ocio = netMonthly * 0.30;
  const ahorro = netMonthly * 0.20;

  // Detailed breakdown
  const vivienda = netMonthly * 0.30;
  const alimentacion = Math.min(netMonthly * 0.12, 600);
  const transporte = Math.min(netMonthly * 0.08, 350);
  const suministros = Math.min(netMonthly * 0.05, 200);
  const seguros = Math.min(netMonthly * 0.04, 180);
  const ocioDetalle = netMonthly * 0.15;
  const ropa = netMonthly * 0.05;
  const ahorroInversion = netMonthly * 0.15;
  const fondoEmergencia = netMonthly * 0.05;

  const categories: BudgetCategory[] = [
    { categoria: 'Vivienda (alquiler/hipoteca)', porcentaje: 30, eurosMes: Math.round(vivienda), nota: `M\u00e1ximo recomendado: ${formatEuros(vivienda)}` },
    { categoria: 'Alimentaci\u00f3n y supermercado', porcentaje: Math.round(alimentacion / netMonthly * 100), eurosMes: Math.round(alimentacion), nota: `Unos ${formatEuros(alimentacion / 30)}/d\u00eda` },
    { categoria: 'Transporte', porcentaje: Math.round(transporte / netMonthly * 100), eurosMes: Math.round(transporte), nota: 'Incluye gasolina, abono transporte o cuota coche' },
    { categoria: 'Suministros (luz, agua, gas, internet)', porcentaje: Math.round(suministros / netMonthly * 100), eurosMes: Math.round(suministros), nota: `Estimaci\u00f3n media nacional` },
    { categoria: 'Seguros y salud', porcentaje: Math.round(seguros / netMonthly * 100), eurosMes: Math.round(seguros), nota: 'Seguro hogar, dental, copagos' },
    { categoria: 'Ocio y restaurantes', porcentaje: Math.round(ocioDetalle / netMonthly * 100), eurosMes: Math.round(ocioDetalle), nota: `Unos ${formatEuros(ocioDetalle / 4)}/semana para ocio` },
    { categoria: 'Ropa y cuidado personal', porcentaje: Math.round(ropa / netMonthly * 100), eurosMes: Math.round(ropa), nota: 'Media anual prorrateada' },
    { categoria: 'Ahorro e inversi\u00f3n', porcentaje: Math.round(ahorroInversion / netMonthly * 100), eurosMes: Math.round(ahorroInversion), nota: `${formatEuros(ahorroInversion * 12)} al a\u00f1o en fondos/dep\u00f3sitos` },
    { categoria: 'Fondo de emergencia', porcentaje: Math.round(fondoEmergencia / netMonthly * 100), eurosMes: Math.round(fondoEmergencia), nota: `Objetivo: ${formatEuros(necesidades * 6)} (6 meses de gastos fijos)` },
  ];

  const introVariants = [
    `Con ${formatEuros(netMonthly)} netos al mes, aplicar la regla 50/30/20 significa destinar ${formatEuros(necesidades)} a necesidades b\u00e1sicas, ${formatEuros(ocio)} a gastos discrecionales y ${formatEuros(ahorro)} al ahorro. Aqu\u00ed te proponemos un presupuesto m\u00e1s detallado adaptado a tu neto exacto:`,
    `Tu neto mensual de ${formatEuros(netMonthly)} permite un presupuesto equilibrado. Seg\u00fan la regla 50/30/20: ${formatEuros(necesidades)} para cubrir lo esencial, ${formatEuros(ocio)} para ocio y caprichos, y ${formatEuros(ahorro)} para construir patrimonio. Detallamos cada partida:`,
    `\u00bfC\u00f3mo distribuir ${formatEuros(netMonthly)} netos al mes? Los expertos financieros sugieren: 50% necesidades (${formatEuros(necesidades)}), 30% deseos (${formatEuros(ocio)}), 20% ahorro (${formatEuros(ahorro)}). Veamos una distribuci\u00f3n pr\u00e1ctica por categor\u00eda:`,
    `Presupuesto mensual sobre ${formatEuros(netMonthly)} netos: la base es reservar ${formatEuros(ahorro)} para ahorro/inversi\u00f3n (20%), limitar necesidades a ${formatEuros(necesidades)} (50%) y disponer de ${formatEuros(ocio)} para ocio (30%). Desglose recomendado:`,
  ];

  const conclusionVariants = [
    `Con esta distribuci\u00f3n, en 12 meses habr\u00edas acumulado ${formatEuros(ahorroInversion * 12)} en inversiones m\u00e1s ${formatEuros(fondoEmergencia * 12)} en fondo de emergencia. En 5 a\u00f1os (sin contar rentabilidad), tu patrimonio l\u00edquido crecer\u00eda en ${formatEuros((ahorroInversion + fondoEmergencia) * 60)}.`,
    `Si mantienes este presupuesto durante un a\u00f1o, ahorras ${formatEuros(ahorro * 12)} (${formatEuros(ahorroInversion * 12)} inversi\u00f3n + ${formatEuros(fondoEmergencia * 12)} emergencia). Con una rentabilidad media del 7% anual en fondos indexados, en 10 a\u00f1os podr\u00edas acumular m\u00e1s de ${formatEuros(ahorroInversion * 12 * 14)}.`,
    `Resultado anual: ${formatEuros(ahorro * 12)} ahorrados (${((ahorro * 12) / (netMonthly * 12) * 100).toFixed(0)}% de tu neto anual). Tu fondo de emergencia alcanzar\u00eda ${formatEuros(fondoEmergencia * 12)} tras 12 meses, cubriendo ${(fondoEmergencia * 12 / necesidades).toFixed(1)} meses de gastos fijos.`,
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
  const v = getVariation(amount, 4);

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

  const comparisons: ComparisonPoint[] = [
    {
      label: `vs. ${formatAmountSpanish(lowerAmount)} \u20ac brutos`,
      value: `+${formatEuros(diffToLower)} brutos/a\u00f1o`,
      diff: `\u2248+${formatEuros(diffToLower * (1 - result.tipoEfectivoTotal))} netos/a\u00f1o`,
    },
    {
      label: `vs. ${formatAmountSpanish(higherAmount)} \u20ac brutos`,
      value: `-5.000 \u20ac brutos/a\u00f1o`,
      diff: `\u2248-${formatEuros(netGainFor5kMore)} netos/a\u00f1o respecto al superior`,
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
  ];

  const analysisVariants = [
    `Observa que ganar 5.000 \u20ac m\u00e1s brutos no se traduce en 5.000 \u20ac m\u00e1s netos: esos euros extra tributan al marginal (~${Math.round((result.tipoEfectivoTotal + 0.08) * 100)}%), generando solo ~${formatEuros(netGainFor5kMore)} netos adicionales al a\u00f1o (${formatEuros(netGainFor5kMore / 14)}/mes con 14 pagas). Cada minuto que trabajas genera ${formatEuros(minuteNet)} netos en tu bolsillo.`,
    `La clave es el tipo marginal: mientras tu tipo efectivo es ${(result.tipoEfectivoTotal * 100).toFixed(1)}%, los pr\u00f3ximos euros que ganes tributan al ~${Math.round((result.tipoEfectivoTotal + 0.08) * 100)}%. As\u00ed, 5.000 \u20ac brutos extra generan ~${formatEuros(netGainFor5kMore)} netos (+${formatEuros(netGainFor5kMore / 14)}/mes). Tu trabajo vale ${formatEuros(minuteNet)} netos por minuto.`,
    `A nivel pr\u00e1ctico: si tu empresa te ofreciera un aumento de 5.000 \u20ac brutos anuales, ver\u00edas ~${formatEuros(netGainFor5kMore / 14)} m\u00e1s al mes en tu cuenta (${formatEuros(netGainFor5kMore)}/a\u00f1o netos). La diferencia entre tu bruto y tu neto refleja que tu hora de trabajo genera ${formatEuros(hourlyGross)} brutos pero solo ${formatEuros(hourlyNet)} netos (${formatEuros(minuteNet)}/minuto).`,
    `Perspectiva temporal: cada hora que trabajas con ${formatAmountSpanish(annualGross)} \u20ac brutos vale ${formatEuros(hourlyNet)} netos (${formatEuros(minuteNet)}/minuto). Si ascendieras 5.000 \u20ac en bruto, a\u00f1adir\u00edas ~${formatEuros(netGainFor5kMore / HORAS_LABORABLES_ANIO)} netos por hora m\u00e1s (total estimado: ${formatEuros(hourlyNet + netGainFor5kMore / HORAS_LABORABLES_ANIO)}/hora neta).`,
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
  const v = getVariation(Math.round(result.brutoAnual / 100), 3);

  // Common expenses to contextualize
  const items: TimeToEarnItem[] = [
    { concepto: 'Cesta de la compra semanal', coste: 75, horasNetas: (75 / hourlyNet).toFixed(1), diasLaborables: (75 / dailyNet).toFixed(2) },
    { concepto: 'Factura m\u00f3vil + internet', coste: 65, horasNetas: (65 / hourlyNet).toFixed(1), diasLaborables: (65 / dailyNet).toFixed(2) },
    { concepto: 'Tanque de gasolina (50L)', coste: 85, horasNetas: (85 / hourlyNet).toFixed(1), diasLaborables: (85 / dailyNet).toFixed(2) },
    { concepto: 'Cena para dos en restaurante', coste: 60, horasNetas: (60 / hourlyNet).toFixed(1), diasLaborables: (60 / dailyNet).toFixed(2) },
    { concepto: 'Vuelo ida/vuelta nacional', coste: 120, horasNetas: (120 / hourlyNet).toFixed(1), diasLaborables: (120 / dailyNet).toFixed(2) },
    { concepto: 'iPhone nuevo (gama alta)', coste: 1299, horasNetas: (1299 / hourlyNet).toFixed(1), diasLaborables: (1299 / dailyNet).toFixed(1) },
    { concepto: 'Alquiler mensual (media Espa\u00f1a)', coste: 850, horasNetas: (850 / hourlyNet).toFixed(1), diasLaborables: (850 / dailyNet).toFixed(1) },
    { concepto: 'Seguro coche anual', coste: 450, horasNetas: (450 / hourlyNet).toFixed(1), diasLaborables: (450 / dailyNet).toFixed(1) },
  ];

  const introVariants = [
    `\u00bfCu\u00e1nto tiempo de trabajo real necesitas para pagar gastos cotidianos? Con tu hora neta de ${formatEuros(hourlyNet)} (${formatEuros(dailyNet)}/d\u00eda laborable), aqu\u00ed tienes la equivalencia en tiempo trabajado para gastos comunes:`,
    `Para entender el valor real de tu tiempo con ${formatAmountSpanish(result.brutoAnual)} \u20ac brutos: cada hora tuya genera ${formatEuros(hourlyNet)} netos. Veamos cu\u00e1ntas horas de trabajo cuestan las cosas del d\u00eda a d\u00eda:`,
    `Tu hora de trabajo neta vale ${formatEuros(hourlyNet)} y tu jornada completa ${formatEuros(dailyNet)}. Esta tabla te muestra exactamente cu\u00e1ntas horas (o d\u00edas) necesitas trabajar para pagar cada gasto habitual:`,
  ];

  const conclusionVariants = [
    `En resumen: tu alquiler mensual te cuesta ${(850 / dailyNet).toFixed(1)} jornadas laborables de las ${(DIAS_LABORABLES_ANIO / 12).toFixed(0)} que trabajas al mes. ${850 / result.netoMensual > 0.35 ? 'Esto supera el 35% recomendado de tu neto, lo que limita tu capacidad de ahorro.' : 'Esto queda dentro del 30-35% recomendado, dejando margen para ahorro e inversi\u00f3n.'}`,
    `Perspectiva pr\u00e1ctica: de las ~${(DIAS_LABORABLES_ANIO / 12).toFixed(0)} jornadas laborables mensuales, ${(850 / dailyNet).toFixed(1)} se destinan solo a vivienda. ${hourlyNet > 15 ? 'Tu hora neta de ' + formatEuros(hourlyNet) + ' te permite un nivel de vida c\u00f3modo si controlas los gastos discrecionales.' : 'Maximizar el ahorro requiere controlar gastos como restaurantes y ocio, que a ' + formatEuros(hourlyNet) + '/hora neta suponen un esfuerzo significativo.'}`,
    `Cada d\u00eda que trabajas con este sueldo genera ${formatEuros(dailyNet)} netos. Eso significa que una compra impulsiva de 100 \u20ac te cuesta ${(100 / hourlyNet).toFixed(1)} horas de tu vida laboral. Pensar en t\u00e9rminos de \u201choras de trabajo\u201d suele ser la mejor herramienta para controlar el gasto.`,
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
  const v = getVariation(amount, 5);
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

  const variants = [
    `An\u00e1lisis detallado de deducciones con ${formatAmountSpanish(annualGross)} \u20ac brutos: de cada jornada laboral que trabajas, ${formatEuros(ssDiario)} van a la Seguridad Social (cotizaciones que financian tu futura pensi\u00f3n, la sanidad p\u00fablica y la prestaci\u00f3n por desempleo) y ${formatEuros(irpfDiario)} al IRPF (${formatEuros(irpfDiario * parseFloat(pctEstatal) / 100)} para el Estado y ${formatEuros(irpfDiario * parseFloat(pctCCAA) / 100)} para tu comunidad aut\u00f3noma). En total, ${formatEuros(ssDiario + irpfDiario)} diarios de deducciones. Tu IRPF se divide en un ${pctEstatal}% estatal (${formatEuros(irpfEstatal)}/a\u00f1o) y un ${pctCCAA}% auton\u00f3mico (${formatEuros(irpfCCAA)}/a\u00f1o).`,
    `Desglose por hora de trabajo: con ${formatAmountSpanish(annualGross)} \u20ac brutos, cada hora laboral genera ${formatEuros(annualGross / HORAS_LABORABLES_ANIO)} brutos, de los cuales ${formatEuros(ssHora)} se destinan a cotizaciones sociales (${pctSS}%) y ${formatEuros(irpfHora)} a IRPF (${pctIRPF}%). Te quedan ${formatEuros(netoAnual / HORAS_LABORABLES_ANIO)} netos por hora. El reparto del IRPF entre administraciones: ${pctEstatal}% para la Hacienda estatal (tramos generales) y ${pctCCAA}% para la auton\u00f3mica (tramos de tu comunidad). En cada paga mensual, la retenci\u00f3n es de ${formatEuros(retencionPorPaga)} de IRPF y ${formatEuros(ssPorPaga)} de SS.`,
    `Tu estructura de deducciones con ${formatAmountSpanish(annualGross)} \u20ac brutos: el ${pctTotal}% total de tu salario se reparte entre Seguridad Social (${pctSS}%, es decir, ${formatEuros(ssAnual)} al a\u00f1o o ${formatEuros(ssHora)} por hora) e IRPF (${pctIRPF}%, ${formatEuros(irpfTotal)} anuales o ${formatEuros(irpfHora)}/hora). De tu IRPF, la parte estatal supone ${formatEuros(irpfEstatal)} (${pctEstatal}% del total IRPF) y la auton\u00f3mica ${formatEuros(irpfCCAA)} (${pctCCAA}%). En la n\u00f3mina mensual (14 pagas): ${formatEuros(retencionPorPaga)} de retenci\u00f3n + ${formatEuros(ssPorPaga)} de cotizaci\u00f3n.`,
    `Radiograf\u00eda fiscal de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales: tu empleador ingresa ${formatEuros(ssAnual)} al a\u00f1o a la SS en tu nombre (${pctSS}% de tu bruto) y retiene ${formatEuros(irpfTotal)} de IRPF (${pctIRPF}%). Cada d\u00eda laborable \u201ctrabajas\u201d ${formatEuros(ssDiario)} para la SS y ${formatEuros(irpfDiario)} para Hacienda antes de cobrar tus ${formatEuros(netoAnual / DIAS_LABORABLES_ANIO)} netos diarios. La cuota del IRPF se compone de ${formatEuros(irpfEstatal)} estatales y ${formatEuros(irpfCCAA)} auton\u00f3micos (proporciones: ${pctEstatal}%/${pctCCAA}%).`,
    `Con ${formatAmountSpanish(annualGross)} \u20ac brutos, el desglose fiscal hora a hora: ganas ${formatEuros(annualGross / HORAS_LABORABLES_ANIO)} brutos/hora, de los que ${formatEuros(ssHora)} van a cotizaciones (desempleo, jubilaci\u00f3n, contingencias comunes, MEI) y ${formatEuros(irpfHora)} a IRPF. Neto por hora: ${formatEuros(netoAnual / HORAS_LABORABLES_ANIO)}. Al mes (14 pagas): bruto ${formatEuros(annualGross / 14)}, SS ${formatEuros(ssPorPaga)}, IRPF ${formatEuros(retencionPorPaga)}, neto ${formatEuros(netoAnual / 14)}. El IRPF estatal (${formatEuros(irpfEstatal)}) y auton\u00f3mico (${formatEuros(irpfCCAA)}) suman el ${pctIRPF}% de presi\u00f3n sobre el bruto.`,
  ];

  return variants[v];
}

// \u2500\u2500 getPayDayBreakdown \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getPayDayBreakdown(amount: number, result: DesgloseSueldo): string {
  const v = getVariation(amount, 4);
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

  const variants = [
    `D\u00eda de n\u00f3mina con ${formatAmountSpanish(annualGross)} \u20ac brutos (14 pagas): tu n\u00f3mina mensual muestra un bruto de ${formatEuros(brutoMesPaga)}, del que se descuentan ${formatEuros(ssConMes)} de Seguridad Social y ${formatEuros(irpfMes)} de IRPF. El ingreso en cuenta: ${formatEuros(netoMesPaga)} cada mes, m\u00e1s dos pagas extra id\u00e9nticas de ${formatEuros(pagaExtraNeto)} netos (habitualmente en junio y diciembre). Si prefieres 12 pagas: tu mensualidad subir\u00eda a ${formatEuros(neto12)}, pero sin las pagas extra. El total anual neto (${formatEuros(result.netoAnual)}) es el mismo en ambos casos.`,
    `As\u00ed queda tu n\u00f3mina de ${formatAmountSpanish(annualGross)} \u20ac brutos en 14 pagas: salario base mensual ${formatEuros(brutoMesPaga)} brutos \u2192 menos ${formatEuros(ssConMes)} de cotizaciones \u2192 menos ${formatEuros(irpfMes)} de retenci\u00f3n IRPF \u2192 transferencia bancaria de ${formatEuros(netoMesPaga)}. Adem\u00e1s, en junio y diciembre recibes ${formatEuros(pagaExtraNeto)} adicionales (la paga extra). Alternativa con 12 pagas: ${formatEuros(neto12)}/mes sin extras. El neto anual total (${formatEuros(result.netoAnual)}) no cambia; solo cambia el flujo de caja mensual.`,
    `Concepto a concepto en tu n\u00f3mina de ${formatAmountSpanish(annualGross)} \u20ac brutos/a\u00f1o, 14 pagas: devengos ${formatEuros(brutoMesPaga)}, deducci\u00f3n SS ${formatEuros(ssConMes)} (6,5% de la base), retenci\u00f3n IRPF ${formatEuros(irpfMes)} (tipo aplicado seg\u00fan tabla anual). L\u00edquido a percibir: ${formatEuros(netoMesPaga)}. Las pagas extraordinarias de junio y diciembre a\u00f1aden ${formatEuros(pagaExtraNeto)} netos cada una. \u00bfMejor 12 pagas? Cobrar\u00edas ${formatEuros(neto12)} al mes pero sin sorpresas extra; muchos expertos recomiendan 12 pagas para facilitar la gesti\u00f3n de ahorro mensual.`,
    `Desglose de tu n\u00f3mina mensual partiendo de ${formatAmountSpanish(annualGross)} \u20ac brutos anuales: base mensual ${formatEuros(brutoMesPaga)} \u2212 SS (${formatEuros(ssConMes)}) \u2212 IRPF (${formatEuros(irpfMes)}) = ${formatEuros(netoMesPaga)} netos. Con 14 pagas, adem\u00e1s cobras ${formatEuros(pagaExtraNeto)} \u00d7 2 extras al a\u00f1o. Con 12 pagas el mensual ser\u00eda ${formatEuros(neto12)} (${formatEuros(neto12 - netoMesPaga)} m\u00e1s por mes, pero sin extras). Tip financiero: con 14 pagas, las extras pueden ir directamente a ahorro/inversi\u00f3n de forma autom\u00e1tica.`,
  ];

  return variants[v];
}

export function getCCAAInsight(amount: number, maxCCAA: { nombre: string; neto: number }, minCCAA: { nombre: string; neto: number }, diffAnual: number): string {
  const v = getVariation(amount, 4);
  const diffMensual = diffAnual / 14;
  const diffStr = formatEuros(diffAnual);
  const diffMesStr = formatEuros(diffMensual);
  const pctDiff = (diffAnual / (maxCCAA.neto) * 100).toFixed(1);

  const variants = [
    `Con este salario bruto, la diferencia geogr\u00e1fica entre ${maxCCAA.nombre} (${formatEuros(maxCCAA.neto / 14)}/mes) y ${minCCAA.nombre} (${formatEuros(minCCAA.neto / 14)}/mes) es de ${diffStr} al a\u00f1o, o ${diffMesStr} en cada paga. Eso es un ${pctDiff}% m\u00e1s de neto anual solo por residir en una comunidad diferente. En 10 a\u00f1os, la diferencia acumulada ser\u00eda de ${formatEuros(diffAnual * 10)}, suficiente para la entrada de un piso en muchas ciudades.`,
    `El factor CCAA importa: mudarte de ${minCCAA.nombre} a ${maxCCAA.nombre} con el mismo sueldo bruto te dar\u00eda ${diffMesStr} m\u00e1s al mes (${diffStr}/a\u00f1o, un ${pctDiff}% m\u00e1s). En 5 a\u00f1os acumular\u00edas ${formatEuros(diffAnual * 5)} m\u00e1s de neto. Sin embargo, debes considerar que el coste de vida (especialmente vivienda) puede neutralizar esta ventaja fiscal.`,
    `La brecha fiscal entre comunidades con este salario es notable: ${diffStr} anuales (${diffMesStr}/mes) separan a ${maxCCAA.nombre} de ${minCCAA.nombre}. El ${pctDiff}% de diferencia neta se debe exclusivamente a la pol\u00edtica fiscal auton\u00f3mica. En la pr\u00e1ctica, esta diferencia de ${formatEuros(diffAnual * 3)} en 3 a\u00f1os puede significar un viaje, un fondo de emergencia, o el anticipo de una inversi\u00f3n.`,
    `Impacto real del IRPF auton\u00f3mico: ${maxCCAA.nombre} te deja ${diffMesStr} m\u00e1s al mes que ${minCCAA.nombre} (${diffStr}/a\u00f1o). Esta diferencia del ${pctDiff}% se mantiene constante mientras no cambies de tramo. A largo plazo (20 a\u00f1os), son ${formatEuros(diffAnual * 20)} de diferencia patrimonial, sin contar el efecto del inter\u00e9s compuesto sobre ese ahorro adicional.`,
  ];

  return variants[v];
}
