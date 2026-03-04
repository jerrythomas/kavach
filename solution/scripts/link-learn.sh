#!/usr/bin/env bash
# Link all Kavach packages to the learn site

cd "$(dirname "$0")/../sites/learn" || exit 1

echo "Linking Kavach packages to learn site..."

# Core packages
bun link kavach
bun link @kavach/cli
bun link @kavach/vite
bun link @kavach/ui
bun link @kavach/query
bun link @kavach/logger
bun link @kavach/guardian
bun link @kavach/cookie
bun link @kavach/hashing

# Adapters
bun link @kavach/adapter-supabase
bun link @kavach/adapter-firebase
bun link @kavach/adapter-auth0
bun link @kavach/adapter-amplify
bun link @kavach/adapter-convex

echo "✓ All packages linked successfully!"
