module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Order matters - Reanimated plugin should be last
      'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
};