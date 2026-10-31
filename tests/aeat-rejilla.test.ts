/**
 * Contraste con el servicio de cálculo de retenciones de la AEAT 2026 (rejilla de
 * fixtures/aeat-retenciones-2026.json, generada por scripts/aeat-abgleich.mjs; fecha en el fichero).
 * Se comparan, al céntimo, la reducción por rendimientos del trabajo (art. 20 LIRPF), el rendimiento
 * neto reducido (base del cálculo) y el mínimo personal y familiar. La retención de la AEAT usa la
 * escala de retenciones, no la escala autonómica, y no se compara con la cuota anual del simulador.
 */
import { describe, expect, test } from 'vitest';
import rejilla from './fixtures/aeat-retenciones-2026.json';
import { rendimientoNetoReducido, calcularMinimoPersonalFamiliar, situacionFamiliarDefecto, calcularSueldoNeto } from '../src/lib/irpf-engine';

const c2 = (x: number) => Math.round(x * 100) / 100;

describe(`AEAT retenciones 2026 (${rejilla.fuente}, consultado ${rejilla.consultado})`, () => {
  test.each(rejilla.casos.map((c) => [`${c.situacion}, ${c.bruto} €`, c] as const))('%s', (_n, c) => {
    const r = rendimientoNetoReducido(c.bruto, c.cotizaciones);
    expect(c2(r.rendimientoNeto)).toBe(c.aeat.RdtoNeto);
    expect(c2(r.reduccion)).toBe(c.aeat.ReduccionRdtosTrabajo);
    expect(c2(r.base)).toBe(c.aeat.RdtoNetoReducido);
    const edad = 2026 - c.nacimiento;
    const minimo = calcularMinimoPersonalFamiliar({ ...situacionFamiliarDefecto, edad, hijos: c.hijos.length, hijosMenores3: c.hijos.filter((a) => 2026 - a < 3).length });
    expect(minimo).toBe(c.aeat.MinimoPersonalFamiliar);
  });
});

// Casos del auditor (2026-10-28), soltero, 14 pagas. Recalculados con la reducción del art. 20 sobre
// bruto − cotizaciones (BOE-A-2006-20764, art. 20, leído el 2026-10-31) y la deducción de Ceuta y Melilla
// del 60 % de las cuotas íntegras (art. 68.4 LIRPF).
describe('IRPF anual (auditoría 2026-10-28)', () => {
  test.each([
    [18_000, 'MD', 569.42],
    [20_000, 'MD', 1_905.92],
    [22_000, 'MD', 2_611.17],
    [30_000, 'MD', 4_632.58],
    [30_000, 'CT', 4_958.75],
    [30_000, 'CE', 1_970.4],
    [30_000, 'ML', 1_970.4],
  ] as const)('%i € en %s → %f €', (bruto, ccaa, irpf) => {
    expect(c2(calcularSueldoNeto(bruto, ccaa).irpfTotalAnual)).toBe(irpf);
  });
  test('Ceuta: bonificación = 60 % de la cuota íntegra; estatal + autonómico − bonificación = total', () => {
    const r = calcularSueldoNeto(30_000, 'CE');
    expect(c2(r.irpfEstatalAnual + r.irpfAutonomicoAnual - r.bonificacionCeutaMelilla)).toBe(c2(r.irpfTotalAnual));
    expect(c2(r.bonificacionCeutaMelilla / (r.irpfEstatalAnual + r.irpfAutonomicoAnual))).toBe(0.6);
  });
});
