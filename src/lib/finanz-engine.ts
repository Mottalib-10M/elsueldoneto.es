/**
 * Financial Engine — Pure calculation functions for credit, savings, and investment.
 */

export interface ResultadoPrestamo {
  cuotaMensual: number;
  totalIntereses: number;
  totalPagado: number;
  tablaAmortizacion: FilaAmortizacion[];
}

export interface FilaAmortizacion {
  mes: number;
  cuota: number;
  capital: number;
  intereses: number;
  saldoPendiente: number;
}

export interface ResultadoInteresCompuesto {
  capitalFinal: number;
  interesesTotales: number;
  capitalInvertido: number;
}

export interface ResultadoPlanAhorro {
  capitalFinal: number;
  totalAportado: number;
  interesesGenerados: number;
  evolucion: { mes: number; capital: number; aportado: number }[];
}

// ── Préstamo (Loan) ────────────────────────────────────────────────────────

export function calcularPrestamo(
  capital: number,
  tinAnual: number,      // TIN (Tipo de Interés Nominal) annual as decimal
  plazoMeses: number
): ResultadoPrestamo {
  const tipoMensual = tinAnual / 12;

  let cuotaMensual: number;
  if (tipoMensual === 0) {
    cuotaMensual = capital / plazoMeses;
  } else {
    cuotaMensual = capital * (tipoMensual * Math.pow(1 + tipoMensual, plazoMeses)) /
                   (Math.pow(1 + tipoMensual, plazoMeses) - 1);
  }

  const tablaAmortizacion: FilaAmortizacion[] = [];
  let saldo = capital;

  for (let mes = 1; mes <= plazoMeses; mes++) {
    const intereses = saldo * tipoMensual;
    const capitalAmortizado = cuotaMensual - intereses;
    saldo -= capitalAmortizado;

    tablaAmortizacion.push({
      mes,
      cuota: cuotaMensual,
      capital: capitalAmortizado,
      intereses,
      saldoPendiente: Math.max(0, saldo),
    });
  }

  const totalPagado = cuotaMensual * plazoMeses;

  return {
    cuotaMensual,
    totalIntereses: totalPagado - capital,
    totalPagado,
    tablaAmortizacion,
  };
}

// ── Interés Compuesto ──────────────────────────────────────────────────────

export function calcularInteresCompuesto(
  capitalInicial: number,
  tipoAnual: number,         // Annual rate as decimal
  anios: number,
  aportacionMensual: number = 0,
  frecuenciaCapitalizacion: number = 12  // Times per year
): ResultadoInteresCompuesto {
  const r = tipoAnual / frecuenciaCapitalizacion;
  const n = frecuenciaCapitalizacion * anios;

  // FV of lump sum
  let fvInicial = capitalInicial * Math.pow(1 + r, n);

  // FV of periodic contributions (monthly → per period adjustment)
  let fvAportaciones = 0;
  if (aportacionMensual > 0 && r > 0) {
    const aportacionPeriodo = aportacionMensual * (12 / frecuenciaCapitalizacion);
    fvAportaciones = aportacionPeriodo * ((Math.pow(1 + r, n) - 1) / r);
  } else if (aportacionMensual > 0) {
    fvAportaciones = aportacionMensual * 12 * anios;
  }

  const capitalFinal = fvInicial + fvAportaciones;
  const capitalInvertido = capitalInicial + aportacionMensual * 12 * anios;

  return {
    capitalFinal,
    interesesTotales: capitalFinal - capitalInvertido,
    capitalInvertido,
  };
}

// ── Plan de Ahorro ─────────────────────────────────────────────────────────

export function calcularPlanAhorro(
  aportacionMensual: number,
  tipoAnual: number,
  anios: number,
  capitalInicial: number = 0
): ResultadoPlanAhorro {
  const tipoMensual = tipoAnual / 12;
  const totalMeses = anios * 12;

  let capital = capitalInicial;
  let totalAportado = capitalInicial;
  const evolucion: { mes: number; capital: number; aportado: number }[] = [];

  for (let mes = 1; mes <= totalMeses; mes++) {
    capital += aportacionMensual;
    totalAportado += aportacionMensual;
    capital *= (1 + tipoMensual);

    if (mes % 12 === 0 || mes === totalMeses) {
      evolucion.push({ mes, capital, aportado: totalAportado });
    }
  }

  return {
    capitalFinal: capital,
    totalAportado,
    interesesGenerados: capital - totalAportado,
    evolucion,
  };
}

// ── Inflación ──────────────────────────────────────────────────────────────

export function calcularImpactoInflacion(
  cantidad: number,
  inflacionAnual: number,   // As decimal (e.g., 0.03 for 3%)
  anios: number
): { valorReal: number; perdidaPoder: number; equivalenteActual: number } {
  const valorReal = cantidad / Math.pow(1 + inflacionAnual, anios);
  return {
    valorReal,
    perdidaPoder: cantidad - valorReal,
    equivalenteActual: cantidad * Math.pow(1 + inflacionAnual, anios),
  };
}

// ── Hourly rate from annual salary ─────────────────────────────────────────

export function calcularTarifaHora(
  salarioAnual: number,
  horasSemanales: number = 40,
  semanasVacaciones: number = 5,  // ~22 días de vacaciones
  diasFestivos: number = 14
): { tarifaBruta: number; horasAnuales: number } {
  const semanasLaborables = 52 - semanasVacaciones;
  const horasFestivosPerdidas = (diasFestivos / 5) * horasSemanales / semanasLaborables;
  const horasAnuales = semanasLaborables * horasSemanales - horasFestivosPerdidas * semanasLaborables;
  return {
    tarifaBruta: salarioAnual / Math.max(horasAnuales, 1),
    horasAnuales: Math.max(horasAnuales, 1),
  };
}

// ── Finiquito (Settlement) ────────────────────────────────────────────

export interface ResultadoFiniquito {
  salarioPendiente: number;
  pagasExtrasProporcionales: number;
  vacacionesPendientes: number;
  indemnizacion: number;
  totalBruto: number;
}

export function calcularFiniquito(
  salarioBrutoMensual: number,
  diasTrabajadosMes: number,
  pagasExtra: 0 | 2,
  mesesDesdeUltimaPaga: number,
  diasVacacionesPendientes: number,
  antiguedadAnios: number,
  tipoDespido: 'voluntario' | 'improcedente' | 'objetivo' | 'fin-contrato'
): ResultadoFiniquito {
  const salarioDiario = salarioBrutoMensual / 30;

  const salarioPendiente = salarioDiario * diasTrabajadosMes;

  let pagasExtrasProporcionales = 0;
  if (pagasExtra === 2) {
    pagasExtrasProporcionales = (salarioBrutoMensual / 6) * mesesDesdeUltimaPaga;
  }

  const vacacionesPendientes = salarioDiario * diasVacacionesPendientes;

  let indemnizacion = 0;
  const salarioAnual = salarioBrutoMensual * (pagasExtra === 2 ? 14 : 12);
  const salarioDiarioAnual = salarioAnual / 365;

  switch (tipoDespido) {
    case 'improcedente':
      indemnizacion = Math.min(
        salarioDiarioAnual * 33 * antiguedadAnios,
        salarioBrutoMensual * 24
      );
      break;
    case 'objetivo':
      indemnizacion = Math.min(
        salarioDiarioAnual * 20 * antiguedadAnios,
        salarioBrutoMensual * 12
      );
      break;
    case 'fin-contrato':
      indemnizacion = salarioDiarioAnual * 12 * antiguedadAnios;
      break;
    case 'voluntario':
    default:
      indemnizacion = 0;
  }

  return {
    salarioPendiente,
    pagasExtrasProporcionales,
    vacacionesPendientes,
    indemnizacion,
    totalBruto: salarioPendiente + pagasExtrasProporcionales + vacacionesPendientes + indemnizacion,
  };
}

// ── Prestación por desempleo (Paro) ───────────────────────────────────

export interface ResultadoParo {
  baseReguladora: number;
  prestacionMensual180: number;
  prestacionMensualResto: number;
  duracionMeses: number;
  topeMaximo: number;
  topeMinimo: number;
}

export function calcularParo(
  baseCotizacionMensual: number,
  diasCotizados: number,
  hijos: number = 0
): ResultadoParo {
  const baseReguladoraDiaria = baseCotizacionMensual / 30;
  const periodosCotizados = Math.floor(diasCotizados / 360);
  const duracionDias = Math.min(Math.max(periodosCotizados * 120, 0), 720);
  const duracionMeses = duracionDias / 30;

  const prestacion180Diaria = baseReguladoraDiaria * 0.70;
  const prestacionRestoDiaria = baseReguladoraDiaria * 0.50;

  const ipremMensual = 600;

  let topeMaximo: number;
  let topeMinimo: number;

  if (hijos >= 2) {
    topeMaximo = ipremMensual * 2.25;
    topeMinimo = ipremMensual * 1.07;
  } else if (hijos === 1) {
    topeMaximo = ipremMensual * 2.00;
    topeMinimo = ipremMensual * 1.07;
  } else {
    topeMaximo = ipremMensual * 1.75;
    topeMinimo = ipremMensual * 0.80;
  }

  const prestacionMensual180 = Math.max(topeMinimo, Math.min(topeMaximo, prestacion180Diaria * 30));
  const prestacionMensualResto = Math.max(topeMinimo, Math.min(topeMaximo, prestacionRestoDiaria * 30));

  return {
    baseReguladora: baseReguladoraDiaria * 30,
    prestacionMensual180,
    prestacionMensualResto,
    duracionMeses,
    topeMaximo,
    topeMinimo,
  };
}

// ── Cuota autónomos (RETA) ────────────────────────────────────────────

export function calcularCuotaAutonomo(
  ingresosNetosMensuales: number,
  retaTramos: { hastaIngresos: number; cuotaMinima: number }[]
): number {
  for (const tramo of retaTramos) {
    if (ingresosNetosMensuales <= tramo.hastaIngresos) {
      return tramo.cuotaMinima;
    }
  }
  return retaTramos[retaTramos.length - 1].cuotaMinima;
}
