/** Nombre décimal pour l'affichage, à la virgule en espagnol (« 28,6 ») : toFixed() écrit
 *  toujours un point (RECETTE §10.3). Les pages anglaises gardent le point. */
export const dec = (n: number, d = 1, locale = 'es-ES'): string =>
  n.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
