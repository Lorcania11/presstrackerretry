const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // Fix for inspector proxy issue
  server: {
    // Remove runInspectorProxy option which is causing issues
    enhanceMiddleware: (middleware) => {
      return middleware;
    },
  },
  // Needed for compatibility with Expo projects
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);