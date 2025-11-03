#!/usr/bin/env bash
set -e

echo "Preparing isolated build environment..."

# Check if we're in apps/web
if [[ ! "$(pwd)" =~ apps/web$ ]]; then
  echo "Error: This script must be run from the apps/web directory"
  exit 1
fi

# Remove monorepo markers from root
cd ../..
echo "Removing monorepo markers..."
rm -f package.json bun.lock

# Install only apps/web dependencies (after removing workspace context)
cd apps/web
echo "Installing dependencies..."
bun install

# Run next-on-pages (which runs vercel build internally)
echo "Running @cloudflare/next-on-pages..."
bun x @cloudflare/next-on-pages@1

echo "Build complete!"
