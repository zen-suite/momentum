const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { mergeConfig } = require('metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

config.server = config.server ?? {};
const existingEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const nextMiddleware = existingEnhanceMiddleware
    ? existingEnhanceMiddleware(middleware, server)
    : middleware;

  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return nextMiddleware(req, res, next);
  };
};

const testConfig = {
  resolver: {
    blockList: [/.*\.test\.[jt]sx?$/, /.*\.spec\.[jt]sx?$/, /\/website\/.*/],
  },
};

module.exports = withNativeWind(mergeConfig(config, testConfig), {
  input: './src/global.css',
});
