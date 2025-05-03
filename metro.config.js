const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
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

module.exports = config;