import { describe, it, expect } from 'vitest';
import { calcularDespido, mesesServicio, indemnizacionPorAnios } from '../src/lib/despido-engine';

const D = (s: string) => Date.parse(s + 'T00:00:00Z');

describe('antigüedad (prorrateo por meses)', () => {
  it('8 años y 7 meses exactos', () => expect(mesesServicio(D('2018-03-01'), D('2026-09-30'))).toBe(103));
  it('la fracción de mes cuenta como mes completo', () => expect(mesesServicio(D('2018-03-01'), D('2018-03-05'))).toBe(1));
  it('sin redondeo, prorrateo por días', () => expect(mesesServicio(D('2018-03-01'), D('2018-03-15'), false)).toBeCloseTo(0.5, 5));
});

describe('despido improcedente (art. 56.1 y DT 11.ª ET)', () => {
  it('contrato posterior a 2012: 33 días por año', () => {
    const r = calcularDespido({ inicio: '2018-03-01', fin: '2026-09-30', salarioAnual: 30000, tipo: 'improcedente' });
    expect(r.diasIndemnizacion).toBeCloseTo(283.25, 4);
    expect(r.indemnizacion).toBeCloseTo(283.25 * 30000 / 365, 2);
    expect(r.regla).toBe('dias');
  });
  it('contrato anterior a 2012: 45 + 33 días, tope de 720 días', () => {
    const r = calcularDespido({ inicio: '2005-01-10', fin: '2026-09-30', salarioAnual: 40000, tipo: 'improcedente' });
    expect(r.tramoAnterior2012?.meses).toBe(86);
    expect(r.tramoPosterior2012?.meses).toBe(176);
    expect(r.diasSinTope).toBeCloseTo(322.5 + 484, 4);
    expect(r.diasIndemnizacion).toBe(720);
    expect(r.regla).toBe('tope720');
  });
  it('si el tramo anterior a 2012 supera 720 días, ese es el tope', () => {
    const r = calcularDespido({ inicio: '1990-01-01', fin: '2026-09-30', salarioAnual: 30000, tipo: 'improcedente' });
    expect(r.diasIndemnizacion).toBeCloseTo(997.5, 4);
    expect(r.regla).toBe('topePre2012');
  });
  it('nunca más de 42 mensualidades', () => {
    const r = calcularDespido({ inicio: '1975-01-01', fin: '2026-09-30', salarioAnual: 30000, tipo: 'improcedente' });
    expect(r.diasIndemnizacion).toBeCloseTo(42 * 365 / 12, 4);
    expect(r.regla).toBe('tope42');
  });
  it('directivo con 25 años: tope de 720 días, exención de 180 000 € y reducción del 30 %', () => {
    const r = indemnizacionPorAnios(120000, 25, 'improcedente', '2026-09-30');
    expect(r.regla).toBe('tope720');
    expect(r.indemnizacion).toBeCloseTo(720 * 120000 / 365, 2);
    expect(r.exenta).toBe(180000);
    expect(r.sujeta).toBeCloseTo(720 * 120000 / 365 - 180000, 2);
    expect(r.reduccion30).toBeCloseTo(0.3 * (720 * 120000 / 365 - 180000), 2);
  });
  it('tope de 24 mensualidades (contrato posterior a 2012, antigüedad de 27 años)', () => {
    const r = calcularDespido({ inicio: '2013-01-01', fin: '2039-12-31', salarioAnual: 36500, tipo: 'improcedente' });
    expect(r.regla).toBe('tope24');
    expect(r.indemnizacion).toBeCloseTo(73000, 2);
  });
  it('sin conciliación ni sentencia, la indemnización no está exenta', () => {
    const r = indemnizacionPorAnios(30000, 5, 'improcedente', '2026-09-30', { reconocidaConciliacion: false });
    expect(r.exenta).toBe(0);
    expect(r.sujeta).toBeCloseTo(r.indemnizacion, 6);
  });
});

describe('objetivo, ERE y fin de contrato', () => {
  it('objetivo: 20 días por año', () => {
    const r = indemnizacionPorAnios(30000, 15, 'objetivo', '2026-09-30');
    expect(r.diasIndemnizacion).toBeCloseTo(300, 4);
    expect(r.exenta).toBeCloseTo(r.indemnizacion, 6);
  });
  it('objetivo: tope de 12 mensualidades', () => {
    const r = indemnizacionPorAnios(30000, 20, 'objetivo', '2026-09-30');
    expect(r.indemnizacion).toBeCloseTo(30000, 2);
    expect(r.regla).toBe('tope12');
  });
  it('ERE pactado a 30 días: exenta hasta el importe del improcedente', () => {
    const r = indemnizacionPorAnios(36500, 10, 'ere', '2026-09-30', { ereDias: 45, ereTopeMensualidades: 24 });
    expect(r.indemnizacion).toBeCloseTo(450 * 100, 2);
    expect(r.exenta).toBeCloseTo(330 * 100, 2);
    expect(r.sujeta).toBeCloseTo(120 * 100, 2);
    expect(r.reduccion30).toBeCloseTo(3600, 2);
  });
  it('fin de contrato temporal: 12 días por año, no exenta', () => {
    const r = indemnizacionPorAnios(24000, 1, 'fin-contrato', '2026-09-30');
    expect(r.indemnizacion).toBeCloseTo(12 * 24000 / 365, 2);
    expect(r.exenta).toBe(0);
    expect(r.reduccion30).toBe(0);
  });
  it('baja voluntaria: sin indemnización', () => {
    expect(indemnizacionPorAnios(30000, 6, 'voluntaria', '2026-09-30').indemnizacion).toBe(0);
  });
});

describe('finiquito', () => {
  const r = calcularDespido({ inicio: '2020-01-01', fin: '2026-09-15', salarioAnual: 28000, tipo: 'voluntaria', vacacionesDisfrutadas: 10 });
  it('salario de los días del mes', () => expect(r.salarioPendiente).toBeCloseTo(1000, 2));
  it('paga de Navidad devengada desde el 1 de julio', () => {
    expect(r.pagaExtraNombre).toBe('navidad');
    expect(r.pagaExtraImporte).toBeCloseTo(2000 * 77 / 184, 2);
  });
  it('vacaciones devengadas en el año menos las disfrutadas', () => {
    expect(r.vacacionesDevengadas).toBeCloseTo(30 * 258 / 365, 4);
    expect(r.vacacionesImporte).toBeCloseTo((30 * 258 / 365 - 10) * 2000 / 30, 2);
  });
  it('pagas prorrateadas: no hay paga extra pendiente', () => {
    const p = calcularDespido({ inicio: '2020-01-01', fin: '2026-09-15', salarioAnual: 28000, tipo: 'voluntaria', pagas: '12' });
    expect(p.pagaExtraImporte).toBe(0);
    expect(p.salarioPendiente).toBeCloseTo(28000 / 12 / 2, 2);
  });
  it('fecha de fin anterior al inicio: resultado inválido', () => {
    expect(calcularDespido({ inicio: '2026-01-01', fin: '2025-01-01', salarioAnual: 1, tipo: 'objetivo' }).valido).toBe(false);
  });
});
