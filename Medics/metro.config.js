const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable Expo Router’s require.context
config.transformer.unstable_allowRequireContext = true;

// 🔧 Fix alias support for "@"
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

module.exports = config;
