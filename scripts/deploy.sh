#!/bin/bash
# HermesStore — Build and prepare for deployment
set -e

# Resolve the frontend directory relative to this script (scripts/ -> frontend/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../frontend" && pwd)"

cd "$FRONTEND_DIR"

echo "Building HermesStore frontend at: $FRONTEND_DIR"
npm run build

echo ""
echo "Build complete. Ready for deployment."
echo "To deploy to Cloudflare Pages:"
echo "  npx wrangler pages deploy .next --project-name hermesstore"
echo "Or to deploy to Vercel:"
echo "  npx vercel --prod"
