const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// The web and mobile apps share the dependency-free XP calculation.
// They have separate installs, so expose only that source directory to Metro.
config.watchFolders = [...config.watchFolders, path.resolve(__dirname, '../../src/lib/learning')];

module.exports = config;
