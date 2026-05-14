/**
 * URL state encoding/decoding for shareable calculator scenarios.
 * Format: /?bruto=30000&ccaa=MAD&hijos=2&pagas=14
 */

export type CCAACodigo =
  | 'AN' | 'AR' | 'AS' | 'CB' | 'CL' | 'CM' | 'CN'
  | 'CT' | 'EX' | 'GA' | 'IB' | 'MC' | 'MD' | 'NC'
  | 'PV' | 'RI' | 'VC' | 'CE' | 'ML';

export interface CalculadoraState {
  bruto?: number;
  ccaa?: CCAACodigo;
  hijos?: number;
  pagas?: 12 | 14;
  conyuge?: 'sin-ingresos' | 'con-ingresos';
  discapacidad?: number;
  ascendientes?: number;
}

export function encodeState(state: CalculadoraState): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function decodeState(search: string): CalculadoraState {
  const params = new URLSearchParams(search);
  const state: CalculadoraState = {};

  const bruto = params.get('bruto');
  if (bruto) state.bruto = Number(bruto);

  const ccaa = params.get('ccaa');
  if (ccaa) state.ccaa = ccaa as CCAACodigo;

  const hijos = params.get('hijos');
  if (hijos) state.hijos = Number(hijos);

  const pagas = params.get('pagas');
  if (pagas === '12' || pagas === '14') state.pagas = Number(pagas) as 12 | 14;

  const conyuge = params.get('conyuge');
  if (conyuge === 'sin-ingresos' || conyuge === 'con-ingresos') state.conyuge = conyuge;

  const discapacidad = params.get('discapacidad');
  if (discapacidad) state.discapacidad = Number(discapacidad);

  const ascendientes = params.get('ascendientes');
  if (ascendientes) state.ascendientes = Number(ascendientes);

  return state;
}

export function buildShareUrl(basePath: string, state: CalculadoraState): string {
  const encoded = encodeState(state);
  return encoded ? `${basePath}?${encoded}` : basePath;
}
