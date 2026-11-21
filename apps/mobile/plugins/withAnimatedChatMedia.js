const { withGradleProperties } = require('expo/config-plugins');

// The shared KLIPY picker prefers animated WebP. Include its decoder when prebuilding Android.
module.exports = (config) =>
  withGradleProperties(config, (config) => {
    const key = 'expo.webp.animated';
    config.modResults = config.modResults.filter((entry) => entry.key !== key);
    config.modResults.push({ type: 'property', key, value: 'true' });
    return config;
  });
