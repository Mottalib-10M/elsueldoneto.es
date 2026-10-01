/**
 * Neto de un trabajador autónomo: cuota del RETA por tramo de rendimientos e IRPF.
 * Lo comparten la calculadora, las tablas y los ejemplos, para que no diverjan.
 */
import { calcularCuotaAutonomo } from './finanz-engine';
import { calcularImpuestoProgresivo } from './irpf-engine';
import { tramosEstatales2026, minimoPersonal2026 } from '../data/irpf-2026';
import { getCCAAByCodigo, type CCAACodigo } from '../data/comunidades-autonomas';
import { retaTramos2026 } from '../data/seguridad-social-2026';

export interface NetoAutonomo {
  ingresosNetos: number;
  cuotaMensual: number;
  cuotaAnual: number;
  baseImponible: number;
  irpfAnual: number;
  netoAnual: number;
  netoMensual: number;
  tipoEfectivo: number;
  /** Cuota del RETA más IRPF, sobre la facturación */
  cargaTotal: number;
}

export function calcularNetoAutonomo(ingresos: number, gastos: number, ccaa: CCAACodigo = 'MD'): NetoAutonomo {
  const ingresosNetos = Math.max(0, ingresos - gastos);
  const cuotaMensual = calcularCuotaAutonomo(ingresosNetos / 12, retaTramos2026);
  const cuotaAnual = cuotaMensual * 12;

  // Base imponible = ingresos − gastos − cuota de autónomos
  const baseImponible = Math.max(0, ingresosNetos - cuotaAnual);

  // La cuota se calcula sobre la base y se le resta la que corresponde al mínimo personal
  const minimo = minimoPersonal2026.contribuyente;
  const cuota = (tramos: typeof tramosEstatales2026) =>
    Math.max(0, calcularImpuestoProgresivo(baseImponible, tramos) - calcularImpuestoProgresivo(minimo, tramos));
  const comunidad = getCCAAByCodigo(ccaa);
  const irpfAnual = comunidad.esForal ? cuota(comunidad.tramos) : cuota(tramosEstatales2026) + cuota(comunidad.tramos);

  const netoAnual = ingresosNetos - cuotaAnual - irpfAnual;
  return {
    ingresosNetos,
    cuotaMensual,
    cuotaAnual,
    baseImponible,
    irpfAnual,
    netoAnual,
    netoMensual: netoAnual / 12,
    tipoEfectivo: ingresosNetos > 0 ? irpfAnual / ingresosNetos : 0,
    cargaTotal: ingresos > 0 ? (cuotaAnual + irpfAnual) / ingresos : 0,
  };
}
