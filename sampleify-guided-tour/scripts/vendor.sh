#!/bin/sh
# Copies the prototype this tour imports into prototype/, so the folder builds
# on its own (GitHub, Vercel). Run before publishing.
set -e
cd "$(dirname "$0")/.."
mkdir -p prototype
rsync -a --delete --exclude .DS_Store ../src/ prototype/src/
rsync -a --delete --exclude .DS_Store ../assets/ prototype/assets/
echo "Vendored prototype into prototype/"
