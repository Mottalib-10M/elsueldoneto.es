#!/usr/bin/env bash
# submit-bing.sh – Submit all site URLs to Bing Webmasters URL Submission API
# Usage: bash scripts/submit-bing.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

SITE="https://elsueldoneto.es"
KEY="$BING_API_KEY"
ENDPOINT="https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=$KEY"
BATCH_SIZE=50

# Check quota
QUOTA=$(curl -s "https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota?siteUrl=$SITE&apikey=$KEY")
DAILY=$(echo "$QUOTA" | python3 -c "import sys,json; print(json.load(sys.stdin)['d']['DailyQuota'])")
MONTHLY=$(echo "$QUOTA" | python3 -c "import sys,json; print(json.load(sys.stdin)['d']['MonthlyQuota'])")
echo "Quota: $DAILY daily / $MONTHLY monthly"

if [ "$DAILY" -eq 0 ]; then
  echo "Daily quota exhausted. Try again tomorrow."
  exit 0
fi

# Collect all HTML pages from the built site
URLS=$(find "$SCRIPT_DIR/../dist" -name "index.html" | sed "s|$SCRIPT_DIR/../dist||" | sed 's|/index.html|/|' | sort | sed "s|^|$SITE|")
TOTAL=$(echo "$URLS" | wc -l | tr -d ' ')
echo "Found $TOTAL URLs. Submitting up to $DAILY (daily limit)..."

# Submit in batches
TMPFILE=$(mktemp)
echo "$URLS" | head -"$DAILY" > "$TMPFILE"
SUBMITTED=0
BATCH=0

while true; do
  CHUNK=$(tail -n +$((BATCH * BATCH_SIZE + 1)) "$TMPFILE" | head -"$BATCH_SIZE")
  [ -z "$CHUNK" ] && break
  BATCH=$((BATCH + 1))
  COUNT=$(echo "$CHUNK" | wc -l | tr -d ' ')

  JSON_ARRAY=$(echo "$CHUNK" | awk '{printf "\"%s\"", $0; if(NR>0) printf ","}' | sed 's/,$//')

  RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"siteUrl\":\"$SITE\",\"urlList\":[$JSON_ARRAY]}")

  if echo "$RESPONSE" | grep -q '"ErrorCode"'; then
    MSG=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('Message','Unknown error'))" 2>/dev/null || echo "$RESPONSE")
    echo "Batch $BATCH ($COUNT URLs): ERROR - $MSG"
    break
  else
    SUBMITTED=$((SUBMITTED + COUNT))
    echo "Batch $BATCH ($COUNT URLs): OK"
  fi
done

rm -f "$TMPFILE"
echo "Submitted $SUBMITTED / $TOTAL URLs."
