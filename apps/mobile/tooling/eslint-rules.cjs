const path = require('node:path');

const tokenProperties = /^(?:fontSize|lineHeight|letterSpacing|borderRadius|border.*Radius|borderWidth|border.*Width|padding.*|margin.*|gap|rowGap|columnGap)$/;
const rules = {
  'design-tokens': {
    meta: { type: 'problem', schema: [], messages: { color: 'Use a semantic theme color.', size: 'Use the shared typography, spacing or radius tokens.' } },
    create(context) {
      return {
        Literal(node) {
          if (typeof node.value === 'string' && /^(?:#[\da-f]{3,8}$|rgba?\(|hsla?\()/i.test(node.value)) context.report({ node, messageId: 'color' });
        },
        Property(node) {
          const name = node.key.name ?? node.key.value;
          if (tokenProperties.test(name) && node.value.type === 'Literal' && typeof node.value.value === 'number' && node.value.value !== 0) context.report({ node, messageId: 'size' });
        },
      };
    },
  },
  boundaries: {
    meta: { type: 'problem', schema: [], messages: { domain: 'Domain code must be independent of UI and persistence.', feature: 'Import another feature through its public index.', data: 'Feature screens access records through the shared store, not the data layer.', route: 'Routes use feature public exports and providers.' } },
    create(context) {
      const filename = path.resolve(context.filename).replaceAll('\\', '/');
      return {
        ImportDeclaration(node) {
          const source = node.source.value;
          const resolved = source.startsWith('@/') ? '/src/' + source.slice(2) : source.startsWith('.') ? path.resolve(path.dirname(context.filename), source).replaceAll('\\', '/') : source;
          if (filename.includes('/src/domain/') && (/^(react(?:-native)?|expo(?:-|\/|$)|zustand|i18next)/.test(source) || /\/src\/(?:data|state|features|design-system|i18n)\//.test(resolved))) context.report({ node, messageId: 'domain' });
          const ownFeature = filename.match(/\/src\/features\/([^/]+)/)?.[1];
          const importedFeature = resolved.match(/\/src\/features\/([^/]+)(.*)/);
          if (ownFeature && importedFeature && importedFeature[1] !== ownFeature && importedFeature[2] && importedFeature[2] !== '/index') context.report({ node, messageId: 'feature' });
          if (ownFeature && (/\/src\/data\//.test(resolved) || source === 'expo-sqlite')) context.report({ node, messageId: 'data' });
          if (filename.includes('/src/app/') && /\/src\/(?:data|domain)\//.test(resolved)) context.report({ node, messageId: 'route' });
        },
      };
    },
  },
};
module.exports = { rules };
