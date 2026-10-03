const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// SQLite's browser worker needs WASM and cross-origin isolation. Native uses SQLite directly.
if (!config.resolver.assetExts.includes('wasm')) config.resolver.assetExts.push('wasm');
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  return middleware(req, res, next);
};
module.exports = config;
