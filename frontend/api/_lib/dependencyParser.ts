/**
 * Static import scanner for JS/TS/JSX/TSX files
 */
export function extractImportPaths(content: string): string[] {
  const importPaths: string[] = [];

  // Match: import ... from 'path' or import 'path'
  const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) importPaths.push(match[1]);
  }

  // Match: require('path')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    if (match[1]) importPaths.push(match[1]);
  }

  return importPaths;
}

/**
 * Maps relative import statements (e.g. "./utils", "../components/Button")
 * to actual file IDs in the repository file map.
 */
export function resolveDependencyIds(
  filePath: string,
  rawImports: string[],
  pathToIdMap: Map<string, string>
): string[] {
  const resolvedIds = new Set<string>();
  const currentDir = filePath.substring(0, filePath.lastIndexOf('/'));

  for (const imp of rawImports) {
    if (!imp.startsWith('.')) continue; // skip npm packages

    // Basic path resolution
    const parts = (currentDir ? currentDir + '/' + imp : imp).split('/');
    const resolvedParts: string[] = [];
    for (const part of parts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        resolvedParts.pop();
      } else {
        resolvedParts.push(part);
      }
    }
    const basePath = resolvedParts.join('/');

    // Check possible extension variations
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
    for (const ext of extensions) {
      const candidate = basePath + ext;
      const targetId = pathToIdMap.get(candidate);
      if (targetId) {
        resolvedIds.add(targetId);
        break;
      }
    }
  }

  return Array.from(resolvedIds);
}
