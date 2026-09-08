// tests/loader.mjs
// Custom resolver for Node ESM test execution
import { pathToFileURL } from 'node:url';
import { resolve as pathResolve } from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  // Mock @supabase/supabase-js when not installed in sandbox
  if (specifier === '@supabase/supabase-js') {
    const mockUrl = pathToFileURL(pathResolve(process.cwd(), 'tests/mockSupabase.mjs')).href;
    return {
      format: 'module',
      shortCircuit: true,
      url: mockUrl,
    };
  }

  // Resolve extensionless relative .ts files
  if (
    specifier.startsWith('.') &&
    !specifier.endsWith('.ts') &&
    !specifier.endsWith('.js') &&
    !specifier.endsWith('.json') &&
    !specifier.endsWith('.mjs')
  ) {
    try {
      const candidate = specifier + '.ts';
      return await nextResolve(candidate, context);
    } catch {
      try {
        const indexCandidate = specifier + '/index.ts';
        return await nextResolve(indexCandidate, context);
      } catch {}
    }
  }

  return nextResolve(specifier, context);
}
