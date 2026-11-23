/**
 * Lo que ya es oficial para 2027 (leído el 2026-11-21).
 * - SMI 2027 : Real Decreto 1013/2026, BOE núm. 288 de 19-11-2026 (BOE-A-2026-24189).
 * - Deducción del SMI en el IRPF 2027 : Real Decreto-ley 38/2026, art. 5, BOE núm. 287 de 18-11-2026
 *   (BOE-A-2026-24120), nueva redacción de la disposición adicional 61.ª LIRPF ; no cambia la tarifa.
 * - MEI y cotización adicional de solidaridad 2027 : Real Decreto-ley 2/2023, disposiciones transitorias
 *   43.ª y 42.ª de la LGSS, BOE núm. 65 de 17-03-2023 (BOE-A-2023-6967).
 * - Base máxima 2027 : pendiente de la Orden de cotización 2027 (revalorización de las pensiones + 1,2 puntos,
 *   disposición transitoria 38.ª LGSS). Reemplazar en cuanto se publique (la de 2026, Orden PJC/297/2026, salió en el BOE el 31-03-2026).
 */
import { seguridadSocial2026, tipoEmpleadoIndefinido } from './seguridad-social-2026';
import { deduccionSMI2026, tramosEstatales2026 } from './irpf-2026';
import { comunidadesAutonomas } from './comunidades-autonomas';
import {
  calcularImpuestoProgresivo,
  calcularMinimoPersonalFamiliar,
  rendimientoNetoReducido,
  situacionFamiliarDefecto,
} from '../lib/irpf-engine';

export const fuentes2027 = {
  smi: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-24189',
  deduccion: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-24120',
  rdl2_2023: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2023-6967',
};

export const cambios2027 = {
  smiMensual: 1_286,
  smiDiario: 42.87,
  smiAnual: 18_004,
  deduccionSMI: { importe: 1_033.58, hasta: 18_004, coeficiente: 0.2, agotaEn: 23_171.89 },
  meiEmpleado: 0.0017,
  meiEmpresa: 0.0083,
  // Cotización adicional de solidaridad 2027 (tipo total, empresa + trabajador), por tramo.
  solidaridadTotal: [0.0138, 0.015, 0.0175],
};

// Tipo del trabajador con contrato indefinido en 2027 : el de 2026 con el MEI del trabajador de 2027.
export const tipoEmpleadoIndefinido2027 =
  tipoEmpleadoIndefinido - seguridadSocial2026.empleado.mei + cambios2027.meiEmpleado;

// SMI 2027 en nómina (soltero, sin hijos, territorio común) : cotización con el MEI 2027 ; IRPF con la tarifa
// estatal vigente (el RDL 38/2026 no la cambia) y las escalas autonómicas de 2026, a falta de las de 2027,
// menos la deducción de 1.033,58 €. Ceuta y Melilla (bonificación del 60 %) y los forales quedan fuera.
export const smiNeto2027 = (() => {
  const b = cambios2027.smiAnual;
  const ss = b * tipoEmpleadoIndefinido2027;
  const { base } = rendimientoNetoReducido(b, ss);
  const minimo = calcularMinimoPersonalFamiliar(situacionFamiliarDefecto);
  const cuota = (t: Parameters<typeof calcularImpuestoProgresivo>[1]) =>
    Math.max(0, calcularImpuestoProgresivo(base, t) - calcularImpuestoProgresivo(minimo, t));
  const irpfPorCCAA = comunidadesAutonomas
    .filter((c) => !c.esForal && c.codigo !== 'CE' && c.codigo !== 'ML')
    .map((c) => ({
      codigo: c.codigo,
      nombre: c.nombre,
      irpf: Math.max(0, cuota(tramosEstatales2026) + cuota(c.tramos) - cambios2027.deduccionSMI.importe),
    }));
  const irpfMax = Math.max(...irpfPorCCAA.map((c) => c.irpf));
  const sinIRPF = irpfPorCCAA.filter((c) => c.irpf < 0.005).length;
  const neto = b - ss;
  return { ss, neto, mensual14: neto / 14, irpfPorCCAA, irpfMax, sinIRPF, total: irpfPorCCAA.length };
})();

export const smi2026 = {
  mensual: seguridadSocial2026.smiMensual,
  anual: seguridadSocial2026.smiAnual14Pagas,
  deduccion: deduccionSMI2026,
  meiEmpleado: seguridadSocial2026.empleado.mei,
  meiEmpresa: seguridadSocial2026.empresa.mei,
  solidaridadTotal: seguridadSocial2026.solidaridad.map((t) => t.empleado + t.empresa),
};
