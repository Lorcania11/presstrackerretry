#!/bin/bash

echo "Fixing Expo and Metro compatibility issues..."

# Remove node_modules and yarn.lock / package-lock.json
rm -rf node_modules
rm -f yarn.lock
rm -f package-lock.json

# Install specific versions of metro and metro-resolver
npm install --save metro@^0.80.0 metro-resolver@^0.80.0

# Clean Expo/Metro cache
rm -rf node_modules/.cache/metro
rm -rf node_modules/.cache/babel-loader

# Install all dependencies
npm install

echo "Dependencies fixed. Try running 'npx expo start --clear' now."
