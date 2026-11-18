import path from 'node:path';

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function getRelativeSrcPath(filename) {
  const normalized = normalizePath(filename);
  const marker = '/src/';
  const index = normalized.lastIndexOf(marker);
  if (index === -1) {
    if (normalized.startsWith('src/')) {
      return normalized.slice(4);
    }
    return null;
  }
  return normalized.slice(index + marker.length);
}

function resolveImportTarget(relSrcPath, rawSource) {
  if (rawSource.startsWith('@/')) {
    return rawSource.slice(2);
  }
  if (rawSource.startsWith('.')) {
    const dir = path.posix.dirname(relSrcPath);
    return path.posix.normalize(path.posix.join(dir, rawSource));
  }
  return null;
}

function isServerOnlyTarget(rawSource, resolved) {
  if (rawSource === 'server-only') return true;
  if (!resolved) return false;
  return (
    /(?:^|\/)[^/]+\.server(?:\.ts)?$/.test(resolved) ||
    resolved.startsWith('features/') ||
    resolved === 'lib/supabase/server' ||
    resolved === 'lib/supabase/proxy' ||
    resolved === 'lib/supabase/service-role.server' ||
    resolved === 'config/environment.server'
  );
}

function isServiceRoleTarget(resolved) {
  return (
    resolved === 'lib/supabase/service-role.server' ||
    resolved === 'lib/supabase/service-role.server.ts'
  );
}

function classifyLayer(relSrcPath) {
  if (relSrcPath.startsWith('app/api/')) return 'api';
  if (relSrcPath.includes('/_components/')) return 'client-ui';
  if (
    relSrcPath.startsWith('components/') ||
    relSrcPath.startsWith('providers/')
  ) {
    return 'client-ui';
  }
  if (relSrcPath.startsWith('app/')) return 'rsc';
  if (relSrcPath.startsWith('hooks/queries/')) return 'query-hook';
  if (relSrcPath.startsWith('hooks/')) return 'hook';
  if (relSrcPath.startsWith('services/')) return 'service';
  if (relSrcPath.startsWith('realtime/')) return 'realtime';
  if (
    relSrcPath.startsWith('constants/') ||
    relSrcPath.startsWith('types/') ||
    relSrcPath.startsWith('utils/') ||
    relSrcPath.startsWith('validations/')
  ) {
    return 'pure';
  }
  if (relSrcPath.startsWith('features/')) return 'feature';
  if (relSrcPath.startsWith('stores/')) return 'store';
  if (relSrcPath.startsWith('lib/')) return 'lib';
  if (relSrcPath.startsWith('config/')) return 'config';
  return 'other';
}

function isBarrelFile(relSrcPath) {
  return /(?:^|\/)index\.tsx?$/.test(relSrcPath);
}

function isRepositoryServerFile(relSrcPath) {
  return /^features\/[^/]+\/repository\.server\.ts$/.test(relSrcPath);
}

function checkImport(context, node, rawSource, relSrcPath, layer) {
  const resolved = resolveImportTarget(relSrcPath, rawSource);

  // ADR-2: service-role.server.ts may ONLY be imported by src/features/*/repository.server.ts
  if (isServiceRoleTarget(resolved) && !isRepositoryServerFile(relSrcPath)) {
    context.report({
      node,
      message:
        'ADR-2 violation: service-role.server.ts may only be imported in src/features/<domain>/repository.server.ts.',
    });
    return;
  }

  // Barrel files may never re-export server-only modules
  if (isBarrelFile(relSrcPath) && isServerOnlyTarget(rawSource, resolved)) {
    context.report({
      node,
      message:
        'Server-only modules must never be exported through barrel index.ts files.',
    });
    return;
  }

  if (layer === 'rsc') {
    if (
      rawSource === 'axios' ||
      rawSource.startsWith('@supabase/') ||
      resolved?.startsWith('lib/supabase/') ||
      resolved === 'lib/axios' ||
      resolved?.startsWith('lib/axios/') ||
      resolved?.startsWith('services/') ||
      resolved?.startsWith('realtime/')
    ) {
      context.report({
        node,
        message: `RSC boundary violation: "${rawSource}" cannot be imported in app route/layout files.`,
      });
    }
    return;
  }

  if (layer === 'client-ui') {
    if (
      rawSource === 'axios' ||
      rawSource.startsWith('@supabase/') ||
      isServerOnlyTarget(rawSource, resolved) ||
      resolved === 'lib/axios' ||
      resolved?.startsWith('lib/axios/') ||
      resolved?.startsWith('lib/supabase/') ||
      resolved?.startsWith('services/') ||
      resolved?.startsWith('realtime/')
    ) {
      context.report({
        node,
        message: `Client UI boundary violation: "${rawSource}" cannot be imported in UI components or providers.`,
      });
    }
    return;
  }

  if (layer === 'query-hook' || layer === 'hook') {
    if (
      rawSource === 'axios' ||
      rawSource.startsWith('@supabase/') ||
      isServerOnlyTarget(rawSource, resolved) ||
      resolved === 'lib/axios' ||
      resolved?.startsWith('lib/axios/') ||
      resolved?.startsWith('lib/supabase/') ||
      resolved === 'hooks' ||
      resolved === 'hooks/index'
    ) {
      context.report({
        node,
        message: `Hook boundary violation: "${rawSource}" cannot be imported in hooks.`,
      });
      return;
    }
    if (layer === 'query-hook' && resolved?.startsWith('realtime/')) {
      context.report({
        node,
        message: `ADR-1 violation: "${rawSource}" cannot be imported in hooks/queries/*.`,
      });
    }
    return;
  }

  if (layer === 'service') {
    if (
      rawSource === 'axios' ||
      rawSource === '@tanstack/react-query' ||
      rawSource.startsWith('@supabase/') ||
      isServerOnlyTarget(rawSource, resolved) ||
      resolved?.startsWith('lib/supabase/') ||
      resolved?.startsWith('hooks/') ||
      resolved?.startsWith('components/') ||
      resolved?.startsWith('providers/') ||
      resolved?.startsWith('realtime/')
    ) {
      context.report({
        node,
        message: `Service boundary violation: "${rawSource}" cannot be imported in browser services.`,
      });
    }
    return;
  }

  if (layer === 'realtime') {
    const allowedInternal =
      resolved === 'lib/supabase/realtime-client' ||
      resolved?.startsWith('validations/') ||
      resolved?.startsWith('types/') ||
      resolved?.startsWith('constants/') ||
      resolved?.startsWith('utils/') ||
      resolved?.startsWith('realtime/');
    const forbiddenExternal =
      rawSource === 'axios' ||
      rawSource === '@tanstack/react-query' ||
      rawSource.startsWith('@supabase/') ||
      rawSource === 'server-only';

    if (forbiddenExternal || (resolved !== null && !allowedInternal)) {
      context.report({
        node,
        message: `ADR-1 violation: "${rawSource}" is not allowed inside src/realtime/*.`,
      });
    }
    return;
  }

  if (layer === 'pure') {
    if (
      rawSource === 'axios' ||
      rawSource === '@tanstack/react-query' ||
      rawSource.startsWith('@supabase/') ||
      isServerOnlyTarget(rawSource, resolved) ||
      resolved?.startsWith('hooks/') ||
      resolved?.startsWith('components/') ||
      resolved?.startsWith('providers/') ||
      resolved?.startsWith('services/') ||
      resolved?.startsWith('lib/') ||
      resolved?.startsWith('realtime/') ||
      resolved?.startsWith('stores/')
    ) {
      context.report({
        node,
        message: `Pure module boundary violation: "${rawSource}" cannot be imported in pure layers.`,
      });
    }
  }
}

export const architectureRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce layered architecture boundaries from Guide §2 and PRD §9 (ADR-1 & ADR-2).',
    },
    schema: [],
  },
  create(context) {
    const relSrcPath = getRelativeSrcPath(context.filename);
    if (!relSrcPath) return {};
    const layer = classifyLayer(relSrcPath);

    const forbidFetchLayers = new Set([
      'rsc',
      'client-ui',
      'hook',
      'query-hook',
      'service',
      'realtime',
      'pure',
    ]);

    return {
      Program(node) {
        if (
          relSrcPath.includes('/_components/') &&
          !relSrcPath.endsWith('.tsx')
        ) {
          context.report({
            node,
            message:
              'Files inside _components/ must be .tsx React components only; place helpers/types/hooks in utils/, types/, or hooks/.',
          });
        }
      },
      ImportDeclaration(node) {
        if (typeof node.source.value === 'string') {
          checkImport(context, node, node.source.value, relSrcPath, layer);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && typeof node.source.value === 'string') {
          checkImport(context, node, node.source.value, relSrcPath, layer);
        }
      },
      ExportAllDeclaration(node) {
        if (typeof node.source.value === 'string') {
          checkImport(context, node, node.source.value, relSrcPath, layer);
        }
      },
      ImportExpression(node) {
        if (
          node.source.type === 'Literal' &&
          typeof node.source.value === 'string'
        ) {
          checkImport(context, node, node.source.value, relSrcPath, layer);
        }
      },
      CallExpression(node) {
        if (
          forbidFetchLayers.has(layer) &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'fetch'
        ) {
          context.report({
            node,
            message: `Direct fetch() call is forbidden in layer "${layer}".`,
          });
        }
      },
    };
  },
};
