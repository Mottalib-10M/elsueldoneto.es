import { describe, expect, test } from 'vitest';
import { calcularSueldoNeto, calcularSeguridadSocialAnual } from '../src/lib/irpf-engine';

describe('sueldo neto: salario nulo y pequeño (2026-10-12)', () => {
  test('bruto 0: ninguna cotización, ningún IRPF, neto 0', () => {
    for (const ccaa of ['MD', 'CT', 'AN'] as const) {
      const r = calcularSueldoNeto(0, ccaa);
      expect(r.seguridadSocialAnual).toBe(0);
      expect(r.irpfTotalAnual).toBe(0);
      expect(r.netoAnual).toBe(0);
      expect(r.netoMensual).toBe(0);
    }
  });

  test('tiempo parcial (8.000 € al año): cotiza sobre lo cobrado, neto positivo', () => {
    const r = calcularSueldoNeto(8_000, 'MD');
    expect(r.seguridadSocialAnual).toBeCloseTo(8_000 * 0.065, 6);
    expect(r.irpfTotalAnual).toBe(0);
    expect(r.netoAnual).toBeCloseTo(8_000 * (1 - 0.065), 6);
  });

  test('neto nunca negativo', () => {
    for (const b of [0, 1, 100, 1_000, 5_000, 12_000, 17_000]) expect(calcularSueldoNeto(b, 'MD').netoAnual).toBeGreaterThanOrEqual(0);
  });

  test('sin cambio para un salario a jornada completa (30.000 €, Madrid)', () => {
    expect(calcularSeguridadSocialAnual(30_000)).toBeCloseTo(1_950, 6);
  });
});
