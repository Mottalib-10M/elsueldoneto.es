import { describe, it, expect } from 'vitest';
import { cambios2027, tipoEmpleadoIndefinido2027, smiNeto2027 } from '../src/data/cambios-2027';

describe('2027 : lo que la página afirma', () => {
  it('tipo del trabajador 2027 = 6,52 % (MEI 0,17 %)', () => {
    expect(tipoEmpleadoIndefinido2027).toBeCloseTo(0.0652, 6);
    expect(smiNeto2027.ss).toBeCloseTo(1_173.86, 2);
  });
  it('SMI 2027 : IRPF nulo en territorio común con la tarifa vigente', () => {
    expect(smiNeto2027.total).toBeGreaterThanOrEqual(15);
    expect(smiNeto2027.irpfMax).toBe(0);
    expect(smiNeto2027.sinIRPF).toBe(smiNeto2027.total);
  });
  it('la deducción 2027 se agota en 23.171,89 €', () => {
    const d = cambios2027.deduccionSMI;
    expect(d.importe - d.coeficiente * (d.agotaEn - d.hasta)).toBeCloseTo(0, 2);
  });
});
