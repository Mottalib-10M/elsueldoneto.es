#!/usr/bin/env node
/**
 * Contraste con el servicio de cálculo de retenciones de la AEAT (ejercicio 2026).
 *
 * Envía una rejilla de casos al servicio web público de la AEAT (sin firma ni identificación,
 * documento «espeSWRET_2026.pdf» del portal de Retenciones) y guarda en
 * tests/fixtures/aeat-retenciones-2026.json el rendimiento neto, la reducción por rendimientos
 * del trabajo (art. 20 LIRPF), el rendimiento neto reducido y el mínimo personal y familiar.
 * Es la referencia de tests/aeat-rejilla.test.ts.
 *
 * Uso (una vez al año y en cada cambio del algoritmo):  node scripts/aeat-abgleich.mjs
 * Fuente: https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml
 */
import { writeFileSync } from 'node:fs';

const URL_AEAT = 'https://www2.agenciatributaria.gob.es/wlpl/PRET-R200/mc';
const EJER = 2026, PER = 1; // PER 1: algoritmo aplicable desde el 10 de septiembre de 2026
const NIF = '12345678Z'; // NIF de prueba con letra válida: el servicio solo calcula

// Cotizaciones del trabajador 2026: 6,50 % hasta la base máxima (5.101,20 €/mes); por encima, cuota de
// solidaridad. La rejilla se queda por debajo de la base máxima para no depender de ella.
const TIPO_SS = 0.065;
const BRUTOS = [12_000, 15_000, 16_000, 17_094, 18_000, 19_000, 20_000, 21_000, 22_000, 25_000, 30_000, 45_000, 60_000];
const SITUACIONES = [
  { id: 'soltero', nacimiento: 1996, hijos: [] },
  { id: '1-hijo-menor-3', nacimiento: 1990, hijos: [2025] },
  { id: '2-hijos', nacimiento: 1985, hijos: [2015, 2018] },
  { id: '66-anos', nacimiento: 1960, hijos: [] },
];

function xml(bruto, cot, s) {
  const desc = s.hijos.map((a) => `<Descendiente><Nacimiento>${a}</Nacimiento><ComputadoEntero/></Descendiente>`).join('');
  const sit = s.hijos.length ? '<Situacion1/>' : '<Situacion3/>';
  return `<?xml version="1.0" encoding="UTF-8"?><AEATRetencionesEntrada${EJER}><IdDoc><CodModelo>RET</CodModelo><Ejercicio>${EJER}</Ejercicio></IdDoc>`
    + `<Retenedor><Nif>${NIF}</Nif><ApellidosNombre>a</ApellidosNombre><Retenido><Nif>${NIF}</Nif><ApellidosNombre>a</ApellidosNombre>`
    + `<Nacimiento>${s.nacimiento}</Nacimiento><SituacionFamiliar>${sit}</SituacionFamiliar>`
    + `<SituacionLaboral><TrabajadorActivo><Contrato>1</Contrato></TrabajadorActivo></SituacionLaboral>${desc}`
    + `<RetribAnuales>${bruto.toFixed(2)}</RetribAnuales><Cotizaciones>${cot.toFixed(2)}</Cotizaciones></Retenido></Retenedor></AEATRetencionesEntrada${EJER}>`;
}

const valor = (x, ruta) => {
  const m = x.match(new RegExp(ruta));
  return m ? Number(m[1]) : 0;
};

async function consulta(bruto, cot, s) {
  const body = `EJER=${EJER}&PER=${PER}&F01=${encodeURIComponent(xml(bruto, cot, s))}`;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(URL_AEAT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const x = await res.text();
    if (res.ok && x.includes('AEATRetencionesSalida')) {
      return {
        RdtoNeto: valor(x, '<RdtoNeto>([\\d.]+)<'),
        ReduccionRdtosTrabajo: valor(x, '<Reduccion><RdtosTrabajo>([\\d.]+)<'),
        RdtoNetoReducido: valor(x, '<RdtoNetoReducido>([\\d.]+)<'),
        MinimoPersonalFamiliar: valor(x, '</MinimoCtye>[\\s\\S]*?<Total>([\\d.]+)</Total>\\s*</MinimoPersonalFamiliar>') || valor(x, '<MinimoPersonalFamiliar>[\\s\\S]*?</MinimoCtye>\\s*<Total>([\\d.]+)<'),
        ImpAnualRetenciones: valor(x, '<ImpAnualRetencionesIngresosCuenta>([\\d.]+)<'),
        TipoRetencion: valor(x, '<TipoRetencion>([\\d.]+)<'),
      };
    }
    if (x.includes('AEATRetencionesError')) throw new Error(`AEAT: ${x}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Sin respuesta de la AEAT para ${bruto} € (${s.id})`);
}

const casos = [];
for (const s of SITUACIONES) for (const bruto of BRUTOS) {
  const cotizaciones = Math.round(bruto * TIPO_SS * 100) / 100;
  casos.push({ situacion: s.id, nacimiento: s.nacimiento, hijos: s.hijos, bruto, cotizaciones, aeat: await consulta(bruto, cotizaciones, s) });
  await new Promise((r) => setTimeout(r, 300));
}
const destino = new URL('../tests/fixtures/aeat-retenciones-2026.json', import.meta.url);
writeFileSync(destino, JSON.stringify({
  fuente: `${URL_AEAT} (EJER=${EJER}, PER=${PER}), servicio de cálculo de retenciones de la AEAT`,
  consultado: new Date().toISOString().slice(0, 10),
  casos,
}, null, 1) + '\n');
console.log(`${casos.length} casos → ${destino.pathname}`);
