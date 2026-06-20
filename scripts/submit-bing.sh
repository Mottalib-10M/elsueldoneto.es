#!/usr/bin/env bash
# submit-bing.sh — Submit sitemap & key pages to Bing IndexNow
# Usage: ./scripts/submit-bing.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/.env"

SITE="https://elsueldoneto.es"
KEY="282d66211edb4425bb8e514be7734269"
KEY_LOCATION="${SITE}/${KEY}.txt"

URLS=(
  "${SITE}/"
  "${SITE}/calculadora-irpf/"
  "${SITE}/calculadora-salario-bruto/"
  "${SITE}/calculadora-autonomos/"
  "${SITE}/comparador-comunidades/"
  "${SITE}/regimen-beckham-calculadora/"
  "${SITE}/calculadora-finiquito/"
  "${SITE}/calculadora-paro/"
  "${SITE}/calculadora-hipoteca/"
  "${SITE}/calculadora-jubilacion/"
  "${SITE}/calculadora-iva/"
  "${SITE}/calculadora-herencia/"
  "${SITE}/calculadora-venta-vivienda/"
  "${SITE}/calculadora-plusvalia-municipal/"
  "${SITE}/calculadora-prestamo/"
  "${SITE}/calculadora-interes-compuesto/"
  "${SITE}/calculadora-plan-ahorro/"
  "${SITE}/calculadora-inflacion/"
  "${SITE}/calculadora-hora-trabajada/"
  "${SITE}/calculadora-pagas-extra/"
  "${SITE}/calculadora-tipo-retencion/"
  "${SITE}/glosario/"
  "${SITE}/guias/"
  "${SITE}/sobre-nosotros/"
  "${SITE}/en/"
  "${SITE}/en/glossary/"
  "${SITE}/en/guides/"
  "${SITE}/en/about/"
)

# Build JSON payload
URL_JSON=$(printf '"%s",' "${URLS[@]}")
URL_JSON="[${URL_JSON%,}]"

PAYLOAD=$(cat <<EOF
{
  "host": "elsueldoneto.es",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": ${URL_JSON}
}
EOF
)

echo "Submitting ${#URLS[@]} URLs to Bing IndexNow..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP ${HTTP_CODE}"
[ -n "$BODY" ] && echo "$BODY"

# Also submit sitemap to Bing Webmaster API if API key is available
if [ -n "${BING_API_KEY:-}" ]; then
  echo ""
  echo "Submitting sitemap to Bing Webmaster API..."
  curl -s -X POST \
    "https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap?siteUrl=${SITE}&sitemapUrl=${SITE}/sitemap-index.xml&apikey=${BING_API_KEY}" \
    -H "Content-Type: application/json" && echo " OK" || echo " FAILED"
fi

echo ""
echo "Done."
