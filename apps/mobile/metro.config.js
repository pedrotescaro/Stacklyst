const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// The apps have separate installs. Expose only the shared source directories Metro needs.
config.watchFolders = [
  ...config.watchFolders,
  path.resolve(__dirname, '../../src/lib/learning'),
  path.resolve(__dirname, '../../src/lib/profile-frame-art'),
];

module.exports = config;
