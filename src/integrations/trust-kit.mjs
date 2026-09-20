/**
 * trust-kit.mjs — mise aux normes de confiance d'un site Astro existant (RECETTE-SITE.md §8).
 *
 * Les sites antérieurs à la trame n'ont ni date de mise à jour, ni encart auteur, ni
 * disclaimer, ni schémas Person/Organization complets. Leurs pages incluent elles-mêmes
 * leur en-tête et leur pied : le plus sûr est d'intervenir sur le HTML construit, une fois,
 * au lieu de retoucher des centaines de pages. Après le build, pour chaque page indexable :
 *
 *   - en haut, juste avant le <h1> (il en prend l'alignement) : « Mis à jour le AAAA-MM-JJ »
 *   - en bas, dans le dernier <footer>, avec la classe du conteneur du pied (même alignement) :
 *     disclaimer, date, liens méthode et auteur (rel="author")
 *   - dans <head> : Organization (founder = Person complet, foundingDate,
 *     publishingPrinciples) et WebPage.dateModified
 *   - chaque <table> hors îlot React est placé dans un conteneur à défilement horizontal :
 *     sur mobile, un tableau large ne fait plus déborder toute la page (§10.3)
 *
 * La date est celle du dernier commit qui a touché le fichier source de la page (et, pour
 * une route dynamique, ses données) : jamais inventée (§8.4). Le déploiement doit donc
 * cloner tout l'historique (`fetch-depth: 0`) ; sans historique, la date retombe sur le
 * dernier commit du dépôt.
 *
 * Usage, dans astro.config.mjs :
 *   import trustKit from './src/integrations/trust-kit.mjs';
 *   integrations: [..., trustKit({ lang: 'en', siteUrl, siteName, founded: '2026-06-27',
 *                                  about: '/about/', method: '/methodology/' })]
 * Site multilingue : `i18n: [{ prefix: '/de/', lang: 'de', about: '/de/ueber-uns/', method: '/de/methodik/' }, …]`
 * — la première entrée dont le préfixe correspond à l'adresse de la page l'emporte.
 */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const TEXT = {
  en: { updated: 'Updated', by: 'by', last: 'Last updated:', method: 'Methodology', about: 'About the author',
        disclaimer: 'Estimates for guidance only: this site does not replace the decision of the competent authority or advice from a qualified professional.' },
  fr: { updated: 'Mis à jour le', by: 'par', last: 'Dernière mise à jour\u00a0:', method: 'Méthodologie', about: 'À propos de l’auteur',
        disclaimer: 'Estimation indicative : ce site ne remplace ni la décision de l’administration compétente ni le conseil d’un professionnel.' },
  es: { updated: 'Actualizado el', by: 'por', last: 'Última actualización:', method: 'Metodología', about: 'Sobre el autor',
        disclaimer: 'Estimación orientativa: esta web no sustituye la resolución del organismo competente ni el asesoramiento de un profesional.' },
  de: { updated: 'Aktualisiert am', by: 'von', last: 'Zuletzt aktualisiert:', method: 'Methodik', about: 'Über den Autor',
        disclaimer: 'Unverbindliche Schätzung: Diese Website ersetzt keine Entscheidung der zuständigen Behörde und keine Fachberatung.' },
  it: { updated: 'Aggiornato il', by: 'di', last: 'Ultimo aggiornamento:', method: 'Metodologia', about: 'Chi è l’autore',
        disclaimer: 'Stima indicativa: questo sito non sostituisce la decisione dell’autorità competente né il parere di un professionista.' },
  pt: { updated: 'Atualizado em', by: 'por', last: 'Última atualização:', method: 'Metodologia', about: 'Sobre o autor',
        disclaimer: 'Estimativa indicativa: este site não substitui a decisão do órgão competente nem a orientação de um profissional.' },
};

const AUTHOR = {
  name: 'Radif Partners',
  jobTitle: 'Éditeur de calculateurs et de guides pratiques',
  knowsAbout: ['Personal finance', 'Payroll and income tax', 'Social security'],
};

// Tableaux larges : conteneur défilant, sauf dans un <astro-island> (React compare son rendu
// au HTML servi) et sauf si le tableau est déjà dans un conteneur overflow.
function wrapTables(html) {
  let depth = 0;
  return html.split(/(<\/?astro-island\b[^>]*>|<table\b[^>]*>|<\/table>)/).map((part, i, all) => {
    if (/^<astro-island/.test(part)) depth++;
    else if (/^<\/astro-island/.test(part)) depth--;
    else if (depth === 0 && /^<table\b/.test(part) && !/overflow-x-auto|overflow-x:\s*auto/.test(all[i - 1]?.slice(-200) || '')) return `<div class="table-scroll" style="overflow-x:auto;max-width:100%">${part}`;
    else if (depth === 0 && part === '</table>' && all.slice(0, i).reverse().find((p) => /^<table\b/.test(p)) !== undefined) {
      // fermer le conteneur seulement si on en a ouvert un pour la table correspondante
      const open = all.slice(0, i).map((p, k) => [p, k]).reverse().find(([p]) => /^<table\b/.test(p));
      const before = all[open[1] - 1]?.slice(-200) || '';
      if (!/overflow-x-auto|overflow-x:\s*auto/.test(before)) return `${part}</div>`;
    }
    return part;
  }).join('');
}

// Complète les schémas que la page déclare déjà : un Organization sans foundingDate ni
// publishingPrinciples, un Person de l'auteur sans jobTitle ni knowsAbout (§8.2).
function enrichJsonLd(html, org, author) {
  return html.replace(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/g, (all, open, body, close) => {
    if (open.includes('data-trust-kit')) return all;
    let data; try { data = JSON.parse(body); } catch { return all; }
    const walk = (n) => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n || typeof n !== 'object') return;
      const types = [].concat(n['@type'] || []);
      if (types.includes('Organization')) {
        n.foundingDate ??= org.foundingDate;
        n.publishingPrinciples ??= org.publishingPrinciples;
      }
      if (types.includes('Organization') || (types.includes('Person') && n.name === author.name)) {
        n.jobTitle ??= author.jobTitle;
        n.knowsAbout ??= author.knowsAbout;
      }
      Object.values(n).forEach(walk);
    };
    walk(data);
    return open + JSON.stringify(data).replace(/</g, '\\u003c') + close;
  });
}

function git(args, cwd) {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); } catch { return ''; }
}

export default function trustKit(opts) {
  const localeOf = (path) => {
    const l = (opts.i18n || []).find((x) => path.startsWith(x.prefix)) || opts;
    return { t: TEXT[l.lang] || TEXT.en, about: l.about, method: l.method };
  };
  const entries = new Map();          // motif de route → fichier source
  let root = process.cwd();

  const dateOf = (entry) => {
    const paths = [entry];
    if (/\[.+\]/.test(entry)) paths.push('src/data', 'src/content');   // route dynamique : ses données aussi
    return git(['log', '-1', '--format=%cs', '--', ...paths], root) || git(['log', '-1', '--format=%cs'], root);
  };

  return {
    name: 'trust-kit',
    hooks: {
      'astro:config:done': ({ config }) => { root = fileURLToPath(config.root); },
      'astro:routes:resolved': ({ routes }) => {
        for (const r of routes) if (r.entrypoint && r.type === 'page') entries.set(r.pattern, r.entrypoint);
      },
      'astro:build:done': async ({ assets, logger }) => {
        let done = 0;
        for (const [pattern, files] of assets) {
          const entry = entries.get(pattern);
          if (!entry || pattern.startsWith('/embed')) continue;
          const date = dateOf(entry);
          for (const u of files) {
            const f = fileURLToPath(u);
            if (!f.endsWith('.html')) continue;
            let html = await readFile(f, 'utf8');
            if (/<meta[^>]+robots[^>]+noindex/i.test(html) || html.includes('data-trust-kit')) continue;
            const path = f.split('/dist')[1]?.replace(/index\.html$/, '') || '/';
            const { t, about, method } = localeOf(path);
            const top = `<p data-trust-kit class="trust-top" style="margin:0 0 0.5rem;font-size:0.8125rem;opacity:0.7">`
              + `${t.updated} <time datetime="${date}">${date}</time></p>`;
            const inner = (html.slice(html.lastIndexOf('<footer')).match(/<footer[^>]*>\s*<div class="([^"]*)"/) || [])[1];
            const bottom = `<div data-trust-kit class="${inner || ''}"><div class="trust-bottom" style="${inner ? '' : 'max-width:72rem;margin:0 auto;padding:0 1rem;'}margin-top:1.5rem;padding-bottom:1.5rem;font-size:0.8125rem;opacity:0.8">`
              + `<p>${t.disclaimer}</p>`
              + `<p>${t.last} <time datetime="${date}">${date}</time> · <a href="${method}">${t.method}</a> · `
              + `<a rel="author" href="${about}">${AUTHOR.name}</a></p></div></div>`;
            const ld = {
              '@context': 'https://schema.org',
              '@graph': [
                { '@type': 'Organization', '@id': `${opts.siteUrl}/#org`, name: opts.siteName, url: opts.siteUrl,
                  foundingDate: opts.founded, publishingPrinciples: `${opts.siteUrl}${method}`,
                  knowsAbout: AUTHOR.knowsAbout, description: AUTHOR.jobTitle },
                { '@type': 'WebPage', url: `${opts.siteUrl}${path}`, dateModified: date,
                  publisher: { '@id': `${opts.siteUrl}/#org` } },
              ],
            };
            html = enrichJsonLd(html, ld['@graph'][0], AUTHOR);
            html = html.replace('</head>', `<script type="application/ld+json" data-trust-kit>${JSON.stringify(ld)}</script></head>`);
            // Juste avant le premier <h1> ; si ce <h1> est dans un îlot React (<astro-island>),
            // avant l'îlot : React compare son rendu au HTML servi, on n'y insère jamais rien.
            const h1 = html.search(/<h1[\s>]/);
            if (h1 >= 0) {
              let at = h1;
              const open = html.lastIndexOf('<astro-island', h1);
              if (open >= 0 && html.lastIndexOf('</astro-island>', h1) < open) at = open;
              html = html.slice(0, at) + top + html.slice(at);
            } else html = html.includes('</header>') ? html.replace('</header>', `</header>${top}`)
                 : html.replace(/<body[^>]*>/, (m) => m + top);
            const i = html.lastIndexOf('</footer>');
            html = i >= 0 ? html.slice(0, i) + bottom + html.slice(i) : html.replace('</body>', `${bottom}</body>`);
            html = wrapTables(html);
            // Le conteneur défilant empêche la marge du tableau de fusionner avec celle du
            // paragraphe voisin : on la reporte sur le conteneur, sinon 56 px de trou.
            if (html.includes('<table'))
              html = html.replace('</head>', '<style data-trust-kit>.table-scroll,.prose .overflow-x-auto{margin:1.5em 0}.table-scroll>table,.prose .overflow-x-auto>table{margin:0!important}</style></head>');
            await writeFile(f, html); done++;
          }
        }
        logger.info(`${done} page(s) : date, auteur, disclaimer et schémas ajoutés`);
      },
    },
  };
}
