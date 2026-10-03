/** Fuentes oficiales de los módulos despido y jubilación, leídas de los ficheros de parámetros. */
import PD from '../data/params-despido-2026.json';
import PJ from '../data/params-jubilacion-2026.json';

export const fuentesDespido = PD.sources;
export const fuentesJubilacion = PJ.sources;
const EN: Record<string, string> = {
  'Estatuto de los Trabajadores, arts. 38, 49, 51, 53, 56 y disposición transitoria 11.ª': 'Workers’ Statute (Estatuto de los Trabajadores), arts. 38, 49, 51, 53, 56 and transitional provision 11',
  'Ley 35/2006 del IRPF, art. 7.e (exención) y art. 18.2 (reducción del 30 %)': 'Personal Income Tax Act 35/2006, art. 7.e (exemption) and art. 18.2 (30% reduction)',
  'Agencia Tributaria, Manual práctico de Renta 2025: indemnizaciones por despido o cese del trabajador': 'Spanish Tax Agency, 2025 income tax manual: severance payments',
  'LGSS, arts. 205 a 210 y disposiciones transitorias 4.ª, 7.ª, 9.ª, 34.ª, 40.ª y 41.ª': 'General Social Security Act (LGSS), arts. 205 to 210 and transitional provisions 4, 7, 9, 34, 40 and 41',
  'Real Decreto-ley 2/2023 (reforma del cálculo de la base reguladora)': 'Royal Decree-law 2/2023 (reform of the regulatory base)',
  'Real Decreto-ley 3/2026 (pensión máxima, cuantías mínimas y revalorización 2026)': 'Royal Decree-law 3/2026 (2026 maximum pension, minimum amounts and uprating)',
  'Seguridad Social: pensión de jubilación del Régimen General': 'Social Security: retirement pension, General Scheme',
};
export const enFuentes = (l: { label: string; url: string }[]) => l.map((s) => ({ url: s.url, label: EN[s.label] ?? s.label }));
export const eurES = (x: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(x);
export const eurEN = (x: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(x);
export const eurES2 = (x: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
export const eurEN2 = (x: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
export const numES = (x: number, d = 0) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: d }).format(x);
export const numEN = (x: number, d = 0) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: d }).format(x);
