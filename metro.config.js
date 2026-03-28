const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { mergeConfig } = require('metro-config');

const config = getDefaultConfig(__dirname);

const testConfig = {
  resolver: {
    blockList: [/.*\.test\.[jt]sx?$/, /.*\.spec\.[jt]sx?$/, /\/website\/.*/],
  },
};

module.exports = withNativeWind(mergeConfig(config, testConfig), {
  input: './src/global.css',
});
