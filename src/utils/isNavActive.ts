import { withBase } from './withBase';

export function isNavActive(path: string, currentPath: string): boolean {
  const normalized = withBase(path);

  if (path === '') {
    return currentPath === normalized || currentPath === `${normalized}/`;
  }

  return currentPath.startsWith(normalized);
}
