const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const config = getDefaultConfig(__dirname);

// Ensure we don't have the problematic runInspectorProxy option
if (config.server && config.server.runInspectorProxy) {
  delete config.server.runInspectorProxy;
}

// Customize resolver extensions to include all necessary file types
config.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'json', 
  'cjs', 'mjs', 'wasm'
];

// Ensure we handle SVG files properly
config.resolver.assetExts.push('svg');

module.exports = config;