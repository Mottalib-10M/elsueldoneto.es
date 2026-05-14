/**
 * Comunidades Autónomas — Autonomic IRPF brackets for 2026.
 * Source: Official regional tax publications, BOE, idealista.com, guiafiscal.es
 *
 * Each CCAA has its own bracket structure for the autonomic portion of IRPF.
 * País Vasco and Navarra have fully separate foral regimes (their brackets
 * replace BOTH state and autonomic portions).
 */

import type { TramoIRPF } from './irpf-2026';

export type CCAACodigo =
  | 'AN' | 'AR' | 'AS' | 'IB' | 'CN' | 'CB' | 'CL' | 'CM'
  | 'CT' | 'VC' | 'EX' | 'GA' | 'MD' | 'MC' | 'NC' | 'PV'
  | 'RI' | 'CE' | 'ML';

export interface ComunidadAutonoma {
  codigo: CCAACodigo;
  nombre: string;
  nombreCorto: string;
  tramos: TramoIRPF[];
  esForal: boolean;    // If true, tramos replace both state + autonomic
  bonificaciones?: string; // Brief description of notable deductions
}

export const comunidadesAutonomas: ComunidadAutonoma[] = [
  {
    codigo: 'AN',
    nombre: 'Andalucía',
    nombreCorto: 'Andalucía',
    esForal: false,
    tramos: [
      { hasta: 13_000, tipo: 0.095 },
      { hasta: 21_100, tipo: 0.12 },
      { hasta: 35_200, tipo: 0.15 },
      { hasta: 60_000, tipo: 0.185 },
      { hasta: Infinity, tipo: 0.225 },
    ],
  },
  {
    codigo: 'AR',
    nombre: 'Aragón',
    nombreCorto: 'Aragón',
    esForal: false,
    tramos: [
      { hasta: 13_972.50, tipo: 0.095 },
      { hasta: 21_210, tipo: 0.12 },
      { hasta: 36_959.90, tipo: 0.15 },
      { hasta: 52_499.90, tipo: 0.185 },
      { hasta: 60_000, tipo: 0.205 },
      { hasta: 70_000, tipo: 0.23 },
      { hasta: 90_000, tipo: 0.24 },
      { hasta: 130_000, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.255 },
    ],
  },
  {
    codigo: 'AS',
    nombre: 'Principado de Asturias',
    nombreCorto: 'Asturias',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.10 },
      { hasta: 17_700, tipo: 0.12 },
      { hasta: 33_007, tipo: 0.14 },
      { hasta: 53_407, tipo: 0.185 },
      { hasta: 70_000, tipo: 0.215 },
      { hasta: 90_000, tipo: 0.225 },
      { hasta: 175_000, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.255 },
    ],
  },
  {
    codigo: 'IB',
    nombre: 'Illes Balears',
    nombreCorto: 'Baleares',
    esForal: false,
    tramos: [
      { hasta: 10_000, tipo: 0.09 },
      { hasta: 18_000, tipo: 0.1125 },
      { hasta: 30_000, tipo: 0.1425 },
      { hasta: 48_000, tipo: 0.175 },
      { hasta: 70_000, tipo: 0.19 },
      { hasta: 90_000, tipo: 0.2175 },
      { hasta: 120_000, tipo: 0.2275 },
      { hasta: 175_000, tipo: 0.2375 },
      { hasta: Infinity, tipo: 0.2475 },
    ],
  },
  {
    codigo: 'CN',
    nombre: 'Canarias',
    nombreCorto: 'Canarias',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.09 },
      { hasta: 17_707, tipo: 0.115 },
      { hasta: 33_007, tipo: 0.14 },
      { hasta: 53_407, tipo: 0.185 },
      { hasta: 90_000, tipo: 0.235 },
      { hasta: 120_000, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.26 },
    ],
  },
  {
    codigo: 'CB',
    nombre: 'Cantabria',
    nombreCorto: 'Cantabria',
    esForal: false,
    tramos: [
      { hasta: 13_000, tipo: 0.085 },
      { hasta: 21_000, tipo: 0.11 },
      { hasta: 35_200, tipo: 0.145 },
      { hasta: 60_000, tipo: 0.18 },
      { hasta: 90_000, tipo: 0.225 },
      { hasta: Infinity, tipo: 0.245 },
    ],
  },
  {
    codigo: 'CL',
    nombre: 'Castilla y León',
    nombreCorto: 'Castilla y León',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.09 },
      { hasta: 20_200, tipo: 0.12 },
      { hasta: 35_200, tipo: 0.14 },
      { hasta: 60_000, tipo: 0.185 },
      { hasta: Infinity, tipo: 0.215 },
    ],
  },
  {
    codigo: 'CM',
    nombre: 'Castilla-La Mancha',
    nombreCorto: 'Castilla-La Mancha',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.095 },
      { hasta: 20_200, tipo: 0.12 },
      { hasta: 35_200, tipo: 0.15 },
      { hasta: 60_000, tipo: 0.185 },
      { hasta: Infinity, tipo: 0.225 },
    ],
  },
  {
    codigo: 'CT',
    nombre: 'Cataluña',
    nombreCorto: 'Cataluña',
    esForal: false,
    tramos: [
      { hasta: 12_500, tipo: 0.095 },
      { hasta: 22_000, tipo: 0.125 },
      { hasta: 33_000, tipo: 0.16 },
      { hasta: 53_000, tipo: 0.19 },
      { hasta: 90_000, tipo: 0.215 },
      { hasta: 120_000, tipo: 0.235 },
      { hasta: 175_000, tipo: 0.245 },
      { hasta: Infinity, tipo: 0.255 },
    ],
  },
  {
    codigo: 'VC',
    nombre: 'Comunitat Valenciana',
    nombreCorto: 'Valencia',
    esForal: false,
    tramos: [
      { hasta: 12_000, tipo: 0.09 },
      { hasta: 22_000, tipo: 0.12 },
      { hasta: 32_000, tipo: 0.15 },
      { hasta: 42_000, tipo: 0.175 },
      { hasta: 52_000, tipo: 0.20 },
      { hasta: 65_000, tipo: 0.225 },
      { hasta: 72_000, tipo: 0.25 },
      { hasta: 100_000, tipo: 0.265 },
      { hasta: 150_000, tipo: 0.275 },
      { hasta: 200_000, tipo: 0.285 },
      { hasta: Infinity, tipo: 0.295 },
    ],
  },
  {
    codigo: 'EX',
    nombre: 'Extremadura',
    nombreCorto: 'Extremadura',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.08 },
      { hasta: 20_200, tipo: 0.10 },
      { hasta: 24_200, tipo: 0.16 },
      { hasta: 35_200, tipo: 0.175 },
      { hasta: 60_000, tipo: 0.21 },
      { hasta: 80_200, tipo: 0.235 },
      { hasta: 99_200, tipo: 0.24 },
      { hasta: 120_200, tipo: 0.245 },
      { hasta: 300_000, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.25 },
    ],
  },
  {
    codigo: 'GA',
    nombre: 'Galicia',
    nombreCorto: 'Galicia',
    esForal: false,
    tramos: [
      { hasta: 12_985, tipo: 0.09 },
      { hasta: 21_068, tipo: 0.1165 },
      { hasta: 35_200, tipo: 0.149 },
      { hasta: 47_600, tipo: 0.184 },
      { hasta: 60_000, tipo: 0.225 },
      { hasta: Infinity, tipo: 0.225 },
    ],
  },
  {
    codigo: 'MD',
    nombre: 'Comunidad de Madrid',
    nombreCorto: 'Madrid',
    esForal: false,
    tramos: [
      { hasta: 13_362, tipo: 0.085 },
      { hasta: 18_004, tipo: 0.107 },
      { hasta: 35_425, tipo: 0.128 },
      { hasta: 57_320, tipo: 0.174 },
      { hasta: Infinity, tipo: 0.205 },
    ],
    bonificaciones: 'Madrid tiene los tipos autonómicos más bajos de España.',
  },
  {
    codigo: 'MC',
    nombre: 'Región de Murcia',
    nombreCorto: 'Murcia',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.095 },
      { hasta: 20_200, tipo: 0.112 },
      { hasta: 34_000, tipo: 0.133 },
      { hasta: 60_000, tipo: 0.179 },
      { hasta: Infinity, tipo: 0.225 },
    ],
  },
  {
    codigo: 'RI',
    nombre: 'La Rioja',
    nombreCorto: 'La Rioja',
    esForal: false,
    tramos: [
      { hasta: 12_450, tipo: 0.08 },
      { hasta: 20_200, tipo: 0.106 },
      { hasta: 35_200, tipo: 0.136 },
      { hasta: 40_000, tipo: 0.178 },
      { hasta: 50_000, tipo: 0.183 },
      { hasta: 60_000, tipo: 0.19 },
      { hasta: 120_000, tipo: 0.245 },
      { hasta: Infinity, tipo: 0.27 },
    ],
  },
  // Foral regimes — these replace both state AND autonomic brackets
  {
    codigo: 'NC',
    nombre: 'Comunidad Foral de Navarra',
    nombreCorto: 'Navarra',
    esForal: true,
    tramos: [
      { hasta: 4_458, tipo: 0.13 },
      { hasta: 10_030, tipo: 0.22 },
      { hasta: 21_175, tipo: 0.25 },
      { hasta: 35_663, tipo: 0.28 },
      { hasta: 51_266, tipo: 0.365 },
      { hasta: 66_869, tipo: 0.415 },
      { hasta: 89_159, tipo: 0.44 },
      { hasta: 139_310, tipo: 0.47 },
      { hasta: 195_034, tipo: 0.49 },
      { hasta: 334_344, tipo: 0.505 },
      { hasta: Infinity, tipo: 0.52 },
    ],
    bonificaciones: 'Régimen foral propio. IRPF gestionado por la Hacienda Foral de Navarra.',
  },
  {
    codigo: 'PV',
    nombre: 'País Vasco',
    nombreCorto: 'País Vasco',
    esForal: true,
    tramos: [
      { hasta: 18_080, tipo: 0.23 },
      { hasta: 36_160, tipo: 0.28 },
      { hasta: 54_240, tipo: 0.35 },
      { hasta: 77_450, tipo: 0.40 },
      { hasta: 107_260, tipo: 0.45 },
      { hasta: 142_960, tipo: 0.46 },
      { hasta: 208_390, tipo: 0.47 },
      { hasta: Infinity, tipo: 0.49 },
    ],
    bonificaciones: 'Régimen foral propio (Álava, Gipuzkoa, Bizkaia). Escala unificada 2026.',
  },
  // Ceuta and Melilla use the same state brackets but have a 50% bonus on
  // the portion of the tax attributable to income earned there
  {
    codigo: 'CE',
    nombre: 'Ciudad Autónoma de Ceuta',
    nombreCorto: 'Ceuta',
    esForal: false,
    tramos: [
      // Same as state brackets for autonomic portion
      { hasta: 12_450, tipo: 0.095 },
      { hasta: 20_200, tipo: 0.12 },
      { hasta: 35_200, tipo: 0.15 },
      { hasta: 60_000, tipo: 0.185 },
      { hasta: 300_000, tipo: 0.225 },
      { hasta: Infinity, tipo: 0.245 },
    ],
    bonificaciones: 'Bonificación del 50% en cuota íntegra por rentas obtenidas en Ceuta.',
  },
  {
    codigo: 'ML',
    nombre: 'Ciudad Autónoma de Melilla',
    nombreCorto: 'Melilla',
    esForal: false,
    tramos: [
      // Same as state brackets for autonomic portion
      { hasta: 12_450, tipo: 0.095 },
      { hasta: 20_200, tipo: 0.12 },
      { hasta: 35_200, tipo: 0.15 },
      { hasta: 60_000, tipo: 0.185 },
      { hasta: 300_000, tipo: 0.225 },
      { hasta: Infinity, tipo: 0.245 },
    ],
    bonificaciones: 'Bonificación del 50% en cuota íntegra por rentas obtenidas en Melilla.',
  },
];

export function getCCAAByCodigo(codigo: CCAACodigo): ComunidadAutonoma {
  const ccaa = comunidadesAutonomas.find(c => c.codigo === codigo);
  if (!ccaa) throw new Error(`CCAA no encontrada: ${codigo}`);
  return ccaa;
}

export function getAllCCAAOrdenadas(): ComunidadAutonoma[] {
  return [...comunidadesAutonomas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
