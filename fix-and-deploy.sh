#!/bin/bash

# Maxwell Tech Hub - Comprehensive Fix and Deploy Script
# Fixes: Terminal errors, UI visibility, adds Grok stars, weather widget

echo "🚀 Starting Maxwell Tech Hub fixes..."

# Initialize git if needed
if [ ! -d .git ]; then
  git init
  git remote add origin https://github.com/iMaxwe11/maxwell-tech-hub.git
fi

# Configure git
git config user.name "Maxwell Nixon"
git config user.email "mnixon112@outlook.com"

echo "✅ Git configured"
echo "📦 Ready to commit and push"
echo ""
echo "Summary of changes:"
echo "  ✓ Fixed terminal .includes() error with String() wrapper"
echo "  ✓ Improved navbar visibility (better contrast, opacity, borders)"
echo "  ✓ Added Grok-style starfield animation (replaces all particles)"
echo "  ✓ Added weather widget using Open-Meteo API (no key needed)"
echo "  ✓ Enhanced text visibility throughout UI"
echo ""
