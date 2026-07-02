const baseRoot = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * @param path
 */
export function withBase(path: string): string {
  return `${baseRoot}/${path.replace(/^\//, '')}`;
}

/**
 * {@link withBase}
 * @param srcset
 */
export function withBaseSrcSet(srcset: string): string {
  return srcset
    .split(',')
    .map((entry) => {
      const [url, ...descriptorParts] = entry.trim().split(/\s+/);
      const descriptor = descriptorParts.join(' ');
      const resolved = withBase(url);

      return descriptor ? `${resolved} ${descriptor}` : resolved;
    })
    .join(', ');
}
