#!/bin/sh
# Publishes this folder (and only this folder) as the root of the GitHub repo.
# Usage: scripts/publish.sh "commit message"
set -e
cd "$(dirname "$0")/.."
URL="${SGT_REMOTE:-https://github.com/rishabhbs/sampleify-guided-tour.git}"
sh scripts/vendor.sh
SGT_VENDORED=1 npm run build 2>&1 | grep -E "rror|built in"
git add -- . 
if ! git diff --cached --quiet -- .; then git commit -q -m "${1:-Update guided tour}" -- .; fi
TOP=$(git rev-parse --show-toplevel)
PREFIX=$(git rev-parse --show-prefix | sed 's:/$::')
SPLIT=$(git -C "$TOP" subtree split --prefix="$PREFIX")
git push "$URL" "$SPLIT:refs/heads/main" ${SGT_FORCE:+--force}
echo "Published $SPLIT"
