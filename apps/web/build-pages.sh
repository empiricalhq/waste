#!/usr/bin/env bash
set -e

[[ "$(pwd)" =~ apps/web$ ]] || { echo "Run from apps/web"; exit 1; }
cd ../..
rm -f package.json bun.lock
cd apps/web
bun install
bun x @cloudflare/next-on-pages@1
