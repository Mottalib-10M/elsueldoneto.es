import { describe, it, expect } from 'vitest';
import { calcularJubilacion, porcentajePorMeses, edadOrdinaria, coeficienteAnticipo, baseReguladora } from '../src/lib/jubilacion-engine';

describe('porcentaje por años cotizados (art. 210.1 y DT 9.ª LGSS)', () => {
  it('15 años: 50 %', () => expect(porcentajePorMeses(180, 2026)).toBe(50));
  it('menos de 15 años: sin pensión', () => expect(porcentajePorMeses(179, 2026)).toBe(0));
  it('36 años y 6 meses: 100 % en 2026', () => expect(porcentajePorMeses(438, 2026)).toBe(100));
  it('25 años en 2026: 49 meses a 0,21 y 71 a 0,19', () => expect(porcentajePorMeses(300, 2026)).toBeCloseTo(73.78, 2));
  it('25 años desde 2027: 0,19 por mes', () => expect(porcentajePorMeses(300, 2027)).toBeCloseTo(72.8, 2));
  it('desde 2027 el 100 % exige 37 años', () => { expect(porcentajePorMeses(443, 2027)).toBeLessThan(100); expect(porcentajePorMeses(444, 2027)).toBe(100); });
});

describe('edad ordinaria (DT 7.ª LGSS)', () => {
  const nac = (a: number, m: number) => a * 12 + m - 1;
  it('38 años y 3 meses o más en 2026: 65 años', () => expect(edadOrdinaria(nac(1961, 6), () => 459)).toBe(780));
  it('menos en 2026: 66 años y 10 meses', () => expect(edadOrdinaria(nac(1960, 1), () => 400)).toBe(802));
  it('66 y 10 meses caen en 2027: 67 años', () => expect(edadOrdinaria(nac(1960, 3), () => 400)).toBe(804));
  it('en 2027 hacen falta 38 años y 6 meses para los 65', () => expect(edadOrdinaria(nac(1962, 3), () => 460)).toBe(804));
});

describe('coeficientes reductores (arts. 207 y 208 LGSS)', () => {
  it('voluntaria, 24 meses, 40 años cotizados: 19 %', () => expect(coeficienteAnticipo(24, 480, false)).toBeCloseTo(0.19, 6));
  it('voluntaria, 1 mes, menos de 38 años y 6 meses: 3,26 %', () => expect(coeficienteAnticipo(1, 400, false)).toBeCloseTo(0.0326, 6));
  it('involuntaria, 48 meses: 30 %', () => expect(coeficienteAnticipo(48, 400, true)).toBeCloseTo(0.30, 6));
  it('involuntaria, 12 meses, 45 años: 4,75 %', () => expect(coeficienteAnticipo(12, 540, true)).toBeCloseTo(0.0475, 6));
});

describe('base reguladora: las dos fórmulas de 2026', () => {
  it('carrera completa a base constante: 302 ÷ 352,33 frente a 300 ÷ 350', () => {
    const r = baseReguladora(Array(360).fill(2000), 2026);
    expect(r.baseAntigua).toBeCloseTo(600000 / 350, 4);
    expect(r.baseNueva).toBeCloseTo(604000 / 352.33, 4);
  });
  it('dos meses malos: la fórmula nueva los descarta', () => {
    const s = Array(360).fill(3000); s[5] = 1424.4; s[100] = 1424.4;
    const r = baseReguladora(s, 2026);
    expect(r.metodo).toBe('nueva');
    expect(r.baseNueva).toBeCloseTo(302 * 3000 / 352.33, 4);
  });
  it('lagunas: 48 meses a la base mínima y el resto al 50 %', () => {
    const s: (number | null)[] = Array(360).fill(null);
    const r = baseReguladora(s, 2026);
    expect(r.baseAntigua).toBeCloseTo((48 * 1424.4 + 252 * 712.2) / 350, 3);
  });
  it('2037: régimen definitivo, 324 mejores de 348 entre 378', () => {
    const r = baseReguladora(Array(360).fill(2000), 2037);
    expect(r.baseNueva).toBeCloseTo(324 * 2000 / 378, 4);
  });
  it('integración reforzada de lagunas (DT 41.ª): solo en la fórmula nueva', () => {
    const s: (number | null)[] = Array(360).fill(null);
    const g = baseReguladora(s, 2026), r = baseReguladora(s, 2026, true);
    expect(r.baseAntigua).toBeCloseTo(g.baseAntigua!, 6);
    // 302 mejores de 304: 48 al 100 %, 12 al 100 % (49-60), 24 al 80 % (61-84) y el resto al 50 %
    const esperado = (48 * 1424.4 + 12 * 1424.4 + 24 * 1424.4 * 0.8 + 218 * 712.2) / 352.33;
    expect(r.baseNueva).toBeCloseTo(esperado, 3);
  });
  it('2044: ya no hay opción antigua', () => expect(baseReguladora(Array(360).fill(2000), 2044).baseAntigua).toBeNull());
});

describe('simulación completa', () => {
  const hoy = { hoyAnio: 2026, hoyMes: 10 };
  it('carrera larga ya jubilable: 100 % de la base', () => {
    const r = calcularJubilacion({ anioNacimiento: 1961, mesNacimiento: 1, mesesCotizadosHoy: 480, baseActual: 3000, ...hoy });
    expect(r.derecho).toBe(true);
    expect(r.porcentaje).toBe(100);
    expect(r.baseReguladora).toBeCloseTo(302 * 3000 / 352.33, 2);
    expect(r.pensionMensual).toBeCloseTo(302 * 3000 / 352.33, 2);
  });
  it('pensión máxima de 3359,60 €', () => {
    const r = calcularJubilacion({ anioNacimiento: 1961, mesNacimiento: 1, mesesCotizadosHoy: 480, baseActual: 5101.2, ...hoy });
    expect(r.pensionMensual).toBeCloseTo(3359.6, 2);
    expect(r.limitadaPorMaxima).toBe(true);
  });
  it('anticipada voluntaria 24 meses: coeficiente del art. 208', () => {
    const r = calcularJubilacion({ anioNacimiento: 1963, mesNacimiento: 6, mesesCotizadosHoy: 420, baseActual: 2500, edadDeseadaMeses: 804 - 24, ...hoy });
    expect(r.modalidad).toBe('voluntaria');
    expect(r.edadOrdinariaMeses).toBe(804);
    expect(r.mesesAnticipo).toBe(24);
    expect(r.coeficiente).toBeCloseTo(0.21, 6);
  });
  it('anticipada voluntaria por encima de la máxima: DT 34.ª, columna 2026', () => {
    const r = calcularJubilacion({ anioNacimiento: 1962, mesNacimiento: 12, mesesCotizadosHoy: 480, baseActual: 5101.2, edadDeseadaMeses: 756, ...hoy });
    expect(r.anioHecho).toBe(2026);
    expect(r.coeficienteSobreTope).toBe(true);
    expect(r.mesesAnticipo).toBe(14);
    expect(r.pensionCalculada).toBeCloseTo(3359.6 * (1 - 0.0355), 2);
  });
  it('menos de 15 años: sin pensión contributiva', () => {
    const r = calcularJubilacion({ anioNacimiento: 1961, mesNacimiento: 1, mesesCotizadosHoy: 120, baseActual: 2000, sigueCotizando: false, ...hoy });
    expect(r.derecho).toBe(false);
    expect(r.motivo).toBe('carencia');
  });
  it('complemento a mínimos con cónyuge a cargo: hasta 1256,60 €', () => {
    const r = calcularJubilacion({ anioNacimiento: 1961, mesNacimiento: 1, mesesCotizadosHoy: 200, baseActual: 1424.4, situacion: 'conyugeACargo', ...hoy });
    expect(r.pensionCalculada + r.complementoMinimos).toBeCloseTo(17592.4 / 14, 2);
  });
  it('demora de dos años y medio: 10 % adicional', () => {
    const r = calcularJubilacion({ anioNacimiento: 1961, mesNacimiento: 12, mesesCotizadosHoy: 480, baseActual: 2000, edadDeseadaMeses: 780 + 31, ...hoy });
    expect(r.modalidad).toBe('demorada');
    expect(r.porcentajeDemora).toBe(10);
  });
  it('anticipada voluntaria sin 35 años: se calcula la ordinaria y se avisa', () => {
    const r = calcularJubilacion({ anioNacimiento: 1963, mesNacimiento: 6, mesesCotizadosHoy: 300, baseActual: 2500, edadDeseadaMeses: 790, ...hoy });
    expect(r.avisoAnticipada).toBe('mesesCotizados');
    expect(r.modalidad).toBe('ordinaria');
  });
});
