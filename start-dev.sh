#!/bin/bash
# This script fixes issues with Metro bundler in some environments

# Install necessary packages if they're missing
npm install --save metro@^0.76.8 @react-native/metro-config@^0.72.0

# Start the Metro bundler with the updated configuration
REACT_NATIVE_PACKAGER_OPTS="--max-workers=8 --reset-cache" npx expo start
