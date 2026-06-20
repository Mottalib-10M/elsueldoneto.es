#!/usr/bin/env bash
# submit-bing.sh – Submit all site URLs to Bing IndexNow API
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

SITE="https://elsueldoneto.es"
KEY="$BING_API_KEY"
ENDPOINT="https://api.indexnow.org/indexnow"

# Collect all HTML pages from the built site
URLS=$(find "$SCRIPT_DIR/../dist" -name "index.html" | sed "s|$SCRIPT_DIR/../dist||" | sed 's|/index.html|/|' | sort)

# Build JSON array of URLs
URL_LIST=""
for url in $URLS; do
  URL_LIST="$URL_LIST\"${SITE}${url}\","
done
# Remove trailing comma
URL_LIST="[${URL_LIST%,}]"

echo "Submitting $(echo "$URLS" | wc -l | tr -d ' ') URLs to Bing IndexNow..."

curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{
    \"host\": \"elsueldoneto.es\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"${SITE}/${KEY}.txt\",
    \"urlList\": $URL_LIST
  }" | python3 -m json.tool 2>/dev/null || echo "Submitted."

echo "Done."
