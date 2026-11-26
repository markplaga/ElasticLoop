#!/bin/sh
# Usage: tools/bump-version.sh 1.0.1 "What changed"
# Sets the same version in index.html, sw.js and version.json. Pushing that to main is a release:
# installed apps see it on their next check and offer the update.
set -e
V="$1"; N="${2:-}"
[ -n "$V" ] || { echo "usage: $0 <version> [notes]"; exit 1; }
cd "$(dirname "$0")/.."
sed -i.bak "s/^const APP_VERSION='[^']*'/const APP_VERSION='$V'/" index.html && rm -f index.html.bak
sed -i.bak "s/^const VERSION = '[^']*'/const VERSION = '$V'/" sw.js && rm -f sw.js.bak
printf '{ "version": "%s", "date": "%s", "notes": "%s" }\n' "$V" "$(date +%F)" "$N" > version.json
grep -n "APP_VERSION='" index.html | head -1; grep -n "^const VERSION" sw.js; cat version.json
