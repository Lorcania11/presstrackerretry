module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript"
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};