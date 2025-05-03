#!/bin/bash

# Clean caches and node_modules for a fresh start

echo "Cleaning Metro and Node.js caches..."

# Remove node_modules
rm -rf node_modules

# Remove Metro bundler cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Remove Yarn/npm caches if they exist
rm -rf .yarn/cache
rm -rf .npm

# Install dependencies again
npm install

# Also remove the problematic packages and reinstall them with correct versions
npm install expo-splash-screen@~0.29.24 expo-web-browser@~14.0.2 --save

echo "Cache cleaned. Now try running 'npx expo start --clear'"
