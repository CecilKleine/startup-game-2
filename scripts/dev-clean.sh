#!/bin/bash
# Clean start script for Next.js dev server
# This prevents stale build cache issues

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔄 Killing any existing Next.js processes..."
pkill -f "next dev" || true
sleep 1

echo "🚀 Starting dev server..."
npm run dev

